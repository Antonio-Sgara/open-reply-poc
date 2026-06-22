import React, { Fragment } from "react";
import FinancialTable, { TableCell } from "../FinancialTable";
import { FinancialAdviceAssetAllocationTable } from "../FinancialAdviceAssetAllocationTable/FinancialAdviceAssetAllocationTable";
import { FinancialAssetAllocationData } from "../widget/WidgetFinancialAdviceAssetAllocationCard/caaUtils";
import Sorter from "components/Sorter/Sorter";

interface IProps {
  columns?: Array<any>;
  data?: any;
  headers?: any;
  stackedChart?: boolean;
  weightChart?: boolean;
  onSort?: any;
  activeSort?: string;
}

export const FinancialAssetAllocationTable: React.FC<IProps> = ({
  columns,
  data,
  headers,
  stackedChart = false,
  weightChart = false,
  onSort = () => null,
  activeSort = ""
}) => {
  return (
    <FinancialTable
      style={{ marginTop: "40px" }}
      columns={
        columns ? (
          <Fragment>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                style={{
                  width:
                    index === 0 ? "auto" : "140px",
                  fontSize: "12px"
                }}
              >
                {column.sortable && column.id ? (
                  <Sorter
                    name={column.name}
                    onSort={onSort}
                    sortKey={column.id}
                    current={activeSort}
                  />
                ) : (
                  column.name
                )}
              </TableCell>
            ))}
          </Fragment>
        ) : (
          <></>
        )
      }
    >
      <FinancialAdviceAssetAllocationTable
        data={FinancialAssetAllocationData(data, stackedChart, weightChart)}
        headers={headers}
        className="mt-0"
        rangeParams={[
          stackedChart ? "stackedChart" : weightChart ? "weightChart" : ""
        ]}
      />
    </FinancialTable>
  );
};
