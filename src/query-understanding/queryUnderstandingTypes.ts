export type QueryFilterValues = Record<string, string[]>;

export type QueryFilterSource = "rules" | "model";

export interface QueryFilterMatch {
  filterId: string;
  value: string;
  reason: string;
  source: QueryFilterSource;
  confidence?: number;
}

export interface QueryUnderstandingResult {
  originalQuery: string;
  normalizedQuery: string;
  semanticQuery: string;
  inferredFilters: QueryFilterValues;
  matches: QueryFilterMatch[];
  matchedRules: string[];
  source: "rules" | "model" | "hybrid" | "fallback";
  modelId?: string;
  durationMs: number;
  error?: string;
}

export interface ModelFilterEvidence {
  filterId: string;
  value: string;
  label: string;
  confidence: number;
  margin: number;
  combinedScore: number;
}

export interface ModelFilterDiagnostic {
  filterId: string;
  accepted: boolean;
  topicScore: number;
  combinedScore: number;
  topicAccepted: boolean;
  skippedByRule: boolean;
  noMatchScore: number;
  candidates: Array<{
    value: string;
    label: string;
    score: number;
  }>;
}

export interface QueryModelResult {
  inferredFilters: QueryFilterValues;
  evidence: ModelFilterEvidence[];
  diagnostics: ModelFilterDiagnostic[];
}

export interface QueryUnderstandingWorkerRequest {
  type: "classify";
  requestId: number;
  query: string;
  excludedFilterIds: string[];
}

export type QueryUnderstandingWorkerResponse =
  | {
      type: "model-loading";
      modelId: string;
      device: string;
    }
  | {
      type: "model-progress";
      modelId: string;
      file?: string;
      progress?: number;
      loaded?: number;
      total?: number;
    }
  | {
      type: "model-ready";
      modelId: string;
      durationMs: number;
    }
  | {
      type: "result";
      requestId: number;
      result: QueryModelResult;
      durationMs: number;
    }
  | {
      type: "error";
      requestId: number;
      message: string;
    };
