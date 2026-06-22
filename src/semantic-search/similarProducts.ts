import {
  SemanticProductIndexItem,
  SemanticProductSource
} from "./semanticTypes";

export interface SimilarProductsIntent<TProduct = SemanticProductSource> {
  sourceQuery: string;
  constraintQuery?: string;
  sourceProduct?: SemanticProductIndexItem<TProduct>;
  sourceCandidates: SimilarProductsSourceCandidate<TProduct>[];
  ambiguousSource: boolean;
}

export interface SimilarProductsSourceCandidate<TProduct = SemanticProductSource> {
  productId: string;
  isin?: string;
  name?: string;
  score: number;
  product: TProduct;
}

const AMBIGUOUS_SOURCE_SCORE_DISTANCE = 10;
const ISIN_PATTERN = /^[a-z]{2}[a-z0-9]{10}$/i;

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

const splitSourceAndConstraint = (sourceQuery: string) => {
  const normalizedSourceQuery = normalizeText(sourceQuery);
  const [sourceBeforeMa, ...constraintAfterMa] = normalizedSourceQuery.split(/\s+ma\s+/);

  if (constraintAfterMa.length > 0) {
    return {
      sourceQuery: sourceBeforeMa.trim(),
      constraintQuery: constraintAfterMa.join(" ma ").trim()
    };
  }

  const [firstToken, ...restTokens] = normalizedSourceQuery
    .split(/\s+/)
    .filter(Boolean);
  if (firstToken && ISIN_PATTERN.test(firstToken) && restTokens.length > 0) {
    return {
      sourceQuery: firstToken,
      constraintQuery: restTokens.join(" ")
    };
  }

  return {
    sourceQuery: normalizedSourceQuery,
    constraintQuery: undefined
  };
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
  const extractedSourceQuery = extractSimilarProductsSourceQuery(query);
  if (!extractedSourceQuery) return undefined;

  const { sourceQuery, constraintQuery } =
    splitSourceAndConstraint(extractedSourceQuery);
  const normalizedSourceQuery = normalizeText(sourceQuery);
  const isIsinSourceQuery = ISIN_PATTERN.test(normalizedSourceQuery);

  const sourceCandidates = index
    .map(indexItem => ({
      indexItem,
      score: scoreSourceProductMatch(sourceQuery, indexItem)
    }))
    .filter(item => {
      if (!isIsinSourceQuery) return item.score > 0;
      return normalizeText(item.indexItem.product.isin ?? "") === normalizedSourceQuery;
    })
    .sort((first, second) => second.score - first.score)
    .map(item => ({
      productId: item.indexItem.productId,
      isin: item.indexItem.product.isin,
      name: item.indexItem.product.name ?? item.indexItem.product.productName,
      score: item.score,
      product: item.indexItem.product,
      indexItem: item.indexItem
    }));

  const [sourceProduct] = sourceCandidates;
  const ambiguousSource =
    sourceCandidates.length > 1 &&
    sourceCandidates[0].score - sourceCandidates[1].score <=
      AMBIGUOUS_SOURCE_SCORE_DISTANCE;

  return {
    sourceQuery,
    constraintQuery,
    sourceProduct: sourceProduct?.indexItem,
    sourceCandidates,
    ambiguousSource
  };
};
