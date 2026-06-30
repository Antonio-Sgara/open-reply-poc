import React, { FC, Fragment } from "react";
import FinancialTable, { TableCell } from "../../../FinancialTable";
import { useSortTable } from "../../../hooks/useSortTable";
import InvestmentRow from "./InvestmentRow";
import { FormattedMessage } from "react-intl";
import { ReactComponent as IconSort } from "assets/icon/misc/ordina.svg";
import { getNeedType } from "./Needs-utils";
import { needsType } from "model/need";
import LiquidityRow from "./LiquidityRow";
import ReserveRow from "./ReserveRow";
import { getFinancialComponentTotal } from "./Needs-calculation-utils";

interface IProps {
  needs;
  setNeeds;
  captiveFinancialAssets;
  financialAssets;
  visualOnly;
}

const NeedsTable: FC<IProps> = ({
  needs,
  setNeeds,
  captiveFinancialAssets,
  financialAssets,
  visualOnly
}) => {
  const investmentAsset = getNeedType(needs, needsType.INVESTMENT);
  const liquidityAsset = getNeedType(needs, needsType.LIQUIDITY);
  const reserveAsset = getNeedType(needs, needsType.RESERVE);
  const CCTotal = getFinancialComponentTotal(financialAssets, "CC");

  const { sortOnClick, sortedComponents } = useSortTable(
    [
      {
        component: <InvestmentRow investmentAsset={investmentAsset} />,
        valueReference: investmentAsset.totalCTV,
        id: "needs_row_" + needsType.INVESTMENT
      },
      {
        component: (
          <ReserveRow
            visualOnly={visualOnly}
            CCTotal={CCTotal}
            needs={needs}
            setNeeds={setNeeds}
            captiveFinancialAssets={captiveFinancialAssets}
            financialAssets={financialAssets}
            reserveAsset={reserveAsset}
            id={"needs_row_" + needsType.RESERVE}
          />
        ),
        valueReference: reserveAsset.totalCTV,
        id: "needs_row_" + needsType.RESERVE
      },
      {
        component: (
          <LiquidityRow
            visualOnly={visualOnly}
            CCTotal={CCTotal}
            captiveFinancialAssets={captiveFinancialAssets}
            financialAssets={financialAssets}
            needs={needs}
            setNeeds={setNeeds}
            liquidityAsset={liquidityAsset}
            reserveAsset={reserveAsset}
            id={"needs_row_" + needsType.LIQUIDITY}
          />
        ),
        valueReference: liquidityAsset.totalCTV,
        id: "needs_row_" + needsType.LIQUIDITY
      }
    ],
    needs
  );

  return (
    <FinancialTable
      style={{ marginTop: 30 }}
      columns={
        <Fragment>
          <TableCell style={{ width: "70%" }}>
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.components"}
            />
          </TableCell>
          <TableCell
            onClick={sortOnClick}
            className={"clickable"}
            style={{ width: "15%" }}
          >
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.ctv"}
            />{" "}
            <IconSort />
          </TableCell>
          <TableCell
            onClick={sortOnClick}
            className={"clickable"}
            style={{ width: "10%" }}
          >
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.weight"}
            />{" "}
            <IconSort />
          </TableCell>
          <TableCell style={{ width: "5%" }}>{/* SHOW MORE */}</TableCell>
        </Fragment>
      }
    >
      {sortedComponents}
    </FinancialTable>
  );
};

export default NeedsTable;
