import { roundToTwoDecimal } from "../../../utils";

export const getFinancialComponentTotal = (
  financialAssets,
  componentType: string
): number =>
  financialAssets?.financialBccComponentList?.find(
    item => item.financialBccComponentType === componentType
  )?.totalCtv || 0;

export const getWeightInPercentage = (
  amount,
  totalFinancialAssets,
  roundFn = roundToTwoDecimal
): number => {
  const total = Number(totalFinancialAssets || 0);

  return total > 0 ? roundFn((Number(amount || 0) * 100) / total) : 0;
};

export const getItemsTotalAmount = (items = []): number =>
  items.reduce((total, item) => total + Number(item?.amount || 0), 0);

export const replaceNeeds = (needs = [], updatedNeeds = []) => {
  const updatedTypes = updatedNeeds.map(need => need.needType);

  return [
    ...needs.filter(need => !updatedTypes.includes(need.needType)),
    ...updatedNeeds
  ];
};
