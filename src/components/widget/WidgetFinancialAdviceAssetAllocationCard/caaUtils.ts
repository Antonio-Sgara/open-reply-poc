import { setDatasetColor } from "tools/financialAssets";
import { variableFloatingPoint } from "tools/common";
import { financialAssetCAAFirstLevelTypes } from "model/financial-assets";

export const FinancialAssetAllocationData = (
  tableData: any[],
  stackedChart = false,
  weightChart = false
) => {
  if (!tableData) return [];

  return tableData.map(row => ({
    [weightChart ? "currencyName" : "componentName"]: row.name,
    tagColor: setDatasetColor(row.firstLevelType || row.type),
    stackedChart:
      stackedChart && row.weightInPercentage
        ? [{ name: "Peso", value: row.weightInPercentage }]
        : [],
    [weightChart ? "weightChart" : "stackedChart"]: weightChart
      ? [{ name: "Peso", value: row.weightInPercentage }]
      : stackedChart && row.weightInPercentage
        ? [{ name: "Peso", value: row.weightInPercentage }]
        : [],
    [weightChart ? "currencyRealWeightInPercentage" : "weight"]: variableFloatingPoint(
      parseFloat(row.weightInPercentage)
    )
  }));
};

export interface ISortParam {
  param: string;
  type: string;
  sort: string;
}

export const sortCAA = (
  items: any[] = [],
  secondarySort?: ISortParam,
  sortBy = "firstLevelType"
) => {
  const sortedItems = [...items];
  if (secondarySort) {
    sortedItems.sort((a, b) => {
      switch (secondarySort.type) {
        case "number":
          if (!(secondarySort.param in a)) a[secondarySort.param] = 0;
          if (!(secondarySort.param in b)) b[secondarySort.param] = 0;
          return secondarySort.sort === "asc" &&
            a[secondarySort.param] > b[secondarySort.param]
            ? 1
            : secondarySort.sort === "desc" &&
                a[secondarySort.param] < b[secondarySort.param]
              ? 1
              : -1;
        default:
          return 0;
      }
    });
  }

  return sortedItems.length > 0
    ? sortedItems.sort(
        (a, b) =>
          Object.keys(financialAssetCAAFirstLevelTypes).indexOf(a[sortBy]) -
          Object.keys(financialAssetCAAFirstLevelTypes).indexOf(b[sortBy])
      )
    : [];
};
