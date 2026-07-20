import {
  AdvancedSearchPanelFilterProps,
  AdvancedSearchPanelModelProps,
  AdvancedSearchPanelModelTypes
} from "components/AdvancedSearchPanel/AdvancedSearchPanel";
import {
  getOptionsFromEnum,
  yesNoOptions
} from "components/CustomSelect2/utils";
import { productTypes } from "./proposal";

export interface AdvancedFilterForProductDTO {
  [key: string]: any;
}

export interface FundsAnalysisSearchForProductDTO {
  [key: string]: any;
}

export interface IFiltersDTO {
  [key: string]: any;
}

export interface ProductDetailsDTO {
  [key: string]: any;
}

export enum productDescriptionType {
  INVESTMENT_POLICE = "INVESTMENT_POLICE"
}

export const productDetailIncludedFields = [
  "DESCRIPTIONS",
  "FAAFIRSTLEVELCOMPONENTS",
  "FAASECONDLEVELCOMPONENTS",
  "FAACURRENCIES",
  "MAINSECURITIES",
  "RISKINDICATORS",
  "ANALYSISVARIABLE"
];

export const advancedProductSearchModel = (
  isProposal = false
): AdvancedSearchPanelModelProps[] => [
  {
    id: "productType",
    label: "TIPOLOGIA PRODOTTO",
    options: getOptionsFromEnum(productTypes),
    isMultiselect: true
  },
  {
    id: "commercialAssetFirstLevel",
    label: "ASSET CLASS I° LIVELLO",
    options: [],
    isMultiselect: true
  },
  {
    id: "commercialAssetSecondLevel",
    label: "ASSET CLASS II° LIVELLO",
    options: [],
    isMultiselect: true
  },
  {
    id: "commercialAssetThirdLevel",
    label: "ASSET CLASS III° LIVELLO",
    options: [],
    isMultiselect: true
  },
  {
    id: "managementCompany",
    label: "SOCIETA/COMPAGNIA",
    options: [],
    type: AdvancedSearchPanelModelTypes.ASYNC_SELECT,
    placeholder: "Cerca per nome...",
    isMultiselect: true,
    secondaryPlaceholder: "Inserisci una societa"
  },
  {
    id: "currency",
    label: "DIVISA",
    options: [],
    isMultiselect: false
  },
  {
    id: "bestInClass",
    label: "BIC",
    options: yesNoOptions
  },
  !isProposal
    ? {
        id: "ecoSustainable",
        label: "ECO-SOSTENIBILE",
        options: yesNoOptions
      }
    : null,
  !isProposal
    ? {
        id: "sustainable",
        label: "SOSTENIBILE",
        options: yesNoOptions
      }
    : null,
  !isProposal
    ? {
        id: "pai",
        label: "PAI",
        options: yesNoOptions
      }
    : null,
  {
    id: "coupon",
    label: "CEDOLA",
    options: yesNoOptions
  },
  !isProposal
    ? {
        id: "riskKiid",
        label: "SRRI",
        options: []
      }
    : null,
  !isProposal
    ? {
        id: "isPlaced",
        label: "COLLOCAMENTO",
        options: yesNoOptions,
        defaultValues: ["true"]
      }
    : null
].filter(Boolean) as AdvancedSearchPanelModelProps[];

export const fundsCategoriesAnalysisModel: AdvancedSearchPanelModelProps[] = [
  {
    id: "commercialAssetFirstLevel",
    label: "ASSET CLASS I° LIVELLO",
    options: [],
    isMultiselect: false,
    required: true
  },
  {
    id: "commercialAssetSecondLevel",
    label: "ASSET CLASS II° LIVELLO",
    options: [],
    isMultiselect: false,
    required: true
  },
  {
    id: "commercialAssetThirdLevel",
    label: "ASSET CLASS III° LIVELLO",
    options: [],
    isMultiselect: false,
    required: true
  },
  {
    id: "coupon",
    label: "CEDOLA",
    options: yesNoOptions,
    isMultiselect: false
  },
  {
    id: "changeRisk",
    label: "RISCHIO DI CAMBIO",
    options: yesNoOptions,
    isMultiselect: false
  },
  {
    id: "isPlaced",
    label: "COLLOCAMENTO",
    options: yesNoOptions,
    isMultiselect: false,
    defaultValues: ["true"]
  }
];

export const updateValuesForAssetLevels = (
  filtersDTO: IFiltersDTO | AdvancedSearchPanelFilterProps
) => {
  if (
    !("commercialAssetFirstLevel" in filtersDTO) ||
    filtersDTO.commercialAssetFirstLevel.length === 0
  ) {
    delete filtersDTO.commercialAssetSecondLevel;
    delete filtersDTO.commercialAssetThirdLevel;
  }
  if (
    !("commercialAssetSecondLevel" in filtersDTO) ||
    filtersDTO.commercialAssetSecondLevel.length === 0
  ) {
    delete filtersDTO.commercialAssetThirdLevel;
  }

  return filtersDTO;
};

export function productTypeMapper(type: string) {
  switch (type) {
    case "FUND":
      return "Fondi comuni";
    case "STOCK":
      return "Azioni";
    case "BOND":
      return "Obbligazioni";
    case "GP":
      return "Gestioni Patrimoniali";
    case "POLICY":
      return "Polizze Finanziarie";
    case "CERTIFICATE":
      return "Certificati Di Deposito";
    case "ETC_ETF":
      return "ETC/ETF";
    case "INVESTMENT_CERTIFICATE":
      return "Investment Certificate";
    case "OTHER":
      return "Altro";
    default:
      return type;
  }
}

const getOptionsFromSet = (
  options: AdvancedFilterForProductDTO | {},
  id: string,
  activeFilters?: AdvancedSearchPanelFilterProps
) => {
  const availableValues = Array.isArray((options as any)[id])
    ? (options as any)[id]
    : [];
  const selectedValues = Array.isArray(activeFilters?.[id])
    ? activeFilters?.[id]
    : [];
  const uniqueValues = [...availableValues, ...selectedValues].filter(
    (value, index, values) =>
      values.findIndex(candidate => String(candidate) === String(value)) === index
  );

  return uniqueValues.map((key: any) => {
    const stringKey = key?.toString();
    const isBoolean =
      typeof key === "boolean" || stringKey === "true" || stringKey === "false";

    return isBoolean
      ? { value: stringKey, label: stringKey === "true" ? "Sì" : "No" }
      : {
          value: stringKey,
          label: id === "riskKiid" && Number(key) === 0 ? "Vuoto" : key
        };
  });
};

export const advancedProductSearchModelOptions = (
  filterOptions: AdvancedFilterForProductDTO | {},
  activeFilters: AdvancedSearchPanelFilterProps,
  isSwitchingFund?: boolean,
  isProposal = false
): AdvancedSearchPanelModelProps[] => {
  activeFilters = updateValuesForAssetLevels(activeFilters);
  return [
    {
      id: "productType",
      label: "TIPOLOGIA PRODOTTO",
      options: getOptionsFromSet(filterOptions, "productType", activeFilters).map(option => ({
        value: option.value,
        label: productTypeMapper(String(option.label))
      })),
      isMultiselect: true,
      disabled: isSwitchingFund
    },
    {
      id: "commercialAssetFirstLevel",
      label: "ASSET CLASS I° LIVELLO",
      options: getOptionsFromSet(
        filterOptions,
        "commercialAssetFirstLevel",
        activeFilters
      ),
      isMultiselect: true
    },
    {
      id: "commercialAssetSecondLevel",
      label: "ASSET CLASS II° LIVELLO",
      options:
        activeFilters["commercialAssetFirstLevel"]?.length > 0
          ? getOptionsFromSet(
              filterOptions,
              "commercialAssetSecondLevel",
              activeFilters
            )
          : [],
      isMultiselect: true,
      disabled:
        !("commercialAssetFirstLevel" in activeFilters) ||
        activeFilters["commercialAssetFirstLevel"]?.length === 0
    },
    {
      id: "commercialAssetThirdLevel",
      label: "ASSET CLASS III° LIVELLO",
      options:
        activeFilters["commercialAssetSecondLevel"]?.length > 0
          ? getOptionsFromSet(
              filterOptions,
              "commercialAssetThirdLevel",
              activeFilters
            )
          : [],
      isMultiselect: true,
      disabled:
        !("commercialAssetSecondLevel" in activeFilters) ||
        activeFilters["commercialAssetSecondLevel"]?.length === 0
    },
    {
      id: "managementCompany",
      label: "SOCIETA/COMPAGNIA",
      options: getOptionsFromSet(filterOptions, "managementCompany", activeFilters),
      type: AdvancedSearchPanelModelTypes.ASYNC_SELECT,
      placeholder: "Cerca per nome...",
      isMultiselect: true,
      secondaryPlaceholder: "Inserisci una societa",
      disabled: isSwitchingFund
    },
    {
      id: "currency",
      label: "DIVISA",
      options: getOptionsFromSet(filterOptions, "currency", activeFilters),
      isMultiselect: false
    },
    {
      id: "bestInClass",
      label: "BIC",
      options: getOptionsFromSet(filterOptions, "bestInClass", activeFilters)
    },
    !isProposal
      ? {
          id: "ecoSustainable",
          label: "ECO-SOSTENIBILE",
          options: getOptionsFromSet(filterOptions, "ecoSustainable", activeFilters)
        }
      : null,
    !isProposal
      ? {
          id: "sustainable",
          label: "SOSTENIBILE",
          options: getOptionsFromSet(filterOptions, "sustainable", activeFilters)
        }
      : null,
    !isProposal
      ? {
          id: "pai",
          label: "PAI",
          options: getOptionsFromSet(filterOptions, "pai", activeFilters)
        }
      : null,
    {
      id: "coupon",
      label: "CEDOLA",
      options: getOptionsFromSet(filterOptions, "coupon", activeFilters)
    },
    !isProposal
      ? {
          id: "riskKiid",
          label: "SRRI",
          options: getOptionsFromSet(filterOptions, "riskKiid", activeFilters)
        }
      : null,
    !isProposal
      ? {
          id: "isPlaced",
          label: "COLLOCAMENTO",
          options: getOptionsFromSet(filterOptions, "isPlaced", activeFilters),
          defaultValues: ["true"]
        }
      : null
  ].filter(Boolean) as AdvancedSearchPanelModelProps[];
};

export const fundsCategoriesAnalysisModelOptions = (
  filterOptions: FundsAnalysisSearchForProductDTO | {},
  activeFilters: AdvancedSearchPanelFilterProps
): AdvancedSearchPanelModelProps[] => {
  activeFilters = updateValuesForAssetLevels(activeFilters);
  return [
    {
      id: "commercialAssetFirstLevel",
      label: "ASSET CLASS I° LIVELLO",
      options: getOptionsFromSet(filterOptions, "commercialAssetFirstLevel"),
      isMultiselect: false,
      required: true
    },
    {
      id: "commercialAssetSecondLevel",
      label: "ASSET CLASS II° LIVELLO",
      options:
        activeFilters["commercialAssetFirstLevel"]?.length > 0
          ? getOptionsFromSet(filterOptions, "commercialAssetSecondLevel")
          : [],
      isMultiselect: false,
      disabled:
        !("commercialAssetFirstLevel" in activeFilters) ||
        activeFilters["commercialAssetFirstLevel"]?.length === 0,
      required: true
    },
    {
      id: "commercialAssetThirdLevel",
      label: "ASSET CLASS III° LIVELLO",
      options:
        activeFilters["commercialAssetSecondLevel"]?.length > 0
          ? getOptionsFromSet(filterOptions, "commercialAssetThirdLevel")
          : [],
      isMultiselect: false,
      disabled:
        !("commercialAssetSecondLevel" in activeFilters) ||
        activeFilters["commercialAssetSecondLevel"]?.length === 0,
      required: true
    },
    {
      id: "coupon",
      label: "CEDOLA",
      options: getOptionsFromSet(filterOptions, "coupon")
    },
    {
      id: "changeRisk",
      label: "RISCHIO DI CAMBIO",
      options: getOptionsFromSet(filterOptions, "changeRisk")
    },
    {
      id: "isPlaced",
      label: "COLLOCAMENTO",
      options: getOptionsFromSet(filterOptions, "isPlaced"),
      defaultValues: ["true"]
    }
  ];
};

export const CatalogueProductListHeaders = {
  preferred: "preferred",
  isin: "isin",
  productName: "productName",
  managementCompany: "managementCompany",
  productType: "productType",
  commercialAssetFirstLevel: "commercialAssetFirstLevel",
  bestInClass: "bestInClass",
  ecoSustainable: "ecoSustainable",
  sustainable: "sustainable",
  pai: "pai",
  riskKiid: "riskKiid",
  currency: "currency",
  coupon: "coupon",
  isPlaced: "isPlaced"
};
