import { SemanticEmbedding } from "./semanticTypes";
import { semanticDebugGroup, semanticDebugLog } from "./debug";
import {
  DEFAULT_EMBEDDING_MODEL_KEY,
  EmbeddingModelKey,
  EmbeddingPurpose,
  getEmbeddingModel,
  prepareEmbeddingText
} from "./embeddingModels";

const EMBEDDING_SIZE = 128;
const defaultModel = getEmbeddingModel();
export const EMBEDDING_MODEL_ID = defaultModel.modelId;
export const EMBEDDING_MODEL_VERSION = defaultModel.version;

type FeatureExtractionPipeline = (
  text: string,
  options?: { pooling?: "mean"; normalize?: boolean }
) => Promise<unknown>;

const extractorPromises = new Map<
  EmbeddingModelKey,
  Promise<FeatureExtractionPipeline>
>();
const unavailableModels = new Set<EmbeddingModelKey>();
const loggedModelFallbacks = new Set<EmbeddingModelKey>();
let generatedModelEmbeddingLogs = 0;
const embeddingCache = new Map<string, Promise<SemanticEmbedding>>();

const SYNONYMS: Record<string, string[]> = {
  prudente: ["prudente", "difensivo", "conservativo", "basso", "contenuto"],
  moderato: ["moderato", "medio", "bilanciato"],
  dinamico: ["dinamico", "aggressivo", "alto"],
  sostenibile: ["sostenibile", "sostenibilita", "esg", "eco", "pai"],
  cedola: ["cedola", "cedolare", "distribuzione"],
  obbligazionario: ["obbligazionario", "bond", "corporate", "rent"],
  azionario: ["azionario", "azioni", "equity", "aktien", "active", "regions"],
  euro: ["euro", "eur"],
  fondo: ["fondo", "fondi", "fund", "mutual"]
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenize = (text: string) => {
  const normalizedText = normalizeText(text);
  const tokens = normalizedText.split(/\s+/).filter(Boolean);

  Object.entries(SYNONYMS).forEach(([semanticToken, variants]) => {
    if (variants.some(variant => tokens.includes(variant))) {
      tokens.push(semanticToken);
    }
  });

  return tokens;
};

const hashToken = (token: string) => {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const getExtractor = async (modelKey: EmbeddingModelKey) => {
  const model = getEmbeddingModel(modelKey);

  if (!extractorPromises.has(modelKey)) {
    semanticDebugLog("Caricamento modello embedding reale", {
      provider: "@huggingface/transformers",
      modelKey,
      model: model.modelId,
      dtype: model.dtype,
      task: "feature-extraction"
    });

    extractorPromises.set(modelKey, import("@huggingface/transformers").then(
      ({ pipeline }) =>
        pipeline("feature-extraction", model.modelId, {
          dtype: model.dtype
        }) as Promise<FeatureExtractionPipeline>
    ));
  }

  return extractorPromises.get(modelKey)!;
};

const toNumberArray = (value: unknown): SemanticEmbedding | null => {
  if (!Array.isArray(value)) return null;

  const values = Array.isArray(value[0]) ? value[0] : value;
  return values.map(Number);
};

const tensorToEmbedding = (output: unknown): SemanticEmbedding => {
  if (typeof output === "object" && output !== null) {
    const tensor = output as { data?: unknown; tolist?: unknown };

    if (Array.isArray(tensor.data) || ArrayBuffer.isView(tensor.data)) {
      return Array.from(tensor.data as ArrayLike<number>, Number);
    }

    if (typeof tensor.tolist === "function") {
      const embedding = toNumberArray(tensor.tolist());
      if (embedding) return embedding;
    }
  }

  const embedding = toNumberArray(output);
  if (embedding) return embedding;

  throw new Error("Formato embedding non riconosciuto");
};

const embedTextWithMockFallback = async (
  text: string
): Promise<SemanticEmbedding> => {
  const embedding = Array.from({ length: EMBEDDING_SIZE }, () => 0);
  const tokens = tokenize(text);

  tokens.forEach(token => {
    const index = hashToken(token) % EMBEDDING_SIZE;
    embedding[index] += 1;
  });

  semanticDebugGroup("Embedding mock fallback generato", () => {
    console.log("Input testo:", text);
    console.log("Token:", tokens);
    console.log(
      "Dimensioni attive:",
      embedding
        .map((value, index) => ({ index, value }))
        .filter(item => item.value > 0)
    );
  });

  return embedding;
};

const embedTextWithModel = async (
  text: string,
  modelKey: EmbeddingModelKey,
  purpose: EmbeddingPurpose
): Promise<SemanticEmbedding> => {
  const model = getEmbeddingModel(modelKey);
  const extractor = await getExtractor(modelKey);
  const preparedText = prepareEmbeddingText(text, model, purpose);
  const output = await extractor(preparedText, {
    pooling: model.pooling,
    normalize: true
  });
  const embedding = tensorToEmbedding(output);
  generatedModelEmbeddingLogs += 1;

  if (
    generatedModelEmbeddingLogs <= 3 ||
    generatedModelEmbeddingLogs % 25 === 0
  ) {
    semanticDebugGroup("Embedding reale generato", () => {
      console.log("Progressivo embedding modello:", generatedModelEmbeddingLogs);
      console.log("Provider:", "@huggingface/transformers");
      console.log("Modello:", model.modelId);
      console.log("Quantizzazione:", model.dtype);
      console.log("Scopo:", purpose);
      console.log("Input testo:", text);
      console.log("Input preparato:", preparedText);
      console.log("Dimensione vettore:", embedding.length);
      console.log("Prime dimensioni:", embedding.slice(0, 12));
    });
  }

  return embedding;
};

export const embedText = async (
  text: string,
  options: {
    modelKey?: EmbeddingModelKey;
    purpose?: EmbeddingPurpose;
  } = {}
): Promise<SemanticEmbedding> => {
  const modelKey = options.modelKey ?? DEFAULT_EMBEDDING_MODEL_KEY;
  const purpose = options.purpose ?? "query";
  const model = getEmbeddingModel(modelKey);
  const normalizedText = text.trim();
  const cacheKey = `${modelKey}|${purpose}|${normalizedText}`;

  if (!embeddingCache.has(cacheKey)) {
    const embeddingPromise = unavailableModels.has(modelKey)
      ? embedTextWithMockFallback(normalizedText)
      : embedTextWithModel(normalizedText, modelKey, purpose).catch(error => {
          unavailableModels.add(modelKey);

          if (!loggedModelFallbacks.has(modelKey)) {
            loggedModelFallbacks.add(modelKey);

            semanticDebugGroup("Fallback embedding mock", () => {
              console.warn(
                "Impossibile generare embedding reale, uso fallback mock.",
                error
              );
              console.log("Modello richiesto:", model.modelId);
              console.log("Input testo:", normalizedText);
            });
          }

          return embedTextWithMockFallback(normalizedText);
        });

    embeddingCache.set(cacheKey, embeddingPromise);
  }

  return embeddingCache.get(cacheKey)!;
};
