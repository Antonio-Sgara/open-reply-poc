import { buildProductSemanticText } from "./buildProductSemanticText";
import { calculateBusinessRanking } from "./businessRanking";
import { semanticDebugGroup, semanticDebugLog } from "./debug";
import { embedText } from "./embeddingService";
import { cosineSimilarity } from "./similarity";
import { resolveSimilarProductsIntent } from "./similarProducts";
import {
  SemanticProductIndexItem,
  SemanticProductSearchResult,
  SemanticProductSource
} from "./semanticTypes";

const DEFAULT_INDEX_BATCH_SIZE = 10;
const DEFAULT_INDEX_BATCH_PAUSE_MS = 20;

const yieldToBrowser = (pauseMs = DEFAULT_INDEX_BATCH_PAUSE_MS) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, pauseMs);
  });

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const calculateRelativeRiskBoost = (
  constraintQuery: string | undefined,
  sourceProduct: SemanticProductSource,
  product: SemanticProductSource,
  matchedRules: string[]
) => {
  if (
    typeof sourceProduct.riskKiid !== "number" ||
    typeof product.riskKiid !== "number" ||
    !constraintQuery
  ) {
    return 0;
  }

  const normalizedConstraintQuery = normalizeText(constraintQuery);
  const asksLessRisk =
    normalizedConstraintQuery.includes("meno risch") ||
    normalizedConstraintQuery.includes("rischio minore") ||
    normalizedConstraintQuery.includes("piu prudent") ||
    normalizedConstraintQuery.includes("piu difensiv");
  const asksMoreRisk =
    normalizedConstraintQuery.includes("piu risch") ||
    normalizedConstraintQuery.includes("rischio maggiore") ||
    normalizedConstraintQuery.includes("piu dinamic") ||
    normalizedConstraintQuery.includes("piu aggressiv");

  if (asksLessRisk) {
    if (product.riskKiid < sourceProduct.riskKiid) {
      const boost = (sourceProduct.riskKiid - product.riskKiid) * 0.12;
      matchedRules.push(`riskKiid lower than source ${sourceProduct.riskKiid}`);
      return boost;
    }

    if (product.riskKiid > sourceProduct.riskKiid) {
      const penalty = (product.riskKiid - sourceProduct.riskKiid) * -0.12;
      matchedRules.push(`riskKiid higher than source penalty ${sourceProduct.riskKiid}`);
      return penalty;
    }
  }

  if (asksMoreRisk) {
    if (product.riskKiid > sourceProduct.riskKiid) {
      const boost = (product.riskKiid - sourceProduct.riskKiid) * 0.12;
      matchedRules.push(`riskKiid higher than source ${sourceProduct.riskKiid}`);
      return boost;
    }

    if (product.riskKiid < sourceProduct.riskKiid) {
      const penalty = (sourceProduct.riskKiid - product.riskKiid) * -0.12;
      matchedRules.push(`riskKiid lower than source penalty ${sourceProduct.riskKiid}`);
      return penalty;
    }
  }

  return 0;
};

export const buildSemanticIndex = async <TProduct extends SemanticProductSource>(
  products: TProduct[],
  options: {
    batchSize?: number;
    batchPauseMs?: number;
    onEmbeddingGenerated?: (payload: {
      product: TProduct;
      semanticText: string;
      embedding: number[];
    }) => Promise<void> | void;
  } = {}
): Promise<SemanticProductIndexItem<TProduct>[]> => {
  const batchSize = options.batchSize ?? DEFAULT_INDEX_BATCH_SIZE;
  const batchPauseMs = options.batchPauseMs ?? DEFAULT_INDEX_BATCH_PAUSE_MS;
  const precomputedEmbeddings = products.filter(product =>
    Array.isArray(product.semanticEmbedding)
  ).length;
  const missingEmbeddings = products.length - precomputedEmbeddings;
  semanticDebugLog("Costruzione indice prodotti", {
    productsCount: products.length,
    source:
      missingEmbeddings === 0
        ? "cache SQLite: ricostruzione indice FE in memoria"
        : "Transformers.js FE: generazione embedding mancanti",
    precomputedEmbeddings,
    missingEmbeddings,
    batchSize,
    batchPauseMs
  });

  const index: SemanticProductIndexItem<TProduct>[] = [];
  let generatedEmbeddings = 0;

  for (const [position, product] of products.entries()) {
    const {
      semanticEmbedding,
      semanticText: precomputedSemanticText,
      semanticEmbeddingGeneratedAt,
      semanticEmbeddingModel,
      semanticEmbeddingModelVersion,
      ...productWithoutEmbedding
    } = product;
    const semanticText =
      precomputedSemanticText ?? buildProductSemanticText(product);
    const hasPrecomputedEmbedding = Array.isArray(semanticEmbedding);
    const embedding = hasPrecomputedEmbedding
      ? semanticEmbedding
      : await embedText(semanticText);

    if (!hasPrecomputedEmbedding) {
      generatedEmbeddings += 1;
      options.onEmbeddingGenerated?.({
        product,
        semanticText,
        embedding
      });
    }

    index.push({
      productId: `${product.productId ?? product.isin ?? product.name ?? ""}`,
      semanticText,
      embedding,
      product: productWithoutEmbedding as TProduct
    });

    const indexedProducts = position + 1;
    if (indexedProducts % 25 === 0 || indexedProducts === products.length) {
      semanticDebugLog("Avanzamento indice prodotti", {
        indexedProducts,
        productsCount: products.length,
        generatedEmbeddings
      });
    }

    if (
      generatedEmbeddings > 0 &&
      generatedEmbeddings % batchSize === 0 &&
      indexedProducts < products.length
    ) {
      semanticDebugLog("Pausa indicizzazione FE per mantenere UI reattiva", {
        generatedEmbeddings,
        indexedProducts,
        pauseMs: batchPauseMs
      });
      await yieldToBrowser(batchPauseMs);
    }
  }

  semanticDebugGroup("Indice prodotti costruito", () => {
    console.log("Prodotti indicizzati:", index.length);
    console.log("Origine indice:", missingEmbeddings === 0 ? "cache SQLite" : "mista");
    console.log("Embedding precomputati:", precomputedEmbeddings);
    console.log("Embedding generati nel FE:", generatedEmbeddings);
    console.table(
      index.slice(0, 20).map(item => ({
        productId: item.productId,
        name: item.product.name ?? item.product.productName,
        riskKiid: item.product.riskKiid,
        currency: item.product.currency,
        sustainable: item.product.sustainable,
        coupon: item.product.coupon
      }))
    );
    console.log(
      "Esempi testi semantici:",
      index.slice(0, 3).map(item => ({
        productId: item.productId,
        semanticText: item.semanticText,
        embeddingDimensions: item.embedding.length
      }))
    );
  });

  return index;
};

export const searchProductsByMeaning = async <
  TProduct extends SemanticProductSource
>(
  query: string,
  index: SemanticProductIndexItem<TProduct>[],
  limit = 20
): Promise<SemanticProductSearchResult<TProduct>[]> => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  semanticDebugLog("Query utente ricevuta", normalizedQuery);

  const similarProductsIntent = resolveSimilarProductsIntent(
    normalizedQuery,
    index
  );

  if (similarProductsIntent) {
    if (!similarProductsIntent.sourceProduct) {
      semanticDebugGroup("Prodotto sorgente non trovato", () => {
        console.log("Query:", normalizedQuery);
        console.log("Ricerca sorgente:", similarProductsIntent.sourceQuery);
        console.log("Mode:", "similar-products");
        console.log("Sorgente ambigua:", similarProductsIntent.ambiguousSource);
        console.table(similarProductsIntent.sourceCandidates);
        console.log("Risultati:", []);
      });

      return [];
    }

    const similarResults = findSimilarProducts(
      similarProductsIntent.sourceProduct.productId,
      index,
      limit,
      similarProductsIntent.constraintQuery
    );

    semanticDebugGroup("Risultati prodotti simili", () => {
      console.log("Query:", normalizedQuery);
      console.log("Ricerca sorgente:", similarProductsIntent.sourceQuery);
      console.log(
        "Vincoli aggiuntivi:",
        similarProductsIntent.constraintQuery ?? "nessuno"
      );
      console.log("Sorgente ambigua:", similarProductsIntent.ambiguousSource);
      console.table(
        similarProductsIntent.sourceCandidates.map(candidate => ({
          productId: candidate.productId,
          isin: candidate.isin,
          name: candidate.name,
          matchScore: candidate.score
        }))
      );
      console.log("Prodotto sorgente:", {
        productId: similarProductsIntent.sourceProduct.productId,
        name:
          similarProductsIntent.sourceProduct.product.name ??
          similarProductsIntent.sourceProduct.product.productName,
        isin: similarProductsIntent.sourceProduct.product.isin,
        riskKiid: similarProductsIntent.sourceProduct.product.riskKiid,
        currency: similarProductsIntent.sourceProduct.product.currency
      });
      console.table(
        similarResults.map((result, position) => ({
          position: position + 1,
          similarityScore: Number((result.semanticScore ?? result.score).toFixed(4)),
          businessBoost: Number((result.businessBoost ?? 0).toFixed(4)),
          finalScore: Number((result.finalScore ?? result.score).toFixed(4)),
          matchedRules: result.matchedRules?.join(", "),
          productId: result.product.productId,
          name: result.product.name ?? result.product.productName,
          riskKiid: result.product.riskKiid,
          currency: result.product.currency,
          sustainable: result.product.sustainable,
          ecoSustainable: result.product.ecoSustainable,
          pai: result.product.pai,
          coupon: result.product.coupon
        }))
      );
      console.log("Risultati completi prodotti simili:", similarResults);
    });

    return similarResults;
  }

  const queryEmbedding = await embedText(normalizedQuery);

  const scoredResults = index
    .map(indexItem => {
      const semanticScore = cosineSimilarity(queryEmbedding, indexItem.embedding);
      const { businessBoost, matchedRules } = calculateBusinessRanking(
        normalizedQuery,
        indexItem.product
      );
      const finalScore = semanticScore + businessBoost;

      return {
        product: indexItem.product,
        score: finalScore,
        semanticScore,
        businessBoost,
        finalScore,
        matchedRules,
        semanticText: indexItem.semanticText
      };
    })
    .filter(result => result.finalScore > 0)
    .sort((first, second) => {
      if (second.finalScore !== first.finalScore) {
        return second.finalScore - first.finalScore;
      }

      return second.semanticScore - first.semanticScore;
    });

  const limitedResults = scoredResults.slice(0, limit);

  semanticDebugGroup("Risultati ricerca semantica", () => {
    console.log("Query:", normalizedQuery);
    console.log("Prodotti nell'indice:", index.length);
    console.log("Limite risultati:", limit);
    console.table(
      limitedResults.map((result, position) => ({
        position: position + 1,
        semanticScore: Number(result.semanticScore.toFixed(4)),
        businessBoost: Number(result.businessBoost.toFixed(4)),
        finalScore: Number(result.finalScore.toFixed(4)),
        matchedRules: result.matchedRules.join(", "),
        productId: result.product.productId,
        name: result.product.name ?? result.product.productName,
        riskKiid: result.product.riskKiid,
        currency: result.product.currency,
        sustainable: result.product.sustainable,
        ecoSustainable: result.product.ecoSustainable,
        pai: result.product.pai,
        coupon: result.product.coupon
      }))
    );
    console.log("Risultati completi con testo semantico:", limitedResults);
  });

  return limitedResults;
};

export const findSimilarProducts = <TProduct extends SemanticProductSource>(
  productId: string | number,
  index: SemanticProductIndexItem<TProduct>[],
  limit = 10,
  constraintQuery?: string
): SemanticProductSearchResult<TProduct>[] => {
  const sourceProduct = index.find(item => item.productId === `${productId}`);
  if (!sourceProduct) return [];

  return index
    .filter(item => item.productId !== sourceProduct.productId)
    .map(indexItem => {
      const similarityScore = cosineSimilarity(
        sourceProduct.embedding,
        indexItem.embedding
      );
      const businessRanking = constraintQuery
        ? calculateBusinessRanking(constraintQuery, indexItem.product)
        : { businessBoost: 0, matchedRules: [] };
      const matchedRules = [
        `similar to ${sourceProduct.productId}`,
        ...businessRanking.matchedRules
      ];
      const relativeRiskBoost = calculateRelativeRiskBoost(
        constraintQuery,
        sourceProduct.product,
        indexItem.product,
        matchedRules
      );
      const businessBoost = businessRanking.businessBoost + relativeRiskBoost;
      const finalScore = similarityScore + businessBoost;

      return {
        product: indexItem.product,
        score: finalScore,
        semanticScore: similarityScore,
        businessBoost,
        finalScore,
        matchedRules,
        semanticText: indexItem.semanticText
      };
    })
    .filter(result => result.score > 0)
    .sort((first, second) => {
      if ((second.finalScore ?? second.score) !== (first.finalScore ?? first.score)) {
        return (second.finalScore ?? second.score) - (first.finalScore ?? first.score);
      }

      return (second.semanticScore ?? 0) - (first.semanticScore ?? 0);
    })
    .slice(0, limit);
};
