import React from "react";
import LinearBarChart from "components/LinearBarChart";
import VerticalBar from "components/VerticalBar";
import "./FinancialAdviceAssetAllocationTable.scss";

interface IProps {
  headers?: any;
  data?: any[];
  className?: string;
  rangeParams?: string[];
}

const getChartData = (row: any) => {
  const datasets = row.weightChart || row.stackedChart || [];
  return datasets.map((dataset: any, index: number) => ({
    name: dataset.name,
    color: index === 0 ? "#92a6bc" : "#264d7a",
    percentage: Number(dataset.value)
  }));
};

export const FinancialAdviceAssetAllocationTable: React.FC<IProps> = ({
  data = [],
  headers = {},
  className = ""
}) => {
  if (!data.length) return null;

  const visibleColumns = Object.keys(data[0]).filter(
    key => !["tagColor", "stackedChart", "weightChart"].includes(key)
  );

  return (
    <div className={`financialAdviceRiskTable financialAdviceAssetAllocationTable ${className}`}>
      <div className="financialAdviceRiskTable__th">
        <div className="financialAdviceRiskTable__td verticalBar" />
        {visibleColumns.map(col => (
          <div
            key={`header-${col}`}
            className={`financialAdviceRiskTable__td financialAdviceAssetAllocationTable_td ${col}`}
          >
            {headers[col] || col}
          </div>
        ))}
        <div className="financialAdviceRiskTable__td financialAdviceAssetAllocationTable_td chart">
          Peso
        </div>
      </div>

      {data.map((row, rowIndex) => (
        <div
          className="financialAdviceRiskTable__bodyRow financialAdviceAssetAllocationTable_bodyRow"
          key={`asset-row-${rowIndex}`}
        >
          <div className="financialAdviceRiskTable__tr">
            <div className="financialAdviceRiskTable__td financialAdviceAssetAllocationTable_td verticalBar">
              <div className="financialAdviceAssetAllocationTableTd__content">
                <VerticalBar color={row.tagColor} />
              </div>
            </div>
            {visibleColumns.map(col => (
              <div
                key={`asset-cell-${rowIndex}-${col}`}
                className={`financialAdviceRiskTable__td financialAdviceAssetAllocationTable_td ${col}`}
              >
                <div className="financialAdviceAssetAllocationTableTd__content">
                  {row[col]}
                  {col.toLowerCase().includes("weight") ||
                  col.toLowerCase() === "weight"
                    ? "%"
                    : ""}
                </div>
              </div>
            ))}
            <div className="financialAdviceRiskTable__td financialAdviceAssetAllocationTable_td chart">
              <LinearBarChart elements={getChartData(row)} hideLegend />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
