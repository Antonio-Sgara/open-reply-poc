import { setDatasetColor } from "tools/financialAssets";
import { financialAssetTypes } from "../../model/financial-assets";
import { IFilters } from "../../components/FilterButtons/FilterButtons";
import { FormattedMessage } from "react-intl";
import React from "react";
import BestInClass from "../../components/BestInClass/BestInClass";
import { percFormatter } from "../../components/utils";

export const caaFirstLevelType: Record<string, string> = {
  GP: "Gestioni patrimoniali",
  FUND: "Fondi",
  STOCK: "Azioni",
  BOND: "Obbligazioni",
  MULTIASSET: "Multiasset",
  CASH: "Cash",
  OPPORTUNITY: "Oppurtunity",
  LIQUIDITY: "Liquidità",
  POLICY: "Polizza finanziaria",
  ETC_ETF: "ETC/ETF",
  OTHER: "Altri",
  CERTIFICATE: "Certificati Di Deposito",
  INVESTMENT_CERTIFICATE: "Invesment certificate"
};

export const getMainTableData = (product: any) => {
  return {
    columns: [
      "ISIN",
      "Società",
      "Tipologia",
      "Asset class I livello",
      "Asset class II livello",
      "Asset class III livello",
      "Divisa",
      "BIC",
      "ECO-SOSTENIBILE",
      "SOSTENIBILE",
      "PAI",
      "CEDOLA"
    ],
    values: [
      product.isin || "- -",
      product.managementCompany,
      <FormattedMessage
        id={`common.label.productType.${product?.productType}`}
      />,
      product.commercialAssetFirstLevel,
      product.commercialAssetSecondLevel,
      product.commercialAssetThirdLevel,
      product.currency,
      <BestInClass bic={product.bicType} />,
      `${product.ecoSustainable ? "SI" : "NO"}`,
      `${product.sustainable ? "SI" : "NO"}`,
      `${product.pai !== undefined ? (product.pai ? "SI" : "NO") : "-"}`,
      `${product.coupon ? "SI" : "NO"}`
    ]
  };
};

export const getPortfolioProductTableData = (
  product: any,
  productType: string,
  compressed: any
) => {
  const compressedFields = {
    columns: [],
    values: []
  };
  const commonColumns = [
    "ISIN",
    "Tipologia",
    "Emittente",
    ...compressedFields.columns
  ];
  const commonValues = [
    product.isin,
    caaFirstLevelType[product.category],
    product.issuer,
    ...compressedFields.values
  ];

  const gpCommonCols = ["Nome famiglia", "Tipologia", "Emittente"];
  const gpCommonValues = [
    product.familyName,
    caaFirstLevelType[product.category],
    product.issuer
  ];

  switch (productType) {
    case "FUND":
    case "POLICY":
      return {
        columns: [
          ...commonColumns,
          "Dettaglio Asset Class",
          "Modalità di sottoscrizione",
          "Divisa",
          "Rendimento ultimo anno"
        ],
        values: [
          ...commonValues,
          product.commercialAssetThirdLevel,
          product.subscriptionMethod,
          product.currency,
          percFormatter(product?.yieldLastYear)
        ]
      };
    case "STOCK":
      return {
        columns: [
          ...commonColumns,
          "Dettaglio Asset Class",
          "Dividendi",
          "Divisa",
          "Mercato",
          "Rendimento ultimo anno"
        ],
        values: [
          ...commonValues,
          product.commercialAssetThirdLevel,
          product.dividend,
          product.currency,
          product.market,
          percFormatter(product?.yieldLastYear)
        ]
      };
    case "BOND":
      return {
        columns: [
          ...commonColumns,
          "Data prossima cedola",
          "Mercato",
          "Divisa",
          "Rendimento ultimo anno",
          "Scadenza"
        ],
        values: [
          ...commonValues,
          product.nextCouponDate,
          product.market,
          product.currency,
          percFormatter(product?.yieldLastYear),
          product.expireDate
        ]
      };
    case "GP":
      return {
        columns: [
          ...gpCommonCols,
          "Dettaglio Asset Class",
          "Dividendi",
          "Mercato",
          "Divisa",
          "Rendimento ultimo anno"
        ],
        values: [
          ...gpCommonValues,
          product.commercialAssetThirdLevel,
          product.dividend,
          product.market,
          product.currency,
          percFormatter(product?.yieldLastYear)
        ]
      };
    default:
      return {
        columns: [],
        values: []
      };
  }
};

export const getChartData = (tableData: any) => {
  if (!tableData) return [];
  return [...tableData].map((dataset: any) => ({
    name: dataset.name,
    color: setDatasetColor(dataset.type),
    percentage: dataset.weightInPercentage
  }));
};

export const ILevelColumns = [
  {
    name: "ASSET CLASS",
    sortable: false
  },
  {
    name: "PESO",
    sortable: true,
    id: "weightInPercentage"
  }
];

export const IILevelColumns = (secondaryFilter: IFilters) => {
  const name =
    secondaryFilter.id === financialAssetTypes.BOND_DURATION
      ? "Duration"
      : secondaryFilter.id === financialAssetTypes.BOND_RATING
        ? "Rating"
        : secondaryFilter.id === financialAssetTypes.BOND_SECTOR_BASED
          ? "Tipologia"
          : secondaryFilter.id === financialAssetTypes.STOCK_GEOGRAPHIC
            ? "Aree Geografiche"
            : secondaryFilter.id === financialAssetTypes.STOCK_SECTOR_BASED
              ? "Settori"
              : "Nome";
  return [
    {
      name: name,
      sortable: false
    },
    {
      name: "PESO",
      sortable: true,
      id: "weightInPercentage"
    }
  ];
};

export const infoMifidTableHeaders = [
  "Complessità",
  "Rischio credito",
  "Rischio mercato",
  "Rischio Liquidità",
  "BIC",
  "Eco-sostenibile",
  "Sostenibile",
  "PAI",
  "Categoria prodotto MiFID",
  "Bail-in"
];

export const targetMarketTableHeaders = {
  customerClass: "Tipologia di clientela",
  knowledgeProfile: "Conoscenza ed esperienza",
  riskProfile: "Profilo di rischio",
  sustainabilityRiskTM: "Profili di sostenibilità",
  holdingPeriodProfile: "Holding period"
};

export const loadTableHeaders = [
  "Prezzo medio di carico (€)",
  "Cambio medio di carico (%)",
  "Quantità",
  "Controvalore di carico (€)"
];

export const marketTableHeaders = [
  "Prezzo medio di mercato",
  "Cambio medio di mercato (%)",
  "Quantità",
  "Controvalore di mercato (€)"
];

export const marketTableHeadersForFund = [
  "Prezzo medio di mercato (€)",
  "Cambio medio di mercato (%)",
  "Quantità",
  "Controvalore di mercato (€)"
];

export const profitLossTableHeaders = [
  "U/P (€)",
  "U/P (%)",
  "Effetto cambio (%)"
];
