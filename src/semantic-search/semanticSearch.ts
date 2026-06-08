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

export const buildSemanticIndex = async <TProduct extends SemanticProductSource>(
  products: TProduct[]
): Promise<SemanticProductIndexItem<TProduct>[]> => {
  semanticDebugLog("Costruzione indice prodotti", {
    productsCount: products.length
  });

  const index = await Promise.all(
    products.map(async product => {
      const semanticText = buildProductSemanticText(product);

      return {
        productId: `${product.productId ?? product.isin ?? product.name ?? ""}`,
        semanticText,
        embedding: await embedText(semanticText),
        product
      };
    })
  );

  semanticDebugGroup("Indice prodotti costruito", () => {
    console.table(
      index.map(item => ({
        productId: item.productId,
        name: item.product.name ?? item.product.productName,
        riskKiid: item.product.riskKiid,
        currency: item.product.currency,
        sustainable: item.product.sustainable,
        coupon: item.product.coupon
      }))
    );
    console.log("Dettaglio testi semantici:", index);
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
    const similarResults = findSimilarProducts(
      similarProductsIntent.sourceProduct.productId,
      index,
      limit
    );

    semanticDebugGroup("Risultati prodotti simili", () => {
      console.log("Query:", normalizedQuery);
      console.log("Ricerca sorgente:", similarProductsIntent.sourceQuery);
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
          similarityScore: Number(result.score.toFixed(4)),
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
  limit = 10
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

      return {
        product: indexItem.product,
        score: similarityScore,
        semanticScore: similarityScore,
        businessBoost: 0,
        finalScore: similarityScore,
        matchedRules: [`similar to ${sourceProduct.productId}`],
        semanticText: indexItem.semanticText
      };
    })
    .filter(result => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);
};
