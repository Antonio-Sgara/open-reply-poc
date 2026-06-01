export const SEMANTIC_SEARCH_DEBUG = true;

export const semanticDebugLog = (...args: unknown[]) => {
  if (SEMANTIC_SEARCH_DEBUG) console.log("[semantic-search]", ...args);
};

export const semanticDebugGroup = (label: string, callback: () => void) => {
  if (!SEMANTIC_SEARCH_DEBUG) return;

  console.groupCollapsed(`[semantic-search] ${label}`);
  callback();
  console.groupEnd();
};
