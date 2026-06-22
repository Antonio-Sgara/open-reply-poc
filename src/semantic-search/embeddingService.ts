import { SemanticEmbedding } from "./semanticTypes";
import { semanticDebugGroup, semanticDebugLog } from "./debug";

const EMBEDDING_SIZE = 128;
export const EMBEDDING_MODEL_ID =
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const EMBEDDING_MODEL_DTYPE = "q4";

type FeatureExtractionPipeline = (
  text: string,
  options?: { pooling?: "mean"; normalize?: boolean }
) => Promise<unknown>;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;
let isModelUnavailable = false;
let hasLoggedModelFallback = false;
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

const getExtractor = async () => {
  if (!extractorPromise) {
    semanticDebugLog("Caricamento modello embedding reale", {
      provider: "@huggingface/transformers",
      model: EMBEDDING_MODEL_ID,
      dtype: EMBEDDING_MODEL_DTYPE,
      task: "feature-extraction"
    });

    extractorPromise = import("@huggingface/transformers").then(
      ({ pipeline }) =>
        pipeline("feature-extraction", EMBEDDING_MODEL_ID, {
          dtype: EMBEDDING_MODEL_DTYPE
        }) as Promise<FeatureExtractionPipeline>
    );
  }

  return extractorPromise;
};

const tensorToEmbedding = (output: any): SemanticEmbedding => {
  if (output?.data) {
    return Array.from(output.data, Number);
  }

  if (typeof output?.tolist === "function") {
    const list = output.tolist();
    return Array.isArray(list?.[0])
      ? list[0].map(Number)
      : list.map(Number);
  }

  if (Array.isArray(output?.[0])) {
    return output[0].map(Number);
  }

  if (Array.isArray(output)) {
    return output.map(Number);
  }

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

const embedTextWithModel = async (text: string): Promise<SemanticEmbedding> => {
  const extractor = await getExtractor();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });
  const embedding = tensorToEmbedding(output);

  semanticDebugGroup("Embedding reale generato", () => {
    console.log("Provider:", "@huggingface/transformers");
    console.log("Modello:", EMBEDDING_MODEL_ID);
    console.log("Quantizzazione:", EMBEDDING_MODEL_DTYPE);
    console.log("Input testo:", text);
    console.log("Dimensione vettore:", embedding.length);
    console.log("Prime dimensioni:", embedding.slice(0, 12));
  });

  return embedding;
};

export const embedText = async (text: string): Promise<SemanticEmbedding> => {
  const cacheKey = text.trim();

  if (!embeddingCache.has(cacheKey)) {
    const embeddingPromise = isModelUnavailable
      ? embedTextWithMockFallback(cacheKey)
      : embedTextWithModel(cacheKey).catch(error => {
          isModelUnavailable = true;

          if (!hasLoggedModelFallback) {
            hasLoggedModelFallback = true;

            semanticDebugGroup("Fallback embedding mock", () => {
              console.warn(
                "Impossibile generare embedding reale, uso fallback mock.",
                error
              );
              console.log("Modello richiesto:", EMBEDDING_MODEL_ID);
              console.log("Input testo:", cacheKey);
            });
          }

          return embedTextWithMockFallback(cacheKey);
        });

    embeddingCache.set(cacheKey, embeddingPromise);
  }

  return embeddingCache.get(cacheKey)!;
};
