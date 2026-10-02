export const QUERY_UNDERSTANDING_MODEL = {
  id: "onnx-community/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7-ONNX",
  dtype: "q4" as const,
  device: "wasm" as const,
  topicHypothesisTemplate: "La richiesta dell'utente contiene informazioni su {}.",
  valueHypothesisTemplate: "L'utente cerca {}."
};

export interface FilterCandidate {
  value: string;
  label: string;
}

export interface FilterClassificationGroup {
  filterId: string;
  topicLabel: string;
  candidates: FilterCandidate[];
  noMatchLabel: string;
  minimumTopicScore: number;
  minimumScore: number;
  minimumMargin: number;
  minimumCombinedScore: number;
}

const candidate = (value: string, label: string): FilterCandidate => ({
  value,
  label
});

const group = (
  filterId: string,
  topicLabel: string,
  candidates: FilterCandidate[],
  noMatchLabel: string,
  minimumTopicScore = 0.7,
  minimumScore = 0.52,
  minimumMargin = 0.15,
  minimumCombinedScore = 0.45
): FilterClassificationGroup => ({
  filterId,
  topicLabel,
  candidates,
  noMatchLabel,
  minimumTopicScore,
  minimumScore,
  minimumMargin,
  minimumCombinedScore
});

export const QUERY_FILTER_CLASSIFICATION_GROUPS: FilterClassificationGroup[] = [
  group(
    "riskKiid",
    "il livello di rischio o il profilo di rischio dell'investitore",
    [
      candidate("2", "investimenti a rischio basso per un profilo prudente"),
      candidate("4", "investimenti a rischio medio per un profilo moderato"),
      candidate("6", "investimenti ad alto rischio per un profilo aggressivo")
    ],
    "un argomento diverso dal livello di rischio",
    0.58,
    0.7,
    0.15,
    0.38
  ),
  group(
    "currency",
    "la valuta o la moneta dell'investimento",
    [
      candidate("EUR", "strumenti denominati in euro (EUR), la moneta unica europea"),
      candidate("USD", "strumenti denominati in dollari statunitensi (USD)")
    ],
    "strumenti senza una valuta specificata",
    0.62,
    0.58,
    0.18,
    0.68
  ),
  group(
    "productType",
    "la tipologia dello strumento finanziario",
    [
      candidate("FUND", "fondi di investimento"),
      candidate("STOCK", "azioni o titoli azionari di societa"),
      candidate("BOND", "obbligazioni o titoli di debito"),
      candidate("POLICY", "polizze assicurative"),
      candidate("GP", "gestioni patrimoniali")
    ],
    "prodotti finanziari senza una tipologia specificata",
    0.7,
    0.75,
    0.18
  ),
  group(
    "sustainable",
    "la sostenibilita o i criteri ESG",
    [
      candidate("true", "la selezione di investimenti sostenibili o ESG"),
      candidate("false", "l'esclusione di investimenti sostenibili o ESG")
    ],
    "un argomento diverso dalla sostenibilita degli investimenti",
    0.74,
    0.88,
    0.22,
    0.9
  ),
  group(
    "ecoSustainable",
    "gli obiettivi ambientali dell'investimento",
    [
      candidate("true", "la selezione di investimenti con obiettivi ambientali"),
      candidate("false", "l'esclusione di investimenti con obiettivi ambientali")
    ],
    "investimenti sostenibili in generale ma senza obiettivi ambientali specifici",
    0.78,
    0.96,
    0.22,
    0.9
  ),
  group(
    "pai",
    "i principali impatti avversi PAI",
    [
      candidate("true", "la considerazione dei principali impatti avversi PAI"),
      candidate("false", "l'esclusione dei principali impatti avversi PAI")
    ],
    "un argomento diverso dai principali impatti avversi PAI",
    0.82,
    0.68,
    0.24
  ),
  group(
    "coupon",
    "la distribuzione di cedole o di redditi periodici",
    [
      candidate("true", "investimenti con cedola o reddito periodico"),
      candidate("false", "investimenti senza cedola e ad accumulazione")
    ],
    "un argomento diverso dalla distribuzione di cedole",
    0.6,
    0.6,
    0.2,
    0.55
  ),
  group(
    "bestInClass",
    "la classificazione best in class",
    [
      candidate("true", "la selezione di prodotti classificati best in class"),
      candidate("false", "l'esclusione di prodotti classificati best in class")
    ],
    "un argomento diverso dalla classificazione best in class",
    0.82,
    0.68,
    0.24
  ),
  group(
    "isPlaced",
    "il collocamento bancario dei prodotti",
    [
      candidate("true", "la selezione di prodotti collocati dalla banca"),
      candidate("false", "la selezione di prodotti non collocati dalla banca")
    ],
    "un argomento diverso dal collocamento bancario dei prodotti",
    0.78,
    0.66,
    0.22
  )
];
