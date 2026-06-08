import {
  SemanticProductIndexItem,
  SemanticProductSource
} from "./semanticTypes";

export interface SimilarProductsIntent<TProduct = SemanticProductSource> {
  sourceQuery: string;
  sourceProduct: SemanticProductIndexItem<TProduct>;
}

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenize = (text: string) => normalizeText(text).split(/\s+/).filter(Boolean);

export const extractSimilarProductsSourceQuery = (query: string) => {
  const normalizedQuery = normalizeText(query);
  const patterns = [
    /\b(?:prodotti|fondi)?\s*simili\s+a\s+(.+)$/,
    /\b(?:prodotti|fondi)?\s*simile\s+a\s+(.+)$/,
    /\b(?:trova|trovami|cerca|cercami)\s+(?:prodotti|fondi)?\s*simili\s+a\s+(.+)$/,
    /\b(?:trova|trovami|cerca|cercami)\s+(?:prodotti|fondi)?\s*simile\s+a\s+(.+)$/
  ];

  for (const pattern of patterns) {
    const match = normalizedQuery.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return undefined;
};

const getProductSearchText = (product: SemanticProductSource) =>
  normalizeText(
    [
      product.productId,
      product.isin,
      product.name,
      product.productName,
      product.managementCompany,
      product.commercialAssetFirstLevel,
      product.commercialAssetSecondLevel,
      product.commercialAssetThirdLevel
    ]
      .filter(Boolean)
      .join(" ")
  );

const scoreSourceProductMatch = (
  sourceQuery: string,
  indexItem: SemanticProductIndexItem
) => {
  const normalizedSourceQuery = normalizeText(sourceQuery);
  const product = indexItem.product;
  const productSearchText = getProductSearchText(product);
  const productName = normalizeText(product.name ?? product.productName ?? "");
  const productIsin = normalizeText(product.isin ?? "");
  const productId = normalizeText(`${product.productId ?? ""}`);
  const sourceTokens = tokenize(sourceQuery);

  let score = 0;

  if (productIsin && productIsin === normalizedSourceQuery) score += 100;
  if (productId && productId === normalizedSourceQuery) score += 95;
  if (productName === normalizedSourceQuery) score += 90;
  if (productName.includes(normalizedSourceQuery)) score += 70;
  if (productSearchText.includes(normalizedSourceQuery)) score += 45;

  sourceTokens.forEach(token => {
    if (productName.includes(token)) score += 12;
    else if (productSearchText.includes(token)) score += 5;
  });

  return score;
};

export const resolveSimilarProductsIntent = <
  TProduct extends SemanticProductSource
>(
  query: string,
  index: SemanticProductIndexItem<TProduct>[]
): SimilarProductsIntent<TProduct> | undefined => {
  const sourceQuery = extractSimilarProductsSourceQuery(query);
  if (!sourceQuery) return undefined;

  const [sourceProduct] = index
    .map(indexItem => ({
      indexItem,
      score: scoreSourceProductMatch(sourceQuery, indexItem)
    }))
    .filter(item => item.score > 0)
    .sort((first, second) => second.score - first.score);

  if (!sourceProduct) return undefined;

  return {
    sourceQuery,
    sourceProduct: sourceProduct.indexItem
  };
};
