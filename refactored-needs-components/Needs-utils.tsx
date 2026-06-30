import { FinancialRowContainer } from "../../../FinancialTable";
import { FinancialRowExpandible } from "../../../FinancialTable/FinancialTable";
import InlineBlock from "../../../InlineBlock";
import VerticalBar from "../../../VerticalBar";
import BlockFontWeight500 from "../../../BlockFontWeight500";
import BlockFontWeightBold from "../../../BlockFontWeightBold";
import React, { FC } from "react";

export function getNeedType(arrayNeeds, needType) {
  return (
    arrayNeeds && arrayNeeds.filter(element => element.needType === needType)[0]
  );
}

export function getLiquidityType(arrayNeeds, type) {
  return arrayNeeds.filter(element => element.type === type)[0];
}

export function getRecurrentExpenditure(arrayNeeds) {
  const recurrentExpenditure = arrayNeeds.filter(
    element => element.type === "RECURRENT_EXPENDITURE"
  )[0];

  if (recurrentExpenditure) {
    return recurrentExpenditure;
  }

  return {
    amount: 0,
    type: "RECURRENT_EXPENDITURE",
    weightInPercentage: 0,
    isNotPresent: true
  };
}

export function getBlockedExpenditure(arrayNeeds) {
  const blockedExpenditure = arrayNeeds.filter(
    element => element.type === "BLOCKED"
  )[0];

  if (blockedExpenditure) {
    return blockedExpenditure;
  }

  return {
    amount: 0,
    type: "BLOCKED",
    weightInPercentage: 0,
    isNotPresent: true
  };
}

interface IPropsNeedsRow {
  color;
  valueFirstCol;
  valueCTV;
  styleCTV?;
  valueWeight;
  styleWeight?;
  children?;
  id?: string;
}

export const NeedsRow: FC<IPropsNeedsRow> = ({
  color,
  valueFirstCol,
  valueCTV,
  styleCTV,
  valueWeight,
  styleWeight,
  children,
  id
}) => {
  return (
    <FinancialRowContainer>
      <InlineBlock
        style={{
          width: "2%",
          position: "absolute",
          left: "10px",
          height: "calc(100% - 22px)"
        }}
      >
        <VerticalBar color={color} />
      </InlineBlock>
      <div className={!children ? "financialTable__expandibleRow" : ""}>
        <FinancialRowExpandible sectionExpandible={children} id={id}>
          <BlockFontWeight500 style={{ width: "68%" }}>
            {valueFirstCol}
          </BlockFontWeight500>
          <BlockFontWeightBold
            style={{
              width: "15%",
              ...styleCTV,
              textAlign: "right",
              paddingRight: "2em"
            }}
          >
            {valueCTV}
          </BlockFontWeightBold>
          <BlockFontWeightBold
            style={{
              width: "10%",
              ...styleWeight,
              textAlign: "right",
              paddingRight: "2em"
            }}
          >
            {valueWeight ? valueWeight : ""}
          </BlockFontWeightBold>
        </FinancialRowExpandible>
      </div>
    </FinancialRowContainer>
  );
};

export function getDefaultLiquidityItemList() {
  return [
    {
      type: "RECURRENT_EXPENDITURE",
      amount: 0,
      weightInPercentage: 0,
      isNotPresent: true
    },
    {
      type: "BLOCKED",
      amount: 0,
      weightInPercentage: 0,
      isNotPresent: true
    }
  ];
}
