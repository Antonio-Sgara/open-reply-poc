export type SemanticEmbedding = number[];

export interface SemanticProductSource {
  productId?: string | number;
  isin?: string;
  name?: string;
  productName?: string;
  caaFirstLevelType?: string;
  managementCompany?: string;
  sicav?: string;
  productType?: string;
  commercialAssetFirstLevel?: string;
  commercialAssetSecondLevel?: string;
  commercialAssetThirdLevel?: string;
  bestInClass?: boolean;
  riskKiid?: number;
  currency?: string;
  coupon?: boolean;
  preferred?: boolean;
  pai?: boolean;
  isPlaced?: boolean;
  sustainable?: boolean;
  ecoSustainable?: boolean;
  bicType?: string;
}

export interface SemanticProductIndexItem<TProduct = SemanticProductSource> {
  productId: string;
  semanticText: string;
  embedding: SemanticEmbedding;
  product: TProduct;
}

export interface SemanticProductSearchResult<TProduct = SemanticProductSource> {
  product: TProduct;
  score: number;
  semanticText: string;
}
