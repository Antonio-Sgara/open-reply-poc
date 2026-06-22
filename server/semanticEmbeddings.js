import { createHash } from "node:crypto";
import { pipeline } from "@huggingface/transformers";

export const EMBEDDING_MODEL_ID =
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
export const EMBEDDING_MODEL_DTYPE = "q4";
export const EMBEDDING_MODEL_VERSION = [
  "task:feature-extraction",
  `dtype:${EMBEDDING_MODEL_DTYPE}`,
  "pooling:mean",
  "normalize:true",
  "semanticText:v1"
].join("|");

let extractorPromise = null;

const hasValue = value =>
  value !== undefined && value !== null && `${value}`.trim() !== "";

const yesNo = (value, yes = "si", no = "no") => (value === true ? yes : no);

const riskProfile = riskKiid => {
  if (!hasValue(riskKiid)) return undefined;
  if (riskKiid <= 2) return "rischio basso, profilo prudente";
  if (riskKiid <= 4) return "rischio medio-basso, profilo moderato";
  if (riskKiid <= 5) return "rischio medio";
  return "rischio alto, profilo dinamico";
};

const pushField = (parts, label, value) => {
  if (hasValue(value)) parts.push(`${label}: ${value}.`);
};

export const buildServerProductSemanticText = product => {
  const parts = [];
  const productName = product.name ?? product.productName;

  pushField(parts, "Nome prodotto", productName);
  pushField(parts, "ISIN", product.isin);
  pushField(parts, "Societa di gestione", product.managementCompany);
  pushField(parts, "Sicav", product.sicav);
  pushField(parts, "Tipologia prodotto", product.productType);
  pushField(parts, "Categoria tecnica", product.caaFirstLevelType);
  pushField(parts, "Asset class primo livello", product.commercialAssetFirstLevel);
  pushField(parts, "Asset class secondo livello", product.commercialAssetSecondLevel);
  pushField(parts, "Asset class terzo livello", product.commercialAssetThirdLevel);
  pushField(parts, "Valuta", product.currency);
  pushField(parts, "Rischio KIID", product.riskKiid);
  pushField(parts, "Profilo rischio", riskProfile(product.riskKiid));

  parts.push(`Sostenibile: ${yesNo(product.sustainable)}.`);
  parts.push(`Eco-sostenibile: ${yesNo(product.ecoSustainable)}.`);
  parts.push(`PAI: ${yesNo(product.pai)}.`);
  parts.push(`Best in class: ${yesNo(product.bestInClass)}.`);
  parts.push(`BIC type: ${product.bicType ?? "n.d."}.`);
  parts.push(`Cedola: ${yesNo(product.coupon, "con cedola", "senza cedola")}.`);
  parts.push(`Collocato: ${yesNo(product.isPlaced)}.`);
  parts.push(`Preferito: ${yesNo(product.preferred)}.`);

  return parts.join(" ");
};

export const hashSemanticText = semanticText =>
  createHash("sha256").update(semanticText).digest("hex");

const getExtractor = async () => {
  if (!extractorPromise) {
    console.log("[semantic-search-api] Loading embedding model", {
      model: EMBEDDING_MODEL_ID,
      version: EMBEDDING_MODEL_VERSION
    });

    extractorPromise = pipeline("feature-extraction", EMBEDDING_MODEL_ID, {
      dtype: EMBEDDING_MODEL_DTYPE
    });
  }

  return extractorPromise;
};

const tensorToEmbedding = output => {
  if (output?.data) return Array.from(output.data, Number);

  if (typeof output?.tolist === "function") {
    const list = output.tolist();
    return Array.isArray(list?.[0]) ? list[0].map(Number) : list.map(Number);
  }

  if (Array.isArray(output?.[0])) return output[0].map(Number);
  if (Array.isArray(output)) return output.map(Number);

  throw new Error("Unsupported embedding output format");
};

const embedText = async text => {
  const extractor = await getExtractor();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  return tensorToEmbedding(output);
};

export const createEmbeddingRepository = db => {
  const findEmbedding = db.prepare(`
    SELECT embedding_json, generated_at
    FROM product_embeddings
    WHERE isin = ?
      AND model_name = ?
      AND model_version = ?
      AND semantic_text_hash = ?
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
    get(product, semanticTextHash) {
      if (!product.isin) return undefined;
      const row = findEmbedding.get(
        product.isin,
        EMBEDDING_MODEL_ID,
        EMBEDDING_MODEL_VERSION,
        semanticTextHash
      );

      if (!row) return undefined;

      return {
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

export const ensureProductEmbeddings = async ({ products, repository }) => {
  const stats = {
    modelName: EMBEDDING_MODEL_ID,
    modelVersion: EMBEDDING_MODEL_VERSION,
    totalProducts: products.length,
    cached: 0,
    generated: 0,
    failed: 0
  };
  const missingProducts = [];

  for (const [index, product] of products.entries()) {
    const semanticText = buildServerProductSemanticText(product);
    const semanticTextHash = hashSemanticText(semanticText);
    const cachedEmbedding = repository.get(product, semanticTextHash);

    if (cachedEmbedding) {
      stats.cached += 1;
    } else {
      missingProducts.push({ product, semanticText, semanticTextHash });
    }

    const processed = index + 1;
    if (processed % 25 === 0 || processed === products.length) {
      console.log("[semantic-search-api] Embedding cache scan", {
        processed,
        total: products.length,
        cached: stats.cached,
        missing: missingProducts.length
      });
    }
  }

  if (missingProducts.length === 0) return stats;

  try {
    await getExtractor();
  } catch (error) {
    stats.failed = missingProducts.length;
    console.error("[semantic-search-api] Embedding model unavailable", {
      model: EMBEDDING_MODEL_ID,
      version: EMBEDDING_MODEL_VERSION,
      missingProducts: missingProducts.length,
      error: error instanceof Error ? error.message : error
    });
    return stats;
  }

  for (const [index, item] of missingProducts.entries()) {
    try {
      const embedding = await embedText(item.semanticText);
      repository.save(item.product, item.semanticTextHash, embedding);
      stats.generated += 1;
    } catch (error) {
      stats.failed += 1;
      console.error("[semantic-search-api] Failed to generate product embedding", {
        productId: item.product.productId,
        isin: item.product.isin,
        error: error instanceof Error ? error.message : error
      });
    }

    const processed = index + 1;
    if (processed % 25 === 0 || processed === missingProducts.length) {
      console.log("[semantic-search-api] Embedding generation progress", {
        processed,
        total: missingProducts.length,
        cached: stats.cached,
        generated: stats.generated,
        failed: stats.failed
      });
    }
  }

  return stats;
};

export const attachStoredEmbedding = (product, repository) => {
  const semanticText = buildServerProductSemanticText(product);
  const semanticTextHash = hashSemanticText(semanticText);
  const cachedEmbedding = repository.get(product, semanticTextHash);

  if (!cachedEmbedding) {
    return {
      ...product,
      semanticText,
      semanticEmbeddingModel: EMBEDDING_MODEL_ID,
      semanticEmbeddingModelVersion: EMBEDDING_MODEL_VERSION
    };
  }

  return {
    ...product,
    semanticText,
    semanticEmbedding: cachedEmbedding.embedding,
    semanticEmbeddingGeneratedAt: cachedEmbedding.generatedAt,
    semanticEmbeddingModel: EMBEDDING_MODEL_ID,
    semanticEmbeddingModelVersion: EMBEDDING_MODEL_VERSION
  };
};
