import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import LinearBarChart from "../../../LinearBarChart";
import { euroFormatter } from "../../../utils";
import { getNeedType } from "./Needs-utils";
import { needsType } from "model/need";

interface IProps {
  captiveFinancialAssets: number;
  needs;
}

const NeedsGraphic: FC<IProps> = ({ captiveFinancialAssets, needs }) => {
  const investmentAsset = getNeedType(needs, needsType.INVESTMENT);
  const reserveAsset = getNeedType(needs, needsType.RESERVE);
  const liquidityAsset = getNeedType(needs, needsType.LIQUIDITY);

  const elements = [
    {
      name: (
        <FormattedMessage
          id={"advancedConsultancyProposal.needs.barchart.investment"}
        />
      ),
      color: "#22608F",
      percentage: investmentAsset?.totalWeightInPercentage,
      tooltipDescription: (
        <FormattedMessage
          id={
            "advancedConsultancyProposal.needs.barchart.investment.description"
          }
        />
      )
    },
    {
      name: (
        <FormattedMessage
          id={"advancedConsultancyProposal.needs.barchart.reserve"}
        />
      ),
      color: "#26A69A",
      percentage: reserveAsset?.totalWeightInPercentage
    },
    {
      name: (
        <FormattedMessage
          id={"advancedConsultancyProposal.needs.barchart.liquidAssets"}
        />
      ),
      color: "#76D37E",
      percentage: liquidityAsset?.totalWeightInPercentage
    }
  ];

  return (
    <LinearBarChart
      title={
        <>
          <FormattedMessage
            id={"advancedConsultancyProposal.needs.barchart.captive"}
          />
          :
        </>
      }
      value={euroFormatter(captiveFinancialAssets)}
      tooltipDescription={
        <FormattedMessage
          id={"common.label.patrimonioFinanziarioPressoBcc.description"}
        />
      }
      elements={elements}
      isNeeds={true}
    />
  );
};

export default NeedsGraphic;
