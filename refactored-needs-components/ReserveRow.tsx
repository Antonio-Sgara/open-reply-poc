import React, { FC, Fragment, useState } from "react";
import { getNeedType, NeedsRow } from "./Needs-utils";
import { FormattedMessage } from "react-intl";
import {
  euroFormatter,
  getAmount,
  getDecrementedAmount,
  getIncrementedAmount,
  percFormatter,
  roundToTwoDecimal
} from "../../../utils";
import {
  InnerRowExpand,
  InnerTableExpand
} from "../../../FinancialTable/FinancialTable";
import AddElement from "../../../AddElement";
import BlockFontWeight500 from "../../../BlockFontWeight500";
import NeedsAnalysisCustomInput from "../NeedsAnalysisCustomInput";
import { Button } from "../../../Button/Button";
import NeedsAnalysisInputWithIncrement from "../NeedsAnalysisInputWithIncrement";
import { needsType } from "model/need";
import { useDispatch } from "react-redux";
import { saveNeedsAction } from "../../../../store/advanced-proposal/advanced-proposal.actions";
import InlineBlock from "../../../InlineBlock";
import { ReactComponent as JointedOwnershipIcon } from "assets/coiDashborad.svg";
import { DossierTitoliModal } from "./DossierTitoliModal";

const uniqid = require("uniqid");

const createEditableReserveItem = reserve => ({
  itemId: uniqid(),
  needItemId: reserve?.needItemId ?? -1,
  name: reserve?.name ?? "",
  amount: getAmount(reserve?.amount ?? ""),
  usedInProposal: reserve?.usedInProposal
});

const getEditableReserveItems = (needItemList = []) => {
  if (!needItemList.length) {
    return [createEditableReserveItem(undefined)];
  }

  return needItemList.map(createEditableReserveItem);
};

const ReserveRow = ({
  captiveFinancialAssets,
  financialAssets,
  reserveAsset,
  needs,
  setNeeds,
  CCTotal,
  visualOnly = false,
  id
}) => {
  const dispatch = useDispatch();
  const needItemList = reserveAsset.needItemList ? reserveAsset.needItemList : [];

  const [editableReserveItems, setEditableReserveItems] = useState(
    getEditableReserveItems(needItemList)
  );
  const [newLocalNeeds, setNewLocalNeeds] = useState(needs);
  const [dtModalIsVisible, setDtModalIsVisible] = useState(false);

  const getWeightInPercentage = amount => {
    const total = Number(financialAssets?.ctv || 0);

    return total > 0
      ? roundToTwoDecimal((Number(amount || 0) * 100) / total)
      : 0;
  };

  const getReserveCTV = reserveItems =>
    reserveItems.reduce((total, item) => total + Number(item?.amount || 0), 0);

  const getNeedItemsTotalCTV = needItems =>
    needItems.reduce((total, item) => total + Number(item?.amount || 0), 0);

  const buildReserveNeedItemList = reserveItems =>
    reserveItems.filter(Boolean).map(item => ({
      name: item.name,
      amount: item.amount,
      needItemId: item.needItemId,
      usedInProposal: item?.usedInProposal
    }));

  const updateReserveCTV = reserveItems => {
    const reserveCTV = getReserveCTV(reserveItems);
    const newNeedItemList = buildReserveNeedItemList(reserveItems);

    const newReserveAsset = {
      ...reserveAsset,
      needItemList: newNeedItemList,
      totalCTV: reserveCTV,
      totalWeightInPercentage: getWeightInPercentage(reserveCTV)
    };

    const newNeeds = [...needs];
    const newLiquidityAsset = getNeedType(newNeeds, needsType.LIQUIDITY);
    const newLiquidityItems = [...newLiquidityAsset.needItemList];

    newLiquidityAsset.totalCTV = getNeedItemsTotalCTV(newLiquidityItems);
    newLiquidityAsset.totalWeightInPercentage = getWeightInPercentage(
      newLiquidityAsset.totalCTV
    );

    newLiquidityItems.forEach(item => {
      item.weightInPercentage = getWeightInPercentage(item.amount);
    });

    const investmentAsset = getNeedType(newNeeds, needsType.INVESTMENT);

    investmentAsset.totalCTV =
      captiveFinancialAssets - newLiquidityAsset.totalCTV - reserveCTV;

    investmentAsset.totalWeightInPercentage = getWeightInPercentage(
      investmentAsset.totalCTV
    );

    if (investmentAsset.totalCTV < 0) {
      investmentAsset.totalCTV = 0;
    }

    if (investmentAsset.totalWeightInPercentage < 0) {
      investmentAsset.totalWeightInPercentage = 0;
    }

    const updatedNeeds = [
      ...newNeeds.filter(
        need =>
          need.needType !== needsType.RESERVE &&
          need.needType !== needsType.LIQUIDITY &&
          need.needType !== needsType.INVESTMENT
      ),
      investmentAsset,
      newReserveAsset,
      newLiquidityAsset
    ];

    setNeeds(updatedNeeds);
    setNewLocalNeeds(updatedNeeds);
    dispatch(saveNeedsAction(updatedNeeds));
  };

  const updateEditableReserveItem = updatedItem => {
    const nextItems = editableReserveItems.map(item =>
      item.itemId === updatedItem.itemId ? updatedItem : item
    );

    setEditableReserveItems(nextItems);
    updateReserveCTV(nextItems);
  };

  const onDelete = itemId => {
    const nextItems = editableReserveItems.filter(
      item => item.itemId !== itemId
    );

    setEditableReserveItems(nextItems);
    updateReserveCTV(nextItems);
  };

  const onAddReserveItem = () => {
    setEditableReserveItems([
      ...editableReserveItems,
      createEditableReserveItem(undefined)
    ]);
  };

  const onUpdateNeedsDistribution = newNeedsDistribution => {
    const newNeeds = [
      ...needs.filter(need => need.needType !== needsType.RESERVE),
      {
        ...reserveAsset,
        needsDistribution: newNeedsDistribution
      }
    ];

    setNeeds(newNeeds);
    setNewLocalNeeds(newNeeds);
    dispatch(saveNeedsAction(newNeeds));
    setDtModalIsVisible(false);
  };

  return (
    <>
      <NeedsRow
        valueFirstCol={
          <div className="dtRowFlexContainer">
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.reserve"}
            />
            {!visualOnly &&
              Object.keys(reserveAsset?.needsDistribution)?.length > 1 && (
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
                    {Object.keys(reserveAsset.needsDistribution).length}
                  </div>
                </div>
              )}
          </div>
        }
        id={id}
        valueCTV={euroFormatter(reserveAsset.totalCTV)}
        valueWeight={percFormatter(reserveAsset.totalWeightInPercentage)}
        color={"#26A69A"}
      >
        {visualOnly ? (
          needItemList.length === 0 ? null : (
            needItemList?.map((item, index) => (
              <InnerRowExpand key={index}>
                <InlineBlock style={{ width: "81%" }}>{item.name}</InlineBlock>
                <InlineBlock style={{ width: "11%", paddingLeft: 5 }}>
                  {euroFormatter(item.amount)}
                </InlineBlock>
                <InlineBlock style={{ width: "15%", paddingLeft: 18 }}>
                  {percFormatter(item.weightInPercentage)}
                </InlineBlock>
              </InnerRowExpand>
            ))
          )
        ) : (
          <InnerTableExpand columns={<Fragment />}>
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
              style={{ width: "15%" }}
            >
              <FormattedMessage id={"customer.IncomePanel.amount"} />
            </InlineBlock>

            <InlineBlock
              className={"innerTableExpand__ContentTitle"}
              style={{ width: "5%" }}
            >
              <FormattedMessage
                id={"advancedConsultancyProposal.needs.table.weight"}
              />
            </InlineBlock>

            {editableReserveItems.map(item => (
              <EditableChildren
                key={item.itemId}
                item={item}
                captiveFinancialAssets={captiveFinancialAssets}
                financialAssets={financialAssets}
                CCTotal={CCTotal}
                disabled={item?.usedInProposal}
                needs={newLocalNeeds}
                onDelete={() => onDelete(item.itemId)}
                onChange={updateEditableReserveItem}
              />
            ))}

            <AddElement
              style={{ marginTop: 20 }}
              onClick={onAddReserveItem}
              label={"AGGIUNGI VOCE"}
            />
          </InnerTableExpand>
        )}
      </NeedsRow>

      {dtModalIsVisible && (
        <DossierTitoliModal
          visualOnly={visualOnly}
          onHide={() => setDtModalIsVisible(false)}
          title={
            <FormattedMessage
              id={"advancedConsultancyProposal.needs.table.reserve"}
            />
          }
          needsDistribution={reserveAsset?.needsDistribution}
          onConfirm={onUpdateNeedsDistribution}
        />
      )}
    </>
  );
};

interface IPropsEditableChildren {
  item;
  onDelete?;
  onChange?;
  captiveFinancialAssets;
  financialAssets?;
  CCTotal: number;
  disabled?: boolean;
  needs?: any;
}

const EditableChildren: FC<IPropsEditableChildren> = ({
  item,
  onDelete = () => undefined,
  onChange = () => undefined,
  captiveFinancialAssets,
  financialAssets,
  CCTotal,
  disabled,
  needs
}) => {
  const [name, setName] = useState(item.name);
  const [needItemId, setNeedItemId] = useState(item.needItemId);
  const [amount, setAmount] = useState(item.amount);
  const [formattedAmount, setFormattedAmount] = useState(
    euroFormatter(item.amount)
  );
  const [showMaxLabel, setShowMaxLabel] = useState(false);
  const [max, setMax] = useState(
    CCTotal -
      getNeedType(needs, needsType.LIQUIDITY).totalCTV -
      getNeedType(needs, needsType.RESERVE).totalCTV
  );

  const getWeightInPercentage = value => {
    const total = Number(financialAssets?.ctv || 0);

    return total > 0
      ? roundToTwoDecimal((Number(value || 0) * 100) / total)
      : 0;
  };

  const updateItem = nextValues => {
    onChange({
      ...item,
      itemId: item.itemId,
      needItemId,
      name,
      amount: getAmount(amount),
      ...nextValues
    });
  };

  const refreshMax = () => {
    if (CCTotal > 0) {
      setMax(
        CCTotal -
          getNeedType(needs, needsType.LIQUIDITY).totalCTV -
          getNeedType(needs, needsType.RESERVE).totalCTV
      );
    }
  };

  return (
    <InnerRowExpand style={{ padding: 10 }}>
      <BlockFontWeight500
        style={{
          width: `70%`,
          verticalAlign: showMaxLabel ? "baseline" : "middle"
        }}
      >
        <NeedsAnalysisCustomInput
          disabled={disabled}
          onChange={e => {
            if (
              captiveFinancialAssets === null ||
              captiveFinancialAssets === undefined
            ) {
              return;
            }

            const nextName = e.target.value;

            setName(nextName);
            updateItem({
              name: nextName,
              amount: getAmount(amount)
            });
          }}
          value={name}
        />
      </BlockFontWeight500>

      <BlockFontWeight500
        style={{
          width: "15%",
          marginLeft: "-8px",
          verticalAlign: showMaxLabel ? "top" : "middle"
        }}
      >
        <NeedsAnalysisInputWithIncrement
          disabled={disabled}
          onFocus={() => {
            refreshMax();
            setShowMaxLabel(true);
          }}
          onBlur={() => setShowMaxLabel(false)}
          isAllowed={({ value, floatValue }) => {
            if (value?.indexOf("-") >= 0) return false;
            if (value === "") return true;

            return Number(floatValue || 0) - Number(item.amount || 0) <= max;
          }}
          isCurrency={true}
          value={formattedAmount}
          onValueChange={values => {
            const { value, formattedValue } = values;

            setAmount(value);
            setFormattedAmount(formattedValue);
            updateItem({
              amount: getAmount(value)
            });
          }}
          onAdd={() => {
            const newAmount = getIncrementedAmount(amount || 0, 1);

            if (newAmount > max) {
              return;
            }

            setAmount(newAmount);
            setFormattedAmount(euroFormatter(newAmount));
            updateItem({
              amount: getAmount(newAmount)
            });
          }}
          onSubtract={() => {
            const newAmount = getDecrementedAmount(amount, 1);

            setAmount(newAmount);
            setFormattedAmount(euroFormatter(newAmount));
            updateItem({
              amount: getAmount(newAmount)
            });
          }}
        />

        {showMaxLabel && (
          <BlockFontWeight500>
            Massimo {max > 0 ? euroFormatter(max, true) : euroFormatter(0)}
          </BlockFontWeight500>
        )}
      </BlockFontWeight500>

      <BlockFontWeight500
        style={{
          width: "8%",
          paddingTop: "6px",
          verticalAlign: showMaxLabel ? "baseline" : "middle",
          textAlign: "right",
          paddingRight: "1em"
        }}
      >
        {percFormatter(getWeightInPercentage(amount))}
      </BlockFontWeight500>

      <BlockFontWeight500
        className={"text-center"}
        style={{
          width: "7%",
          paddingLeft: 13,
          verticalAlign: showMaxLabel ? "baseline" : "middle"
        }}
      >
        <Button
          onClick={onDelete}
          name=""
          size="icon-sm"
          fontIcon="icon-delete"
          className={"float-right"}
          styleButton={{ height: "38px", width: "38px" }}
          disabled={disabled}
          tertiary
        />
      </BlockFontWeight500>
    </InnerRowExpand>
  );
};

export default ReserveRow;
