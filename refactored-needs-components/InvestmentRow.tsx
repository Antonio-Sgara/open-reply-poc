import React from "react";
import { NeedsRow } from "./Needs-utils";
import { FormattedMessage } from "react-intl";
import { euroFormatter, percFormatter } from "../../../utils";

const InvestmentRow = ({ investmentAsset }) => {
  const totalCTV = isNaN(investmentAsset?.totalCTV)
    ? 0
    : investmentAsset?.totalCTV;

  return (
    <NeedsRow
      valueFirstCol={
        <FormattedMessage
          id={"advancedConsultancyProposal.needs.table.investment"}
        />
      }
      valueCTV={euroFormatter(totalCTV)}
      styleCTV={{ color: "#92A6BC" }}
      valueWeight={percFormatter(investmentAsset?.totalWeightInPercentage)}
      styleWeight={{ color: "#92A6BC" }}
      color={"#22608F"}
    />
  );
};

export default InvestmentRow;
