import { isEmpty } from "lodash";
import { AdvancedSearchPanelFilterProps } from "components/AdvancedSearchPanel/AdvancedSearchPanel";

export const isFiltersEmpty = (
  filters: AdvancedSearchPanelFilterProps
): boolean => {
  if (isEmpty(filters)) return true;
  else {
    let testFilters = true;
    const filterIds = Object.keys(filters);
    for (let i = 0; i < filterIds.length; i++) {
      if (filters[filterIds[i]] && filters[filterIds[i]].length > 0) {
        testFilters = false;
        break;
      }
    }
    return testFilters;
  }
};

export const filterStatusDetail = (status: any, list: any) => {
  if (!Array.isArray(status)) status = [];

  return list?.map((statuses: any) => ({
    ...statuses,
    hideStatusDetail:
      status.length > 0 && !status?.includes(statuses.proposalStatus)
  }));
};
