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

  parts.push(`Sostenibile: ${yesNo(product.sustainable)}.`);
  parts.push(`Eco-sostenibile: ${yesNo(product.ecoSustainable)}.`);
  parts.push(`PAI: ${yesNo(product.pai)}.`);
  parts.push(`Best in class: ${yesNo(product.bestInClass)}.`);
  parts.push(`Cedola: ${yesNo(product.coupon, "con cedola", "senza cedola")}.`);
  parts.push(`Collocato: ${yesNo(product.isPlaced)}.`);
  parts.push(`Preferito: ${yesNo(product.preferred)}.`);

  return parts.join(" ");
};
