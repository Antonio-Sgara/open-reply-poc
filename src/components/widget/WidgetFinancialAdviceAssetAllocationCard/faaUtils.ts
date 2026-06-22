import {
  financialAssetCAAFirstLevelTypes,
  financialAssetTypes,
  financialAssetFAAFirstLevelTypes,
  financialAssetFAASecondLevelDuration,
  financialAssetFAASecondLevelDurationProduct,
  financialAssetFAASecondLevelRating
} from "model/financial-assets";
import {
  bondOptions,
  setRatingDatasetColor,
  stockOptions
} from "tools/financialAssets";
import { variableFloatingPoint } from "tools/common";

interface IFilters {
  id: string;
  name: string;
}

export const setFAASecondLevelHeaders = (secondaryFilter: IFilters) => {
  const name =
    secondaryFilter.id === financialAssetTypes.BOND_DURATION
      ? "Duration"
      : secondaryFilter.id === financialAssetTypes.BOND_RATING
        ? "Rating"
        : secondaryFilter.id === financialAssetTypes.BOND_SECTOR_BASED
          ? "Tipologia"
          : secondaryFilter.id === financialAssetTypes.STOCK_GEOGRAPHIC
            ? "Aree Geografiche"
            : secondaryFilter.id === financialAssetTypes.STOCK_SECTOR_BASED
              ? "Settori"
              : "Nome";

  return {
    secondLevelName: name,
    secondLevelRealWeightInPercentage: "Peso %"
  };
};

export const getSecondaryOptions = (primaryType: string) =>
  primaryType === financialAssetCAAFirstLevelTypes.STOCK
    ? stockOptions
    : bondOptions;

export const fAssetAllCurrencyExposureHeaders = {
  currencyName: "Valuta",
  weightChart: ["Negativa", "Positiva"],
  currencyRealWeightInPercentage: "Peso %"
};

export const sortFAA = (items: any[]) => {
  return items && items.length > 0
    ? [...items].sort(
        (a, b) =>
          Object.keys(financialAssetFAAFirstLevelTypes).indexOf(a.firstLevelType) -
          Object.keys(financialAssetFAAFirstLevelTypes).indexOf(b.firstLevelType)
      )
    : [];
};

export const sortFAA2nd = (
  items: any[],
  section?: string,
  attr = "weightInPercentage",
  product = false
) => {
  if (!items || items.length === 0) return [];

  switch (section) {
    case "BOND_DURATION":
      return [...items].sort(
        (a, b) =>
          Object.values(
            product
              ? financialAssetFAASecondLevelDurationProduct
              : financialAssetFAASecondLevelDuration
          ).indexOf(a.name) -
          Object.values(
            product
              ? financialAssetFAASecondLevelDurationProduct
              : financialAssetFAASecondLevelDuration
          ).indexOf(b.name)
      );
    case "BOND_RATING":
      return [...items].sort(
        (a, b) =>
          Object.values(financialAssetFAASecondLevelRating).indexOf(a.name) -
          Object.values(financialAssetFAASecondLevelRating).indexOf(b.name)
      );
    default:
      return [...items].sort((a, b) =>
        a.name === "Altro"
          ? 1
          : b.name === "Altro"
            ? -1
            : Number(a[attr]) > Number(b[attr])
              ? -1
              : 1
      );
  }
};

export const setFAASecondLevelData = (tableData: any[]) => {
  return (tableData || []).map(row => ({
    secondLevelName: row.name,
    secondLevelRealWeightInPercentage: variableFloatingPoint(
      parseFloat(row.weightInPercentage)
    ),
    tagColor: setRatingDatasetColor(row.name),
    stackedChart: row.weightInPercentage
      ? [{ name: "Peso", value: row.weightInPercentage }]
      : []
  }));
};
