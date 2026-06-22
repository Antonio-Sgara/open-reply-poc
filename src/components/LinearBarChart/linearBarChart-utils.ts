import { linearBarChartElement } from "./LinearBarChart";

export const filterByPercentage = (elements: linearBarChartElement[]) => {
  return elements?.filter(el =>
    el?.value
      ? parseFloat(el?.value?.toFixed(2)) > 0
      : el?.percentage && parseFloat(el?.percentage?.toFixed(2))
  );
};

export const filterBySubLinePercentage = (
  elements: linearBarChartElement[]
) => {
  return elements?.filter(el => el.subLinePercentage > -1);
};
