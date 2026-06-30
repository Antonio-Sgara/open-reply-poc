import { createHash } from "node:crypto";

export const EMBEDDING_MODEL_ID =
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const EMBEDDING_MODEL_DTYPE = "q4";
export const EMBEDDING_MODEL_VERSION = [
  "task:feature-extraction",
  `dtype:${EMBEDDING_MODEL_DTYPE}`,
  "pooling:mean",
  "normalize:true",
  "semanticText:v1"
].join("|");

export const hashSemanticText = semanticText =>
  createHash("sha256").update(semanticText).digest("hex");

export const createEmbeddingRepository = db => {
  const findCurrentEmbedding = db.prepare(`
    SELECT model_name, model_version, embedding_json, generated_at
    FROM product_embeddings
    WHERE isin = ?
      AND model_name = ?
      AND model_version = ?
    ORDER BY generated_at DESC, id DESC
    LIMIT 1
  `);

  const insertEmbedding = db.prepare(`
    INSERT INTO product_embeddings (
      product_id,
      isin,
      model_name,
      model_version,
      semantic_text_hash,
      embedding_json,
      generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(isin, model_name, model_version, semantic_text_hash)
    DO UPDATE SET
      product_id = excluded.product_id,
      embedding_json = excluded.embedding_json,
      generated_at = excluded.generated_at
  `);

  return {
    getCurrent(product) {
      if (!product.isin) return undefined;
      const row = findCurrentEmbedding.get(
        product.isin,
        EMBEDDING_MODEL_ID,
        EMBEDDING_MODEL_VERSION
      );

      if (!row) return undefined;

      return {
        modelName: row.model_name,
        modelVersion: row.model_version,
        embedding: JSON.parse(row.embedding_json),
        generatedAt: row.generated_at
      };
    },

    save(product, semanticTextHash, embedding) {
      insertEmbedding.run(
        `${product.productId}`,
        product.isin,
        EMBEDDING_MODEL_ID,
        EMBEDDING_MODEL_VERSION,
        semanticTextHash,
        JSON.stringify(embedding),
        new Date().toISOString()
      );
    }
  };
};
