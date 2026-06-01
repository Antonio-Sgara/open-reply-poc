import { buildProductSemanticText } from "./buildProductSemanticText";
import { semanticDebugGroup, semanticDebugLog } from "./debug";
import { embedText } from "./embeddingService";
import { cosineSimilarity } from "./similarity";
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
  const queryEmbedding = await embedText(normalizedQuery);

  const scoredResults = index
    .map(indexItem => ({
      product: indexItem.product,
      score: cosineSimilarity(queryEmbedding, indexItem.embedding),
      semanticText: indexItem.semanticText
    }))
    .filter(result => result.score > 0)
    .sort((first, second) => second.score - first.score);

  const limitedResults = scoredResults.slice(0, limit);

  semanticDebugGroup("Risultati ricerca semantica", () => {
    console.log("Query:", normalizedQuery);
    console.log("Prodotti nell'indice:", index.length);
    console.log("Limite risultati:", limit);
    console.table(
      limitedResults.map((result, position) => ({
        position: position + 1,
        score: Number(result.score.toFixed(4)),
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
    .map(indexItem => ({
      product: indexItem.product,
      score: cosineSimilarity(sourceProduct.embedding, indexItem.embedding),
      semanticText: indexItem.semanticText
    }))
    .filter(result => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);
};
