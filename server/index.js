import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import {
  attachStoredEmbedding,
  createEmbeddingRepository,
  ensureProductEmbeddings
} from "./semanticEmbeddings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "127.0.0.1";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "semantic-search.db");
const BASE_PRODUCTS_PATH = path.join(DATA_DIR, "products-base.json");
const EXTRA_PRODUCTS_PATH = path.join(DATA_DIR, "products-extra.json");

const app = express();
app.use(express.json({ limit: "5mb" }));
let httpServer;
let keepAliveInterval;

app.use((_, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use((request, response, next) => {
  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

const readJson = filePath => JSON.parse(fs.readFileSync(filePath, "utf8"));

const toBoolean = value => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const normalizeProduct = (product, source) => {
  const productType = product.productType ?? product.type ?? "UNKNOWN";
  const caaFirstLevelType = product.caaFirstLevelType ?? productType;
  const commercialAssetFirstLevel =
    product.commercialAssetFirstLevel ??
    (caaFirstLevelType === "EQUITY" ? "Azionari" : caaFirstLevelType);
  const commercialAssetSecondLevel =
    product.commercialAssetSecondLevel ?? commercialAssetFirstLevel;

  return {
    ...product,
    productId: product.productId ?? product.isin,
    productType,
    caaFirstLevelType,
    commercialAssetFirstLevel,
    commercialAssetSecondLevel,
    commercialAssetThirdLevel:
      product.commercialAssetThirdLevel ?? commercialAssetSecondLevel,
    coupon: product.coupon ?? false,
    detailInfo: product.detailInfo ?? true,
    presentInWMP: product.presentInWMP ?? true,
    isPlaced: product.isPlaced ?? true,
    expired: product.expired ?? false,
    notPresentInWMP: product.notPresentInWMP ?? false,
    administeredProduct: product.administeredProduct ?? false,
    switchableIn: product.switchableIn ?? false,
    switchableOut: product.switchableOut ?? false,
    childMultilinea: product.childMultilinea ?? false,
    instrumentCategoryPosition: product.instrumentCategoryPosition ?? {
      present: false
    },
    isinCurrencyPair:
      product.isinCurrencyPair ??
      (product.isin && product.currency
        ? { [product.isin]: product.currency }
        : undefined),
    semanticSource: source
  };
};

const db = new DatabaseSync(DB_PATH);

const setupDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      isin TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      product_type TEXT,
      caa_first_level_type TEXT,
      currency TEXT,
      risk_kiid INTEGER,
      source TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      isin TEXT NOT NULL,
      model_name TEXT NOT NULL,
      model_version TEXT,
      semantic_text_hash TEXT NOT NULL,
      embedding_json TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      UNIQUE(isin, model_name, model_version, semantic_text_hash)
    );

    CREATE INDEX IF NOT EXISTS idx_products_isin ON products(isin);
    CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
    CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
  `);
};

const seedProducts = () => {
  const baseProducts = readJson(BASE_PRODUCTS_PATH).map(product =>
    normalizeProduct(product, "base")
  );
  const extraProducts = readJson(EXTRA_PRODUCTS_PATH).map(product =>
    normalizeProduct(product, "extra")
  );
  const productsByIsin = new Map();

  [...baseProducts, ...extraProducts].forEach(product => {
    if (!product.isin) return;
    if (!productsByIsin.has(product.isin)) {
      productsByIsin.set(product.isin, product);
    }
  });

  const insertProduct = db.prepare(`
    INSERT INTO products (
      product_id,
      isin,
      name,
      product_type,
      caa_first_level_type,
      currency,
      risk_kiid,
      source,
      raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(isin) DO UPDATE SET
      product_id = excluded.product_id,
      name = excluded.name,
      product_type = excluded.product_type,
      caa_first_level_type = excluded.caa_first_level_type,
      currency = excluded.currency,
      risk_kiid = excluded.risk_kiid,
      source = excluded.source,
      raw_json = excluded.raw_json
  `);

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM products");
    [...productsByIsin.values()].forEach(product => {
      insertProduct.run(
        `${product.productId}`,
        product.isin,
        product.name ?? product.productName ?? product.isin,
        product.productType ?? null,
        product.caaFirstLevelType ?? null,
        product.currency ?? null,
        Number.isFinite(product.riskKiid) ? product.riskKiid : null,
        product.semanticSource,
        JSON.stringify(product)
      );
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    baseCount: baseProducts.length,
    extraCount: extraProducts.length,
    storedCount: productsByIsin.size
  };
};

const parseProduct = row => JSON.parse(row.raw_json);

const getProductRows = ({ source, q, productTypes } = {}) => {
  const conditions = [];
  const params = {};

  if (source) {
    conditions.push("source = :source");
    params.source = source;
  }

  if (q) {
    conditions.push("(UPPER(name) LIKE :q OR UPPER(isin) LIKE :q)");
    params.q = `%${q.toUpperCase()}%`;
  }

  if (productTypes?.length) {
    const placeholders = productTypes.map((_, index) => `:type${index}`);
    conditions.push(`product_type IN (${placeholders.join(", ")})`);
    productTypes.forEach((type, index) => {
      params[`type${index}`] = type;
    });
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare(`SELECT * FROM products ${where} ORDER BY name ASC`)
    .all(params);
};

const paginate = (items, page = 0, size = 20) => {
  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const safeSize = Number.isFinite(size) && size > 0 ? size : 20;
  const start = safePage * safeSize;
  const content = items.slice(start, start + safeSize);
  const totalPages = Math.ceil(items.length / safeSize);

  return {
    content,
    number: safePage,
    numberOfElements: content.length,
    totalElements: items.length,
    totalPages,
    last: safePage >= Math.max(totalPages - 1, 0)
  };
};

const getRequestedTypes = request => {
  const queryTypes = request.query.types;
  const bodyTypes = request.body?.productype ?? request.body?.productType;
  const rawTypes = queryTypes ?? bodyTypes;
  if (!rawTypes) return undefined;
  return Array.isArray(rawTypes) ? rawTypes : [rawTypes];
};

setupDatabase();
const seedStats = seedProducts();
const embeddingRepository = createEmbeddingRepository(db);
let embeddingStats = {
  status: "pending",
  modelName: undefined,
  modelVersion: undefined,
  totalProducts: 0,
  cached: 0,
  generated: 0,
  failed: 0
};

app.get("/health", (_, response) => {
  const rows = getProductRows();
  const products = rows.map(row =>
    attachStoredEmbedding(parseProduct(row), embeddingRepository)
  );
  const productsWithEmbedding = products.filter(product =>
    Array.isArray(product.semanticEmbedding)
  ).length;

  response.json({
    status: "ok",
    dbPath: DB_PATH,
    ...seedStats,
    embeddingStats: {
      ...embeddingStats,
      productsWithEmbedding
    },
    products
  });
});

app.get("/api/products", (request, response) => {
  const rows = getProductRows({
    source: request.query.source
  });
  response.json(rows.map(parseProduct));
});

app.get("/api/products/search", (request, response) => {
  const rows = getProductRows({ q: request.query.q ?? "" });
  response.json(rows.map(parseProduct));
});

app.get("/api/products/:id", (request, response) => {
  const row = db
    .prepare(
      "SELECT * FROM products WHERE product_id = :id OR isin = :id LIMIT 1"
    )
    .get({ id: request.params.id });

  if (!row) {
    response.status(404).json({ message: "Product not found" });
    return;
  }

  response.json(parseProduct(row));
});

app.post("/products", (request, response) => {
  const page = Number(request.query.page ?? 0);
  const size = Number(request.query.size ?? 20);
  const onlyPreferred = toBoolean(request.query.preferred);
  const rows = getProductRows({ productTypes: getRequestedTypes(request) });
  let products = rows.map(parseProduct);

  if (onlyPreferred !== undefined) {
    products = products.filter(product => product.preferred === onlyPreferred);
  }

  response.json(paginate(products, page, size));
});

app.get("/api/debug/schema", (_, response) => {
  const schema = db
    .prepare(
      "SELECT name, sql FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY type, name"
    )
    .all();
  response.json(schema);
});

const startServer = async () => {
  const products = getProductRows().map(parseProduct);

  try {
    embeddingStats = {
      status: "running",
      modelName: undefined,
      modelVersion: undefined,
      totalProducts: products.length,
      cached: 0,
      generated: 0,
      failed: 0
    };
    embeddingStats = {
      status: "ready",
      ...(await ensureProductEmbeddings({
        products,
        repository: embeddingRepository
      }))
    };
  } catch (error) {
    embeddingStats = {
      ...embeddingStats,
      status: "failed"
    };
    console.error("[semantic-search-api] Embedding bootstrap failed", error);
  }

  httpServer = app.listen(PORT, HOST, () => {
    httpServer.ref();
    keepAliveInterval = setInterval(() => null, 2 ** 31 - 1);
    console.log(`Semantic search API listening on http://${HOST}:${PORT}`);
    console.log(
      `Seeded ${seedStats.storedCount} products (${seedStats.baseCount} base + ${seedStats.extraCount} extra before dedupe)`
    );
    console.log("[semantic-search-api] Embedding stats", embeddingStats);
  });
};

startServer();

const stopServer = () => {
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  if (!httpServer) {
    process.exit(0);
    return;
  }

  httpServer.close(() => process.exit(0));
};

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
