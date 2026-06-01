import { useCallback, useEffect, useState } from "react";
import { semanticDebugLog } from "./debug";
import { buildSemanticIndex, searchProductsByMeaning } from "./semanticSearch";
import {
  SemanticProductIndexItem,
  SemanticProductSearchResult,
  SemanticProductSource
} from "./semanticTypes";

export const useSemanticProductSearch = <TProduct extends SemanticProductSource>(
  products: TProduct[] | null | undefined
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

  useEffect(() => {
    let ignore = false;

    const indexProducts = async () => {
      if (!products || products.length === 0) {
        semanticDebugLog("Nessun prodotto disponibile per l'indice");
        setSemanticIndex([]);
        setSemanticResults([]);
        return;
      }

      setIsIndexingSemanticProducts(true);
      semanticDebugLog("Avvio indicizzazione prodotti", products.length);
      const nextIndex = await buildSemanticIndex(products);

      if (!ignore) {
        setSemanticIndex(nextIndex);
        setIsIndexingSemanticProducts(false);
        semanticDebugLog("Indicizzazione completata", nextIndex.length);
      }
    };

    indexProducts();

    return () => {
      ignore = true;
    };
  }, [products]);

  const searchSemantically = useCallback(async () => {
    const query = semanticQuery.trim();

    if (!query) {
      semanticDebugLog("Query vuota: reset ricerca semantica");
      setSemanticResults([]);
      setIsSemanticSearchActive(false);
      return;
    }

    semanticDebugLog("Avvio ricerca semantica da UI", query);
    const nextResults = await searchProductsByMeaning(query, semanticIndex);
    setSemanticResults(nextResults);
    setIsSemanticSearchActive(true);
    semanticDebugLog("Ricerca semantica completata", nextResults.length);
  }, [semanticIndex, semanticQuery]);

  useEffect(() => {
    if (!isSemanticSearchActive || !semanticQuery.trim()) return;

    searchProductsByMeaning(semanticQuery, semanticIndex).then(nextResults => {
      setSemanticResults(nextResults);
    });
  }, [isSemanticSearchActive, semanticIndex, semanticQuery]);

  const clearSemanticSearch = useCallback(() => {
    setSemanticQuery("");
    setSemanticResults([]);
    setIsSemanticSearchActive(false);
  }, []);

  return {
    semanticQuery,
    setSemanticQuery,
    semanticResults,
    semanticProducts: semanticResults.map(result => result.product),
    isIndexingSemanticProducts,
    isSemanticSearchActive,
    searchSemantically,
    clearSemanticSearch
  };
};
