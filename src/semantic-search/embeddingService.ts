import { SemanticEmbedding } from "./semanticTypes";
import { semanticDebugGroup } from "./debug";

const EMBEDDING_SIZE = 128;

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

export const embedText = async (text: string): Promise<SemanticEmbedding> => {
  const embedding = Array.from({ length: EMBEDDING_SIZE }, () => 0);
  const tokens = tokenize(text);

  tokens.forEach(token => {
    const index = hashToken(token) % EMBEDDING_SIZE;
    embedding[index] += 1;
  });

  semanticDebugGroup("Embedding generato", () => {
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
