import { useCallback, useEffect, useRef, useState } from "react";
import { semanticDebugGroup, semanticDebugLog } from "./debug";
import { buildSemanticIndex, searchProductsByMeaning } from "./semanticSearch";
import {
  SemanticProductIndexItem,
  SemanticProductSearchResult,
  SemanticProductSource
} from "./semanticTypes";

const semanticHighlightLabels = [
  "Miglior match",
  "Molto coerente",
  "Buona corrispondenza"
];

const withSemanticHighlights = <TProduct extends SemanticProductSource>(
  results: SemanticProductSearchResult<TProduct>[]
) =>
  results.map((result, index) => ({
    ...result.product,
    ...(index < semanticHighlightLabels.length
      ? {
          _semanticHighlight: {
            rank: index + 1,
            label: semanticHighlightLabels[index],
            score: result.finalScore ?? result.score,
            semanticScore: result.semanticScore,
            businessBoost: result.businessBoost,
            matchedRules: result.matchedRules ?? []
          }
        }
      : {})
  }));

export const useSemanticProductSearch = <TProduct extends SemanticProductSource>(
  products: TProduct[] | null | undefined,
  options: {
    backendSearchUrl?: string;
    useBackendSearch?: boolean;
    onEmbeddingGenerated?: (payload: {
      product: TProduct;
      semanticText: string;
      embedding: number[];
    }) => Promise<void> | void;
  } = {}
) => {
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticIndex, setSemanticIndex] = useState<
    SemanticProductIndexItem<TProduct>[]
  >([]);
  const [semanticResults, setSemanticResults] = useState<
    SemanticProductSearchResult<TProduct>[]
  >([]);
  const [isIndexingSemanticProducts, setIsIndexingSemanticProducts] =
    useState(false);
  const [isSemanticSearchActive, setIsSemanticSearchActive] = useState(false);
  const indexedProductsSignatureRef = useRef<string>("");

  useEffect(() => {
    let ignore = false;

    const indexProducts = async () => {
      if (options.useBackendSearch) {
        semanticDebugLog(
          "Ricerca semantica backend attiva: salto indice frontend"
        );
        indexedProductsSignatureRef.current = "backend";
        setSemanticIndex([]);
        setSemanticResults([]);
        setIsIndexingSemanticProducts(false);
        return;
      }

      if (!products || products.length === 0) {
        semanticDebugLog("Nessun prodotto disponibile per l'indice");
        indexedProductsSignatureRef.current = "";
        setSemanticIndex([]);
        setSemanticResults([]);
        return;
      }

      const productsSignature = [
        products.length,
        products[0]?.productId ?? products[0]?.isin ?? "",
        products[products.length - 1]?.productId ??
          products[products.length - 1]?.isin ??
          "",
        products.filter(product => Array.isArray(product.semanticEmbedding)).length
      ].join("|");

      if (indexedProductsSignatureRef.current === productsSignature) {
        semanticDebugLog("Indice semantico gia' costruito, salto reindex", {
          productsSignature
        });
        return;
      }

      setIsIndexingSemanticProducts(true);
      const precomputedEmbeddings = products.filter(product =>
        Array.isArray(product.semanticEmbedding)
      ).length;
      const missingEmbeddings = products.length - precomputedEmbeddings;
      semanticDebugLog(
        missingEmbeddings === 0
          ? "Avvio ricostruzione indice FE da cache SQLite"
          : "Avvio indicizzazione FE con generazione embedding mancanti",
        {
          productsCount: products.length,
          precomputedEmbeddings,
          missingEmbeddings
        }
      );
      const nextIndex = await buildSemanticIndex(products, {
        onEmbeddingGenerated: options.onEmbeddingGenerated
      });

      if (!ignore) {
        indexedProductsSignatureRef.current = productsSignature;
        setSemanticIndex(nextIndex);
        setIsIndexingSemanticProducts(false);
        semanticDebugLog("Indicizzazione completata", nextIndex.length);
      }
    };

    indexProducts();

    return () => {
      ignore = true;
    };
  }, [options.onEmbeddingGenerated, options.useBackendSearch, products]);

  const searchSemantically = useCallback(async () => {
    const query = semanticQuery.trim();

    if (!query) {
      semanticDebugLog("Query vuota: reset ricerca semantica");
      setSemanticResults([]);
      setIsSemanticSearchActive(false);
      return;
    }

    if (options.useBackendSearch && options.backendSearchUrl) {
      semanticDebugLog("Avvio ricerca semantica backend da UI", query);
      const response = await fetch(options.backendSearchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, limit: 20 })
      });

      if (!response.ok) {
        throw new Error(`Semantic backend search failed: ${response.status}`);
      }

      const nextResults = await response.json();
      setSemanticResults(nextResults);
      setIsSemanticSearchActive(true);
      semanticDebugLog("Ricerca semantica backend completata", nextResults.length);
      semanticDebugGroup("Risultati ricerca semantica backend", () => {
        console.log("Query:", query);
        console.table(
          nextResults.map((result: SemanticProductSearchResult<TProduct>, position: number) => ({
            position: position + 1,
            semanticScore: Number((result.semanticScore ?? result.score).toFixed(4)),
            businessBoost: Number((result.businessBoost ?? 0).toFixed(4)),
            finalScore: Number((result.finalScore ?? result.score).toFixed(4)),
            matchedRules: result.matchedRules?.join(", "),
            productId: result.product.productId,
            isin: result.product.isin,
            name: result.product.name ?? result.product.productName,
            riskKiid: result.product.riskKiid,
            currency: result.product.currency,
            sustainable: result.product.sustainable,
            ecoSustainable: result.product.ecoSustainable,
            pai: result.product.pai,
            coupon: result.product.coupon
          }))
        );
        console.log("Risultati completi backend:", nextResults);
      });
      return;
    }

    semanticDebugLog("Avvio ricerca semantica da UI", query);
    const nextResults = await searchProductsByMeaning(query, semanticIndex);
    setSemanticResults(nextResults);
    setIsSemanticSearchActive(true);
    semanticDebugLog("Ricerca semantica completata", nextResults.length);
  }, [
    options.backendSearchUrl,
    options.useBackendSearch,
    semanticIndex,
    semanticQuery
  ]);

  useEffect(() => {
    if (!isSemanticSearchActive || !semanticQuery.trim()) return;

    if (options.useBackendSearch) return;

    searchProductsByMeaning(semanticQuery, semanticIndex).then(nextResults => {
      setSemanticResults(nextResults);
    });
  }, [
    isSemanticSearchActive,
    options.useBackendSearch,
    semanticIndex,
    semanticQuery
  ]);

  const clearSemanticSearch = useCallback(() => {
    setSemanticQuery("");
    setSemanticResults([]);
    setIsSemanticSearchActive(false);
  }, []);

  return {
    semanticQuery,
    setSemanticQuery,
    semanticResults,
    semanticProducts: withSemanticHighlights(semanticResults),
    isIndexingSemanticProducts,
    isSemanticSearchActive,
    searchSemantically,
    clearSemanticSearch
  };
};
