import { SemanticProductSource } from "./semanticTypes";

export interface BusinessRankingResult {
  businessBoost: number;
  matchedRules: string[];
}

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasAny = (text: string, terms: string[]) =>
  terms.some(term => text.includes(term));

const hasNegativeIntent = (text: string, terms: string[]) =>
  terms.some(
    term =>
      text.includes(`senza ${term}`) ||
      text.includes(`non ${term}`) ||
      text.includes(`no ${term}`) ||
      text.includes(`escludi ${term}`) ||
      text.includes(`esclusi ${term}`) ||
      text.includes(`escluse ${term}`)
  );

const getRiskKiidBoost = (
  product: SemanticProductSource,
  normalizedQuery: string,
  matchedRules: string[]
) => {
  if (typeof product.riskKiid !== "number") return 0;

  const asksLowRisk =
    hasAny(normalizedQuery, [
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
    ]) ||
    (normalizedQuery.includes("rischio") && normalizedQuery.includes("basso"));

  const asksHighRisk =
    hasAny(normalizedQuery, [
      "rischio alto",
      "kiid alto",
      "kid alto",
      "srri alto",
      "dinamico",
      "dinamici",
      "aggressivo",
      "aggressivi"
    ]) ||
    (normalizedQuery.includes("rischio") && normalizedQuery.includes("alto"));

  const exactRiskMatch = normalizedQuery.match(/\b(?:kiid|kid|srri|rischio)\s*(\d)\b/);

  if (exactRiskMatch) {
    const requestedRisk = Number(exactRiskMatch[1]);
    if (product.riskKiid === requestedRisk) {
      matchedRules.push(`riskKiid exact ${requestedRisk}`);
      return 0.45;
    }

    const distance = Math.abs(product.riskKiid - requestedRisk);
    const boost = Math.max(0, 0.28 - distance * 0.08);
    if (boost > 0) matchedRules.push(`riskKiid near ${requestedRisk}`);
    return boost;
  }

  if (asksLowRisk) {
    const boost = Math.max(0, (8 - product.riskKiid) * 0.08);
    matchedRules.push(`riskKiid basso boost ${product.riskKiid}`);
    return boost;
  }

  if (asksHighRisk) {
    const boost = Math.max(0, product.riskKiid * 0.08);
    matchedRules.push(`riskKiid alto boost ${product.riskKiid}`);
    return boost;
  }

  return 0;
};

const addBooleanBoost = (
  condition: boolean,
  productValue: boolean | undefined,
  boost: number,
  ruleName: string,
  matchedRules: string[]
) => {
  if (!condition || productValue !== true) return 0;
  matchedRules.push(ruleName);
  return boost;
};

const addBooleanPreference = (
  asksPositive: boolean,
  asksNegative: boolean,
  productValue: boolean | undefined,
  boost: number,
  fieldName: string,
  matchedRules: string[]
) => {
  if (asksNegative) {
    if (productValue === false) {
      matchedRules.push(`${fieldName} false`);
      return boost;
    }

    if (productValue === true) {
      matchedRules.push(`${fieldName} true penalty`);
      return -boost;
    }

    return 0;
  }

  return addBooleanBoost(
    asksPositive,
    productValue,
    boost,
    `${fieldName} true`,
    matchedRules
  );
};

const automotiveBrands = [
  "tesla",
  "volkswagen",
  "mercedes",
  "bmw",
  "stellantis",
  "ferrari",
  "toyota",
  "ford",
  "general motors",
  "honda",
  "hyundai",
  "renault",
  "porsche",
  "nissan",
  "kia",
  "mazda",
  "subaru",
  "rivian",
  "lucid"
];

const pharmaBrands = [
  "johnson johnson",
  "merck",
  "pfizer",
  "novartis",
  "novo nordisk",
  "astrazeneca",
  "bayer",
  "roche",
  "sanofi",
  "gsk",
  "glaxosmithkline",
  "bristol myers",
  "abbvie",
  "amgen",
  "gilead",
  "eli lilly",
  "lilly",
  "moderna",
  "biogen",
  "regeneron",
  "teva",
  "takeda",
  "sandoz",
  "biogena"
];

const findBrandInText = (text: string, brands: string[]) => {
  return brands.find(brand => {
    const normalizedBrand = normalizeText(brand);
    return new RegExp(`(^| )${normalizedBrand}( |$)`).test(text);
  });
};

const getAutomotiveBoost = (
  product: SemanticProductSource,
  normalizedQuery: string,
  matchedRules: string[]
) => {
  const asksAutomotive = hasAny(normalizedQuery, [
    "automobili",
    "automobile",
    "auto",
    "automotive",
    "veicoli",
    "macchine",
    "motori",
    "case automobilistiche",
    "azienda automobilistica",
    "aziende automobilistiche"
  ]);

  if (!asksAutomotive) return 0;

  const normalizedName = normalizeText(product.name ?? product.productName ?? "");
  const matchedBrand = findBrandInText(normalizedName, automotiveBrands);

  if (!matchedBrand) return 0;

  matchedRules.push(`automotive brand ${matchedBrand}`);
  return 0.55;
};

const getPharmaBoost = (
  product: SemanticProductSource,
  normalizedQuery: string,
  matchedRules: string[]
) => {
  const asksPharma = hasAny(normalizedQuery, [
    "farmaceutico",
    "farmaceutici",
    "farmaceutica",
    "farmaceutiche",
    "case farmaceutiche",
    "azienda farmaceutica",
    "aziende farmaceutiche",
    "pharma",
    "farmaci",
    "biotecnologia",
    "biotech",
    "sanitario",
    "salute",
    "healthcare"
  ]);

  if (!asksPharma) return 0;

  const normalizedName = normalizeText(product.name ?? product.productName ?? "");
  const matchedBrand = findBrandInText(normalizedName, pharmaBrands);

  if (!matchedBrand) return 0;

  matchedRules.push(`pharma brand ${matchedBrand}`);
  return 0.55;
};

export const calculateBusinessRanking = (
  query: string,
  product: SemanticProductSource
): BusinessRankingResult => {
  const normalizedQuery = normalizeText(query);
  const matchedRules: string[] = [];
  let businessBoost = 0;

  businessBoost += getRiskKiidBoost(product, normalizedQuery, matchedRules);
  businessBoost += getAutomotiveBoost(product, normalizedQuery, matchedRules);
  businessBoost += getPharmaBoost(product, normalizedQuery, matchedRules);

  const asksNotSustainable =
    hasNegativeIntent(normalizedQuery, ["sostenibile", "sostenibili"]) ||
    hasAny(normalizedQuery, ["non esg", "senza esg", "no esg"]);

  const asksNotEcoSustainable =
    hasNegativeIntent(normalizedQuery, [
      "eco",
      "ecosostenibile",
      "eco sostenibile",
      "ecosostenibili",
      "eco sostenibili"
    ]);

  businessBoost += addBooleanPreference(
    hasAny(normalizedQuery, ["sostenibile", "sostenibili", "esg"]),
    asksNotSustainable,
    product.sustainable,
    0.22,
    "sustainable",
    matchedRules
  );

  businessBoost += addBooleanPreference(
    hasAny(normalizedQuery, ["eco", "ecosostenibile", "eco sostenibile"]),
    asksNotEcoSustainable,
    product.ecoSustainable,
    0.22,
    "ecoSustainable",
    matchedRules
  );

  businessBoost += addBooleanPreference(
    hasAny(normalizedQuery, ["pai"]),
    hasNegativeIntent(normalizedQuery, ["pai"]),
    product.pai,
    0.18,
    "pai",
    matchedRules
  );

  businessBoost += addBooleanPreference(
    hasAny(normalizedQuery, ["cedola", "cedolare", "distribuzione"]),
    hasNegativeIntent(normalizedQuery, [
      "cedola",
      "cedole",
      "cedolare",
      "distribuzione"
    ]),
    product.coupon,
    0.22,
    "coupon",
    matchedRules
  );

  if (
    hasAny(normalizedQuery, ["euro", "eur"]) &&
    product.currency?.toUpperCase() === "EUR"
  ) {
    matchedRules.push("currency EUR");
    businessBoost += 0.16;
  }

  businessBoost += addBooleanPreference(
    hasAny(normalizedQuery, ["collocato", "collocati", "collocamento"]),
    hasNegativeIntent(normalizedQuery, [
      "collocato",
      "collocati",
      "collocamento"
    ]),
    product.isPlaced,
    0.14,
    "isPlaced",
    matchedRules
  );

  return {
    businessBoost,
    matchedRules
  };
};
