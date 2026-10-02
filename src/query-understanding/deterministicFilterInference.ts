import { QueryFilterMatch, QueryFilterValues } from "./queryUnderstandingTypes";

export const normalizeQueryForFilters = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const queryHasAny = (query: string, terms: string[]) =>
  terms.some(term =>
    new RegExp(`(?:^| )${escapeRegExp(term)}(?: |$)`).test(query)
  );

const queryHasNegativeIntent = (query: string, terms: string[]) =>
  terms.some(
    term =>
      query.includes(`senza ${term}`) ||
      query.includes(`non ${term}`) ||
      query.includes(`no ${term}`) ||
      query.includes(`escludi ${term}`) ||
      query.includes(`esclusi ${term}`) ||
      query.includes(`escluse ${term}`)
  );

const setInferredFilter = (
  inferredFilters: QueryFilterValues,
  matches: QueryFilterMatch[],
  filterId: string,
  value: string,
  reason: string
) => {
  inferredFilters[filterId] = [value];
  matches.push({ filterId, value, reason, source: "rules" });
};

export const inferFiltersDeterministically = (query: string) => {
  const normalizedQuery = normalizeQueryForFilters(query);
  const inferredFilters: QueryFilterValues = {};
  const matches: QueryFilterMatch[] = [];

  if (!normalizedQuery) {
    return { normalizedQuery, inferredFilters, matches };
  }

  const exactRiskMatch = normalizedQuery.match(
    /\b(?:kiid|kid|srri|rischio)\s*(\d)\b/
  );

  if (exactRiskMatch) {
    setInferredFilter(
      inferredFilters,
      matches,
      "riskKiid",
      exactRiskMatch[1],
      `SRRI ${exactRiskMatch[1]}`
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "rischio basso",
      "kiid basso",
      "kid basso",
      "srri basso",
      "prudente",
      "prudenti",
      "difensivo",
      "difensivi",
      "conservativo",
      "conservativi"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "riskKiid",
      "2",
      "rischio basso -> SRRI 2"
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "rischio medio",
      "kiid medio",
      "kid medio",
      "srri medio",
      "bilanciato",
      "bilanciati"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "riskKiid",
      "4",
      "rischio medio -> SRRI 4"
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "rischio alto",
      "kiid alto",
      "kid alto",
      "srri alto",
      "dinamico",
      "dinamici",
      "aggressivo",
      "aggressivi"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "riskKiid",
      "6",
      "rischio alto -> SRRI 6"
    );
  }

  if (queryHasAny(normalizedQuery, ["euro", "eur"])) {
    setInferredFilter(inferredFilters, matches, "currency", "EUR", "valuta EUR");
  } else if (queryHasAny(normalizedQuery, ["dollaro", "dollari", "usd"])) {
    setInferredFilter(inferredFilters, matches, "currency", "USD", "valuta USD");
  }

  if (queryHasAny(normalizedQuery, ["fondo", "fondi"])) {
    setInferredFilter(
      inferredFilters,
      matches,
      "productType",
      "FUND",
      "tipologia Fondo"
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "azione",
      "azioni",
      "titolo azionario",
      "titoli azionari",
      "strumento azionario",
      "strumenti azionari",
      "equity",
      "stock"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "productType",
      "STOCK",
      "tipologia Azione"
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "obbligazione",
      "obbligazioni",
      "titolo obbligazionario",
      "titoli obbligazionari",
      "bond"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "productType",
      "BOND",
      "tipologia Obbligazione"
    );
  } else if (queryHasAny(normalizedQuery, ["polizza", "polizze"])) {
    setInferredFilter(
      inferredFilters,
      matches,
      "productType",
      "POLICY",
      "tipologia Polizza"
    );
  } else if (
    queryHasAny(normalizedQuery, [
      "gestione patrimoniale",
      "gestioni patrimoniali"
    ])
  ) {
    setInferredFilter(
      inferredFilters,
      matches,
      "productType",
      "GP",
      "tipologia Gestione patrimoniale"
    );
  }

  const booleanRules = [
    {
      filterId: "sustainable",
      positiveTerms: ["sostenibile", "sostenibili", "esg"],
      negativeTerms: ["sostenibile", "sostenibili", "esg"],
      label: "sostenibile"
    },
    {
      filterId: "ecoSustainable",
      positiveTerms: [
        "eco",
        "ecosostenibile",
        "eco sostenibile",
        "ecosostenibili",
        "eco sostenibili",
        "ambientale",
        "ambientali",
        "obiettivo ambientale",
        "obiettivi ambientali",
        "clima",
        "climatico",
        "climatici",
        "pianeta"
      ],
      negativeTerms: [
        "eco",
        "ecosostenibile",
        "eco sostenibile",
        "ecosostenibili",
        "eco sostenibili",
        "ambientale",
        "ambientali",
        "obiettivo ambientale",
        "obiettivi ambientali",
        "clima",
        "climatico",
        "climatici",
        "pianeta"
      ],
      label: "eco-sostenibile"
    },
    {
      filterId: "pai",
      positiveTerms: ["pai"],
      negativeTerms: ["pai"],
      label: "PAI"
    },
    {
      filterId: "coupon",
      positiveTerms: ["cedola", "cedole", "cedolare", "distribuzione"],
      negativeTerms: ["cedola", "cedole", "cedolare", "distribuzione"],
      label: "cedola"
    },
    {
      filterId: "bestInClass",
      positiveTerms: ["bic", "best in class"],
      negativeTerms: ["bic", "best in class"],
      label: "BIC"
    },
    {
      filterId: "isPlaced",
      positiveTerms: ["collocato", "collocati", "collocamento"],
      negativeTerms: ["collocato", "collocati", "collocamento"],
      label: "collocamento"
    }
  ];

  booleanRules.forEach(rule => {
    const asksPositive = queryHasAny(normalizedQuery, rule.positiveTerms);
    const asksNegative = queryHasNegativeIntent(normalizedQuery, rule.negativeTerms);

    if (asksNegative) {
      setInferredFilter(
        inferredFilters,
        matches,
        rule.filterId,
        "false",
        `${rule.label}: No`
      );
      return;
    }

    if (asksPositive) {
      setInferredFilter(
        inferredFilters,
        matches,
        rule.filterId,
        "true",
        `${rule.label}: Si`
      );
    }
  });

  return { normalizedQuery, inferredFilters, matches };
};
