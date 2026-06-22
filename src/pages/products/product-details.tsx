import React from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import Title from "../../components/Title/Title";
import { Button } from "../../components/Button/Button";
import { history } from "../../store/store";
import { WidgetProductDetailsHeader } from "../../components/widget/WidgetProductDetailsHeader/WidgetProductDetailsHeader";
import FinancialPanel from "../../components/FinancialPanel";
import LinearBarChart from "../../components/LinearBarChart";
import { FinancialAssetAllocationTable } from "../../components/FinancialAssetAllocationTable/FinancialAssetAllocationTable";
import { HandleComponentErrors } from "../../hoc/HandleComponentErrors";
import SimpleTable, {
  TrColumnNames,
  TrTableRow
} from "../../components/simpleTable/simpleTable";
import Sorter from "../../components/Sorter/Sorter";
import { productDescriptionType } from "../../model/product";
import { getChartData, ILevelColumns, IILevelColumns } from "./products-utils";
import {
  fAssetAllCurrencyExposureHeaders,
  setFAASecondLevelHeaders,
  sortFAA2nd
} from "../../components/widget/WidgetFinancialAdviceAssetAllocationCard/faaUtils";
import { sortCAA } from "../../components/widget/WidgetFinancialAdviceAssetAllocationCard/caaUtils";
import { variableFloatingPoint } from "../../tools/common";
import { defaultSelected } from "../../tools/financialAssets";
import "./product-details.scss";

export enum MWRRPerformanceType {
  "Year to date (YTD)" = "YEAR_TO_DATE",
  "since inception" = "SINCE_INCEPTION",
  "ultimi 3 mesi" = "LAST_THREE_MONTH",
  "ultimi 6 mesi" = "LAST_SIX_MONTH",
  "1 anno" = "LAST_YEAR",
  "3 anni" = "LAST_THREE_YEARS",
  "5 anni" = "LAST_FIVE_YEARS",
  "Seleziona Periodo" = "CUSTOM"
}

interface IProps {
  product: any;
  loading?: boolean;
  error?: string | null;
}

const getDescription = (product: any) => {
  return (
    product?.descriptions?.find(
      (description: any) =>
        description.productId === product.productId &&
        description.descriptionType === productDescriptionType.INVESTMENT_POLICE
    )?.description || "Nessuna descrizione da visualizzare"
  );
};

const normalizeFirstLevel = (items: any[] = []) =>
  items.map(item => ({
    ...item,
    firstLevelType: item.firstLevelType || item.type
  }));

const hasRows = (items: any[] | undefined) => Array.isArray(items) && items.length > 0;

export const ProductDetails: React.FC<IProps> = ({ product, loading, error }) => {
  if (loading) {
    return (
      <Container className="productDetails">
        <div className="productDetails__panel">Caricamento dettaglio prodotto...</div>
      </Container>
    );
  }

  if (!product || error) {
    return (
      <Container className="productDetails">
        <div className="productDetails__topbar">
          <Button
            secondary
            name="INDIETRO"
            size="thin"
            onClick={() => history.goBack()}
          />
        </div>
        <div className="productDetails__panel">
          <Title.Page name="Prodotto non trovato" />
          <p className="productDetails__muted">
            Non sono disponibili informazioni per questo prodotto.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="productDetails">
      <div className="productDetails__topbar">
        <Button
          secondary
          name="INDIETRO"
          size="thin"
          onClick={() => history.goBack()}
        />
      </div>
      <Title.Page name="Dettaglio prodotto" />
      <WidgetProductDetailsHeader
        product={product}
        productType={product?.caaFirstLevelType}
      />
      <Tabs
        className="tabsCustomSection mb-4 mt-4"
        defaultActiveKey="overview"
        id="product-detail-tabs"
      >
        <Tab eventKey="overview" title={<Title.Tab name="Overview" />}>
          <ProductOverview product={product} />
        </Tab>
      </Tabs>
    </Container>
  );
};

const ProductOverview = ({ product }: { product: any }) => {
  const faaFirstLevel = product?.faaFirstLevelComponents || [];
  const faaSecondLevel = product?.faaSecondLevelComponents || [];
  const faaCurrencies = product?.faaCurrencies || [];
  const mainSecurities = product?.mainSecurities || [];
  const secondaryDropdown = defaultSelected.secondary;

  return (
    <div className="productDetails__overview">
      <Title.Widget className="mt-5 mb-3" name="Politica d'investimento" />
      <FinancialPanel title="">
        <p className="productDetails__description">{getDescription(product)}</p>
      </FinancialPanel>

      <Title.Widget className="mt-5 mb-3" name="Asset Allocation Finanziaria" />
      <HandleComponentErrors
        showError={
          !hasRows(faaFirstLevel) && !hasRows(faaSecondLevel) && !hasRows(faaCurrencies)
        }
        errorMsg="Nessun dato da visualizzare"
        errorMsgClassName="text-left pt-3"
      >
        <FinancialPanel title="">
          <LinearBarChart
            elements={getChartData(sortCAA(normalizeFirstLevel(faaFirstLevel), null, "type"))}
            className="widgetFinancialAdviceAssetComposition__chart"
          />

          <div className="productDetails__allocationSections">
            <section>
              <Title.Widget name="I Livello" className="productDetails__sectionTitle" />
              <HandleComponentErrors
                showError={!hasRows(faaFirstLevel)}
                errorMsg="Nessun dato da visualizzare"
                errorMsgClassName="text-left pt-3"
              >
                <FinancialAssetAllocationTable
                  columns={ILevelColumns}
                  data={normalizeFirstLevel(sortCAA(faaFirstLevel, null, "type"))}
                />
              </HandleComponentErrors>
            </section>

            <section>
              <Title.Widget name="II Livello" className="productDetails__sectionTitle" />
              <HandleComponentErrors
                showError={!hasRows(faaSecondLevel)}
                errorMsg="Nessun dato da visualizzare"
                errorMsgClassName="text-left pt-3"
              >
                <FinancialAssetAllocationTable
                  columns={IILevelColumns(secondaryDropdown)}
                  data={sortFAA2nd(faaSecondLevel, secondaryDropdown.id, "weightInPercentage", true)}
                  stackedChart
                  headers={setFAASecondLevelHeaders(secondaryDropdown)}
                />
              </HandleComponentErrors>
            </section>

            <section>
              <Title.Widget name="Esp. Valutaria" className="productDetails__sectionTitle" />
              <HandleComponentErrors
                showError={!hasRows(faaCurrencies)}
                errorMsg="Nessun dato da visualizzare"
                errorMsgClassName="text-left pt-3"
              >
                <FinancialAssetAllocationTable
                  data={sortFAA2nd(
                    faaCurrencies.map((currency: any) => ({
                      ...currency,
                      name:
                        currency.name?.toUpperCase() === "OTHER"
                          ? "Altro"
                          : currency.name
                    })),
                    null,
                    "weightInPercentage"
                  )}
                  headers={fAssetAllCurrencyExposureHeaders}
                  weightChart
                />
              </HandleComponentErrors>
            </section>
          </div>
        </FinancialPanel>
      </HandleComponentErrors>

      <Title.Widget className="mt-5 mb-3" name="Principali Titoli" />
      <HandleComponentErrors
        showError={!hasRows(mainSecurities)}
        errorMsg="Nessun dato da visualizzare"
        errorMsgClassName="text-left"
      >
        <SimpleTable className="scrollBar">
          <thead>
            <TrColumnNames>
              <th style={{ width: "90%" }} className="pl-4">
                TITOLI
              </th>
              <th>
                <Sorter
                  name="PESO"
                  onSort={() => null}
                  sortKey="weightInPercentage"
                  current=""
                />
              </th>
            </TrColumnNames>
          </thead>
          <tbody>
            {mainSecurities.map((security: any, index: number) => (
              <TrTableRow key={index}>
                <td className="font-weight-normal pl-4">{security.name}</td>
                <td className="font-weight-bold">
                  {variableFloatingPoint(parseFloat(security.weightInPercentage))} %
                </td>
              </TrTableRow>
            ))}
          </tbody>
        </SimpleTable>
      </HandleComponentErrors>
    </div>
  );
};
