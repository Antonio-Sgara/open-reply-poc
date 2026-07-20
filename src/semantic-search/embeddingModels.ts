export type EmbeddingModelKey = "minilm" | "e5-small" | "distiluse";
export type EmbeddingPurpose = "query" | "document";

export interface EmbeddingModelConfig {
  key: EmbeddingModelKey;
  label: string;
  modelId: string;
  dtype: "q4";
  pooling: "mean";
  dimensions: number;
  queryPrefix: string;
  documentPrefix: string;
  version: string;
}

const createModelConfig = (
  config: Omit<EmbeddingModelConfig, "version">
): EmbeddingModelConfig => ({
  ...config,
  version: [
    "task:feature-extraction",
    `dtype:${config.dtype}`,
    `pooling:${config.pooling}`,
    "normalize:true",
    ...(config.queryPrefix ? [`queryPrefix:${config.queryPrefix}`] : []),
    ...(config.documentPrefix
      ? [`documentPrefix:${config.documentPrefix}`]
      : []),
    "semanticText:v1"
  ].join("|")
});

export const EMBEDDING_MODELS: EmbeddingModelConfig[] = [
  createModelConfig({
    key: "minilm",
    label: "MiniLM multilingual",
    modelId: "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
    dtype: "q4",
    pooling: "mean",
    dimensions: 384,
    queryPrefix: "",
    documentPrefix: ""
  }),
  createModelConfig({
    key: "e5-small",
    label: "Multilingual E5 small",
    modelId: "Xenova/multilingual-e5-small",
    dtype: "q4",
    pooling: "mean",
    dimensions: 384,
    queryPrefix: "query: ",
    documentPrefix: "passage: "
  }),
  createModelConfig({
    key: "distiluse",
    label: "DistilUSE multilingual",
    modelId: "Xenova/distiluse-base-multilingual-cased-v2",
    dtype: "q4",
    pooling: "mean",
    dimensions: 512,
    queryPrefix: "",
    documentPrefix: ""
  })
];

export const DEFAULT_EMBEDDING_MODEL_KEY: EmbeddingModelKey = "minilm";

export const getEmbeddingModel = (
  modelKey: EmbeddingModelKey = DEFAULT_EMBEDDING_MODEL_KEY
) =>
  EMBEDDING_MODELS.find(model => model.key === modelKey) ??
  EMBEDDING_MODELS[0];

export const prepareEmbeddingText = (
  text: string,
  model: EmbeddingModelConfig,
  purpose: EmbeddingPurpose
) => `${purpose === "query" ? model.queryPrefix : model.documentPrefix}${text}`;
