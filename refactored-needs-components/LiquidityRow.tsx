import React, { useEffect, useState } from "react";
import {
  getBlockedExpenditure,
  getDefaultLiquidityItemList,
  getNeedType,
  getRecurrentExpenditure,
  NeedsRow
} from "./Needs-utils";
import { FormattedMessage } from "react-intl";
import {
  basicFormatter,
  euroFormatter,
  getDecrementedAmount,
  getIncrementedAmount,
  percFormatter,
  roundToTwoDecimal
} from "../../../utils";
import { InnerRowExpand } from "../../../FinancialTable";
import InlineBlock from "../../../InlineBlock";
import _ from "lodash";
import { needsType } from "model/need";
import NeedsAnalysisInputWithIncrement from "../NeedsAnalysisInputWithIncrement";
import BlockFontWeight500 from "../../../BlockFontWeight500";
import { useDispatch } from "react-redux";
import { saveNeedsAction } from "../../../../store/advanced-proposal/advanced-proposal.actions";
import { ReactComponent as JointedOwnershipIcon } from "assets/coiDashborad.svg";
import { DossierTitoliModal } from "./DossierTitoliModal";
import { isBlockedLiquidityNotPresent } from "../NeedsAnalysis-utils";

const LiquidityRow = ({
  liquidityAsset,
  reserveAsset,
  setNeeds,
  needs,
  captiveFinancialAssets,
  financialAssets,
  CCTotal,
  visualOnly = false,
  id
}) => {
  const dispatch = useDispatch();

  const needItemList =
    liquidityAsset.needItemList && liquidityAsset.needItemList.length > 0
      ? liquidityAsset.needItemList
      : getDefaultLiquidityItemList();

  const initialBlockedLiquidity = getBlockedExpenditure(needItemList);

  const [initialBlocked, setInitialBlocked] = useState(
    getBlockedExpenditure(liquidityAsset.needItemList).amount
  );
  const [
    currentExpenditureLiquidity,
    setCurrentExpenditureLiquidity
  ] = useState(getRecurrentExpenditure(needItemList));
  const [blockedLiquidity, setBlockedLiquidity] = useState(
    initialBlockedLiquidity
  );
  const [formattedAmount, setFormattedAmount] = useState(
    euroFormatter(initialBlockedLiquidity.amount)
  );
  const [maxBlockedLiq, setMaxBlockedLiq] = useState(
    CCTotal - liquidityAsset.totalCTV - reserveAsset.totalCTV
  );
  const [initMaxBlockedLiq, setInitMaxBlockedLiq] = useState(
    CCTotal - liquidityAsset.totalCTV - reserveAsset.totalCTV
  );
  const [showMaxLabel, setShowMaxLabel] = useState(false);
  const [
    formattedWeightInPercentage,
    setFormattedWeightInPercentage
  ] = useState(basicFormatter(initialBlockedLiquidity.weightInPercentage));
  const [dtModalIsVisible, setDtModalIsVisible] = useState(false);

  const getWeightInPercentage = amount => {
    const total = Number(financialAssets?.ctv || 0);

    return total > 0
      ? roundToTwoDecimal((Number(amount || 0) * 100) / total)
      : 0;
  };

  const getNeedsReserveTotalCTV = () =>
    getNeedType(needs, needsType.RESERVE).totalCTV;

  const getNeedsLiquidityTotalCTV = () =>
    getNeedType(needs, needsType.LIQUIDITY).totalCTV;

  const getAvailableBlockedLiquidity = currentNeeds =>
    CCTotal -
    getNeedType(currentNeeds, needsType.RESERVE).totalCTV -
    getNeedType(currentNeeds, needsType.LIQUIDITY).totalCTV;

  const getAmountFromWeightInPercentage = weightInPercentage =>
    roundToTwoDecimal(
      ((captiveFinancialAssets +
        getNeedsReserveTotalCTV() +
        getNeedsLiquidityTotalCTV()) *
        weightInPercentage) /
        100
    );

  const getNeedItemsTotalCTV = items =>
    items.reduce((total, item) => total + parseFloat(item.amount), 0);

  const getLiquidityItemsWithoutEditableRows = () => {
    const newNeedItemList = [...needItemList];

    _.remove(newNeedItemList, { type: "BLOCKED" });
    _.remove(newNeedItemList, { type: "RECURRENT_EXPENDITURE" });

    return newNeedItemList;
  };

  const updateFormattedWeight = newBlockedLiquidity => {
    setFormattedWeightInPercentage(
      newBlockedLiquidity.weightInPercentage > 100
        ? basicFormatter(100)
        : basicFormatter(
            roundToTwoDecimal(newBlockedLiquidity.weightInPercentage)
          )
    );
  };

  const updateNeedsAfterBlockedLiquidityChange = newBlockedLiquidity => {
    const currentExpenditureLiq = getRecurrentExpenditure(needItemList);

    currentExpenditureLiq.weightInPercentage = getWeightInPercentage(
      currentExpenditureLiq.amount
    );

    const newNeedItemList = getLiquidityItemsWithoutEditableRows();

    newNeedItemList.push(newBlockedLiquidity);
    newNeedItemList.push(currentExpenditureLiq);

    setCurrentExpenditureLiquidity(currentExpenditureLiq);

    const newLiquidityAsset = {
      ...liquidityAsset,
      needItemList: newNeedItemList
    };

    const newNeeds = [...needs];

    _.remove(newNeeds, { needType: needsType.LIQUIDITY });

    newLiquidityAsset.totalCTV = getNeedItemsTotalCTV(newNeedItemList);

    const newTotalWeightInPercentage = getWeightInPercentage(
      newLiquidityAsset.totalCTV
    );

    newLiquidityAsset.totalWeightInPercentage =
      newTotalWeightInPercentage > 100 ? 100 : newTotalWeightInPercentage;

    const investmentAsset = getNeedType(newNeeds, needsType.INVESTMENT);
    const currentReserveAsset = getNeedType(newNeeds, needsType.RESERVE);

    investmentAsset.totalCTV =
      captiveFinancialAssets -
      newLiquidityAsset.totalCTV -
      currentReserveAsset.totalCTV;

    const newReserveAsset = {
      ...currentReserveAsset,
      totalWeightInPercentage: getWeightInPercentage(
        currentReserveAsset.totalCTV
      )
    };

    investmentAsset.totalWeightInPercentage = getWeightInPercentage(
      investmentAsset.totalCTV
    );

    if (investmentAsset.totalCTV < 0) {
      investmentAsset.totalCTV = 0;
    }

    if (investmentAsset.totalWeightInPercentage < 0) {
      investmentAsset.totalWeightInPercentage = 0;
    }

    _.remove(newNeeds, { needType: needsType.INVESTMENT });
    _.remove(newNeeds, { needType: needsType.RESERVE });

    newNeeds.push(newLiquidityAsset);
    newNeeds.push(investmentAsset);
    newNeeds.push(newReserveAsset);

    setMaxBlockedLiq(getAvailableBlockedLiquidity(newNeeds));
    setNeeds(newNeeds);
    dispatch(saveNeedsAction(newNeeds));
  };

  const onUpdateBlockedLiquidity = newBlockedLiquidity => {
    setBlockedLiquidity(newBlockedLiquidity);
    setFormattedAmount(euroFormatter(newBlockedLiquidity.amount));
    updateFormattedWeight(newBlockedLiquidity);
    updateNeedsAfterBlockedLiquidityChange(newBlockedLiquidity);
  };

  useEffect(() => {
    if (typeof setNeeds === "function") {
      const max = CCTotal - liquidityAsset.totalCTV - reserveAsset.totalCTV;

      if (max < 0) {
        const newAmount = blockedLiquidity.amount - Math.abs(max);

        const newBlockedLiquidity = {
          ...blockedLiquidity,
          amount: newAmount <= 0 ? 0 : newAmount,
          weightInPercentage:
            newAmount <= 0 ? 0 : getWeightInPercentage(newAmount)
        };

        onUpdateBlockedLiquidity(newBlockedLiquidity);
        setInitMaxBlockedLiq(0);
      } else {
        setInitMaxBlockedLiq(max);
      }
    }
  }, [reserveAsset.totalCTV, setNeeds]);

  const setNewLiquidity = newBlockedValue => {
    let totalCTV = 0;

    needItemList.map(item => {
      item.type === "BLOCKED"
        ? (totalCTV = totalCTV + newBlockedValue)
        : (totalCTV = totalCTV + parseFloat(item.amount));
    });

    needs.find(el => el.needType === "LIQUIDITY").totalCTV = totalCTV;
  };

  const onUpdateNeedsDistribution = newNeedsDistribution => {
    const newNeeds = [...needs];

    _.remove(newNeeds, { needType: needsType.LIQUIDITY });

    const newLiquidityAsset = {
      ...liquidityAsset,
      needsDistribution: newNeedsDistribution
    };

    newNeeds.push(newLiquidityAsset);
    setNeeds(newNeeds);
    dispatch(saveNeedsAction(newNeeds));
    setDtModalIsVisible(false);
  };

  const updateBlockedLiquidityAmount = (amount, isNotPresent = false) => {
    setNewLiquidity(amount);

    onUpdateBlockedLiquidity({
      ...blockedLiquidity,
      type: "BLOCKED",
      amount,
      weightInPercentage: getWeightInPercentage(amount),
      isNotPresent
    });
  };

  const updateBlockedLiquidityWeight = weightInPercentage => {
    let amount = getAmountFromWeightInPercentage(weightInPercentage);

    if (amount > initMaxBlockedLiq + initialBlocked) {
      amount = initMaxBlockedLiq + initialBlocked;
    }

    onUpdateBlockedLiquidity({
      ...blockedLiquidity,
      weightInPercentage,
      amount
    });
  };

  return (
    <>
      <NeedsRow
        id={id}
        valueFirstCol={
          <div className="dtRowFlexContainer">
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.liquidity"}
            />
            {!visualOnly &&
              Object.keys(liquidityAsset?.needsDistribution)?.length > 1 && (
                <div
                  className={"AccountTypeIconWithPopover__content blueIcon"}
                  onClick={() => {
                    setDtModalIsVisible(true);
                  }}
                >
                  <div>
                    <JointedOwnershipIcon />
                  </div>
                  <div>
                    {Object.keys(liquidityAsset.needsDistribution).length}
                  </div>
                </div>
              )}
          </div>
        }
        valueCTV={euroFormatter(liquidityAsset.totalCTV)}
        valueWeight={percFormatter(liquidityAsset.totalWeightInPercentage)}
        color={"#76D37E"}
      >
        <InlineBlock
          className={"innerTableExpand__ContentTitle"}
          style={{ width: "70%", paddingLeft: 20 }}
        >
          <FormattedMessage
            id={"advancedConsultancyProposal.needs.table.components"}
          />
        </InlineBlock>
        <InlineBlock
          className={"innerTableExpand__ContentTitle"}
          style={{ width: "12%", paddingRight: "2.2em", textAlign: "right" }}
        >
          <FormattedMessage id={"customer.IncomePanel.amount"} />
        </InlineBlock>
        <InlineBlock
          className={"innerTableExpand__ContentTitle"}
          style={{ width: "10%", textAlign: "right", paddingRight: "2.2em" }}
        >
          <FormattedMessage
            id={"advancedConsultancyProposal.needs.table.weight"}
          />
        </InlineBlock>

        <InnerRowExpand>
          <InlineBlock style={{ width: "70%" }}>
            <FormattedMessage
              id={
                "advancedConsultancyProposal.needs.table.currentExpenditureLiquidity"
              }
            />
          </InlineBlock>
          <InlineBlock
            style={{ width: "15%", textAlign: "right", paddingRight: "2.2em" }}
          >
            {euroFormatter(currentExpenditureLiquidity.amount)}
          </InlineBlock>
          <InlineBlock
            style={{ width: "10%", textAlign: "right", paddingRight: "2.2em" }}
          >
            {percFormatter(
              currentExpenditureLiquidity.weightInPercentage,
              true,
              false,
              2
            )}
          </InlineBlock>
        </InnerRowExpand>

        <InnerRowExpand>
          <InlineBlock style={{ width: "70%" }}>
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.blockedLiquidity"}
            />
          </InlineBlock>

          <InlineBlock
            style={{
              width: "15%",
              marginLeft: "-2px",
              verticalAlign: showMaxLabel ? "text-top" : "middle",
              textAlign: "right",
              paddingRight: "2.2em"
            }}
          >
            {visualOnly ? (
              <>{formattedAmount}</>
            ) : (
              <NeedsAnalysisInputWithIncrement
                placeholder="≥ 0€"
                isAllowed={({ floatValue, value }) => {
                  if (value?.indexOf("-") >= 0) return false;
                  if (!value) return true;
                  if (floatValue === 0) return true;

                  return (
                    floatValue >= 0 &&
                    floatValue - blockedLiquidity.amount <= maxBlockedLiq
                  );
                }}
                onFocus={() => {
                  setShowMaxLabel(true);
                  setMaxBlockedLiq(getAvailableBlockedLiquidity(needs));
                }}
                onBlur={() => setShowMaxLabel(false)}
                isCurrency={true}
                onValueChange={values => {
                  const { value, formattedValue } = values;
                  const amount = parseFloat(value) > 0 ? parseFloat(value) : 0;

                  updateBlockedLiquidityAmount(amount, value === "");
                  setFormattedAmount(formattedValue);
                }}
                value={
                  isBlockedLiquidityNotPresent(needs) ? null : formattedAmount
                }
                onAdd={() => {
                  const amount = getIncrementedAmount(
                    blockedLiquidity.amount,
                    maxBlockedLiq < 1 ? maxBlockedLiq : 1
                  );

                  if (maxBlockedLiq <= 0) {
                    return;
                  }

                  updateBlockedLiquidityAmount(amount, false);
                }}
                onSubtract={() => {
                  const amount = getDecrementedAmount(
                    blockedLiquidity.amount,
                    1
                  );

                  updateBlockedLiquidityAmount(amount, false);
                }}
              />
            )}

            {showMaxLabel && (
              <BlockFontWeight500>
                Massimo{" "}
                {maxBlockedLiq > 0
                  ? euroFormatter(maxBlockedLiq, true)
                  : euroFormatter(0, true)}
              </BlockFontWeight500>
            )}
          </InlineBlock>

          <InlineBlock
            style={{
              width: "10%",
              paddingLeft: 7,
              verticalAlign: showMaxLabel ? "text-top" : "middle",
              textAlign: visualOnly ? "right" : "",
              paddingRight: visualOnly ? "2.2em" : ""
            }}
          >
            {visualOnly ? (
              <>{blockedLiquidity.weightInPercentage}%</>
            ) : (
              <NeedsAnalysisInputWithIncrement
                isAllowed={values => {
                  const { value, floatValue } = values;

                  if (
                    value === "00" ||
                    floatValue > 100 ||
                    value?.indexOf("-") >= 0
                  ) {
                    return false;
                  }

                  const maxWeightInPercentage = getWeightInPercentage(
                    maxBlockedLiq
                  );

                  return floatValue <= maxWeightInPercentage || value === "";
                }}
                onFocus={() => {
                  setShowMaxLabel(true);
                  setMaxBlockedLiq(getAvailableBlockedLiquidity(needs));
                }}
                onBlur={() => setShowMaxLabel(false)}
                suffix={"%"}
                placeholder="≥ 0%"
                decimalScale={2}
                isCurrency={true}
                onValueChange={values => {
                  const { value, formattedValue } = values;
                  const weightInPercentage = value;

                  updateBlockedLiquidityWeight(weightInPercentage);

                  setFormattedWeightInPercentage(
                    weightInPercentage > 100
                      ? basicFormatter(100)
                      : formattedValue
                  );
                }}
                value={
                  isBlockedLiquidityNotPresent(needs)
                    ? null
                    : formattedWeightInPercentage
                }
                onAdd={() => {
                  const maxWeightInPercentage = getWeightInPercentage(
                    maxBlockedLiq
                  );

                  const weightInPercentage = getIncrementedAmount(
                    blockedLiquidity.weightInPercentage,
                    maxWeightInPercentage < 1 ? maxWeightInPercentage : 1
                  );

                  if (maxWeightInPercentage <= 0 || weightInPercentage > 100) {
                    return;
                  }

                  updateBlockedLiquidityWeight(weightInPercentage);
                }}
                onSubtract={() => {
                  const weightInPercentage =
                    blockedLiquidity.weightInPercentage < 1
                      ? 0
                      : getDecrementedAmount(
                          blockedLiquidity.weightInPercentage,
                          1
                        );

                  onUpdateBlockedLiquidity({
                    ...blockedLiquidity,
                    weightInPercentage,
                    amount: getAmountFromWeightInPercentage(weightInPercentage)
                  });
                }}
              />
            )}

            {showMaxLabel && (
              <BlockFontWeight500>
                Massimo{" "}
                {maxBlockedLiq > 0
                  ? percFormatter(getWeightInPercentage(maxBlockedLiq))
                  : percFormatter(0)}
              </BlockFontWeight500>
            )}
          </InlineBlock>
        </InnerRowExpand>
      </NeedsRow>

      {dtModalIsVisible && (
        <DossierTitoliModal
          visualOnly={visualOnly}
          onHide={() => setDtModalIsVisible(false)}
          title={
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.liquidity"}
            />
          }
          needsDistribution={liquidityAsset?.needsDistribution}
          onConfirm={onUpdateNeedsDistribution}
        />
      )}
    </>
  );
};

export default LiquidityRow;
