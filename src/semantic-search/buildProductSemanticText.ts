import { productTypeMapper } from "model/product";
import { SemanticProductSource } from "./semanticTypes";

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && `${value}`.trim() !== "";

const yesNo = (value?: boolean, yes = "si", no = "no") =>
  value === true ? yes : no;

const riskProfile = (riskKiid?: number) => {
  if (!hasValue(riskKiid)) return undefined;
  if ((riskKiid as number) <= 2) return "rischio basso, profilo prudente";
  if ((riskKiid as number) <= 4) return "rischio medio-basso, profilo moderato";
  if ((riskKiid as number) <= 5) return "rischio medio";
  return "rischio alto, profilo dinamico";
};

const pushField = (parts: string[], label: string, value: unknown) => {
  if (hasValue(value)) parts.push(`${label}: ${value}.`);
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

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const findBrandInText = (text: string, brands: string[]) => {
  return brands.find(brand => {
    const normalizedBrand = normalizeText(brand);
    return new RegExp(`(^| )${normalizedBrand}( |$)`).test(text);
  });
};

const getThemeText = (productName?: string) => {
  const normalizedName = normalizeText(productName ?? "");
  const matchedAutomotiveBrand = findBrandInText(
    normalizedName,
    automotiveBrands
  );
  const matchedPharmaBrand = findBrandInText(normalizedName, pharmaBrands);

  if (matchedAutomotiveBrand) {
    return [
      "automobili",
      "auto",
      "automotive",
      "veicoli",
      "macchine",
      "motori",
      "mobilita",
      "case automobilistiche",
      matchedAutomotiveBrand
    ].join(", ");
  }

  if (matchedPharmaBrand) {
    return [
      "farmaceutico",
      "farmaceutici",
      "case farmaceutiche",
      "aziende farmaceutiche",
      "pharma",
      "farmaci",
      "biotecnologia",
      "biotech",
      "salute",
      "sanitario",
      "healthcare",
      matchedPharmaBrand
    ].join(", ");
  }

  return undefined;
};

export const buildProductSemanticText = (product: SemanticProductSource) => {
  const parts: string[] = [];
  const productName = product.name ?? product.productName;
  const mappedProductType = product.productType
    ? productTypeMapper(product.productType)
    : undefined;

  pushField(parts, "Nome prodotto", productName);
  pushField(parts, "ISIN", product.isin);
  pushField(parts, "Societa di gestione", product.managementCompany);
  pushField(parts, "Sicav", product.sicav);
  pushField(parts, "Tipologia prodotto", mappedProductType);
  pushField(parts, "Categoria tecnica", product.caaFirstLevelType);
  pushField(parts, "Asset class primo livello", product.commercialAssetFirstLevel);
  pushField(
    parts,
    "Asset class secondo livello",
    product.commercialAssetSecondLevel
  );
  pushField(parts, "Asset class terzo livello", product.commercialAssetThirdLevel);
  pushField(parts, "Valuta", product.currency);
  pushField(parts, "Rischio KIID", product.riskKiid);
  pushField(parts, "Profilo rischio", riskProfile(product.riskKiid));
  pushField(parts, "Tema", getThemeText(productName));

  parts.push(`Sostenibile: ${yesNo(product.sustainable)}.`);
  parts.push(`Eco-sostenibile: ${yesNo(product.ecoSustainable)}.`);
  parts.push(`PAI: ${yesNo(product.pai)}.`);
  parts.push(`Best in class: ${yesNo(product.bestInClass)}.`);
  parts.push(`Cedola: ${yesNo(product.coupon, "con cedola", "senza cedola")}.`);
  parts.push(`Collocato: ${yesNo(product.isPlaced)}.`);
  parts.push(`Preferito: ${yesNo(product.preferred)}.`);

  return parts.join(" ");
};
