import { semanticDebugGroup, semanticDebugLog } from "../semantic-search/debug";
import { QUERY_UNDERSTANDING_MODEL } from "./queryUnderstandingConfig";
import {
  inferFiltersDeterministically,
  normalizeQueryForFilters
} from "./deterministicFilterInference";
import {
  QueryFilterMatch,
  QueryModelResult,
  QueryUnderstandingResult,
  QueryUnderstandingWorkerRequest,
  QueryUnderstandingWorkerResponse
} from "./queryUnderstandingTypes";

interface PendingClassification {
  resolve: (result: QueryModelResult) => void;
  reject: (error: Error) => void;
}

let worker: Worker | undefined;
let requestCounter = 0;
let lastLoggedProgress = -1;
const pendingClassifications = new Map<number, PendingClassification>();
const classificationCache = new Map<
  string,
  Promise<QueryModelResult>
>();
const loggedClassifications = new Set<string>();

const handleWorkerMessage = (
  event: MessageEvent<QueryUnderstandingWorkerResponse>
) => {
  const message = event.data;

  if (message.type === "model-loading") {
    semanticDebugLog("Caricamento modello query understanding nel Web Worker", {
      provider: "@huggingface/transformers",
      model: message.modelId,
      dtype: QUERY_UNDERSTANDING_MODEL.dtype,
      device: message.device,
      task: "zero-shot-classification"
    });
    return;
  }

  if (message.type === "model-progress") {
    const progress = Math.floor(message.progress ?? 0);
    const progressBucket = Math.floor(progress / 10) * 10;
    if (progressBucket > lastLoggedProgress) {
      lastLoggedProgress = progressBucket;
      semanticDebugLog("Download modello query understanding", {
        model: message.modelId,
        progress: `${progressBucket}%`,
        file: message.file,
        loaded: message.loaded,
        total: message.total
      });
    }
    return;
  }

  if (message.type === "model-ready") {
    semanticDebugLog("Modello query understanding pronto", {
      model: message.modelId,
      durationMs: Number(message.durationMs.toFixed(1))
    });
    return;
  }

  const pending = pendingClassifications.get(message.requestId);
  if (!pending) return;
  pendingClassifications.delete(message.requestId);

  if (message.type === "error") {
    pending.reject(new Error(message.message));
    return;
  }

  pending.resolve(message.result);
};

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL("./queryUnderstanding.worker.ts", import.meta.url), {
      type: "module",
      name: "query-understanding"
    });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", event => {
      const error = new Error(event.message || "Query understanding worker failed");
      pendingClassifications.forEach(pending => pending.reject(error));
      pendingClassifications.clear();
      worker?.terminate();
      worker = undefined;
    });
  }

  return worker;
};

const classifyQuery = (query: string, excludedFilterIds: string[]) => {
  const cacheKey = `${normalizeQueryForFilters(query)}::${excludedFilterIds
    .slice()
    .sort()
    .join(",")}`;
  const cachedClassification = classificationCache.get(cacheKey);
  if (cachedClassification) return cachedClassification;

  const requestId = ++requestCounter;
  const message: QueryUnderstandingWorkerRequest = {
    type: "classify",
    requestId,
    query,
    excludedFilterIds
  };

  const classification = new Promise<QueryModelResult>((resolve, reject) => {
    pendingClassifications.set(requestId, { resolve, reject });
    getWorker().postMessage(message);
  });

  classificationCache.set(cacheKey, classification);
  classification.catch(() => classificationCache.delete(cacheKey));
  return classification;
};

export const understandQueryForFilters = async (
  query: string
): Promise<QueryUnderstandingResult> => {
  const startedAt = performance.now();
  const deterministic = inferFiltersDeterministically(query);
  const originalQuery = query.trim();

  if (!originalQuery) {
    return {
      originalQuery,
      normalizedQuery: "",
      semanticQuery: "",
      inferredFilters: {},
      matches: [],
      matchedRules: [],
      source: "rules",
      durationMs: performance.now() - startedAt
    };
  }

  try {
    const deterministicFilterIds = new Set(
      deterministic.matches.map(match => match.filterId)
    );
    const modelExcludedFilterIds = new Set(deterministicFilterIds);

    // A generic sustainability request must not imply the more specific
    // environmental-objective filter unless that intent is explicit.
    if (
      deterministicFilterIds.has("sustainable") &&
      !deterministicFilterIds.has("ecoSustainable")
    ) {
      modelExcludedFilterIds.add("ecoSustainable");
    }

    const modelResult = await classifyQuery(
      originalQuery,
      Array.from(modelExcludedFilterIds)
    );
    const inferredFilters = { ...modelResult.inferredFilters };
    const modelMatches: QueryFilterMatch[] = modelResult.evidence.map(item => ({
      filterId: item.filterId,
      value: item.value,
      reason: item.label,
      source: "model",
      confidence: item.confidence
    }));

    deterministic.matches.forEach(match => {
      inferredFilters[match.filterId] = [match.value];
    });

    const matches = [
      ...deterministic.matches,
      ...modelMatches.filter(match => !deterministicFilterIds.has(match.filterId))
    ];
    const usedModel = matches.some(match => match.source === "model");
    const usedRules = matches.some(match => match.source === "rules");
    const durationMs = performance.now() - startedAt;

    const logKey = normalizeQueryForFilters(originalQuery);
    if (!loggedClassifications.has(logKey)) {
      loggedClassifications.add(logKey);
      semanticDebugGroup("Query understanding completato", () => {
        console.log("Query originale", originalQuery);
        console.log("Modello", QUERY_UNDERSTANDING_MODEL.id);
        console.log("Durata", `${durationMs.toFixed(1)} ms`);
        console.log(
          "Query understanding matches",
          JSON.stringify(
            matches.map(match => ({
              filterId: match.filterId,
              value: match.value,
              source: match.source,
              confidence:
                match.confidence === undefined
                  ? undefined
                  : Number(match.confidence.toFixed(4)),
              reason: match.reason
            }))
          )
        );
        console.table(
          matches.map(match => ({
            filterId: match.filterId,
            value: match.value,
            source: match.source,
            confidence:
              match.confidence === undefined
                ? "regola esatta"
                : Number(match.confidence.toFixed(4)),
            reason: match.reason
          }))
        );
        console.table(
          modelResult.diagnostics.map(item => ({
            filterId: item.filterId,
            accepted: item.accepted ? "si" : "no",
            topicScore: Number(item.topicScore.toFixed(4)),
            combinedScore: Number(item.combinedScore.toFixed(4)),
            topicAccepted: item.topicAccepted ? "si" : "no",
            skippedByRule: item.skippedByRule ? "si" : "no",
            bestValue: item.candidates[0]?.value ?? "-",
            bestScore: Number((item.candidates[0]?.score ?? 0).toFixed(4)),
            noMatchScore: Number(item.noMatchScore.toFixed(4)),
            margin: Number(
              (
                (item.candidates[0]?.score ?? 0) -
                Math.max(item.candidates[1]?.score ?? 0, item.noMatchScore)
              ).toFixed(4)
            )
          }))
        );
        console.log(
          "Query understanding diagnostics",
          JSON.stringify(
            modelResult.diagnostics.map(item => ({
              filterId: item.filterId,
              accepted: item.accepted,
              topicScore: Number(item.topicScore.toFixed(4)),
              combinedScore: Number(item.combinedScore.toFixed(4)),
              topicAccepted: item.topicAccepted,
              skippedByRule: item.skippedByRule,
              noMatchScore: Number(item.noMatchScore.toFixed(4)),
              candidates: item.candidates.map(candidate => ({
                ...candidate,
                score: Number(candidate.score.toFixed(4))
              }))
            }))
          )
        );
      });
    }

    return {
      originalQuery,
      normalizedQuery: deterministic.normalizedQuery,
      semanticQuery: originalQuery,
      inferredFilters,
      matches,
      matchedRules: matches.map(match => match.reason),
      source: usedRules && usedModel ? "hybrid" : usedModel ? "model" : "rules",
      modelId: QUERY_UNDERSTANDING_MODEL.id,
      durationMs
    };
  } catch (error) {
    const durationMs = performance.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);

    semanticDebugGroup("Fallback query understanding deterministico", () => {
      console.warn("Modello query understanding non disponibile", error);
      console.log("Query", originalQuery);
      console.log("Filtri da regole", deterministic.inferredFilters);
    });

    return {
      originalQuery,
      normalizedQuery: normalizeQueryForFilters(originalQuery),
      semanticQuery: originalQuery,
      inferredFilters: deterministic.inferredFilters,
      matches: deterministic.matches,
      matchedRules: deterministic.matches.map(match => match.reason),
      source: "fallback",
      modelId: QUERY_UNDERSTANDING_MODEL.id,
      durationMs,
      error: message
    };
  }
};
