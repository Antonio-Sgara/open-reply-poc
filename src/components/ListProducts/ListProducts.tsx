import BestInClass from "components/BestInClass/BestInClass";
import CustomCheckbox from "components/CustomCheckbox/CustomCheckbox";
import Sorter from "components/Sorter/Sorter";
import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Favorite from "components/Favorite/Favorite";
import { TooltipWrapper } from "components/ProposalNumberTooltip/ProposalNumberTooltip";
import { percFormatter } from "components/utils";
import {
  bestExecutionStatusEnum,
  pacStatusEnum
} from "components/widget/WidgetFinancialAdviceAssetAllocationCard/productsUtils";
import _ from "lodash";
import { PATH } from "model/common";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchDefaultMarketPlaces,
  patchProducts
} from "store/product/product.service";
import { euroFormatter } from "components/utils";
import InputWithIncrement from "components/InputWithIncrement/InputWithIncrement";
import { updateProductsWithErrorsAction } from "store/proposal/proposal.actions";
import {
  computeNumberOfNextElements,
  unboundVariableFloatingPoint
} from "tools/common";
import { isPacEnabled } from "tools/proposal/pac";
import { isBccRpFund } from "tools/proposal/proposal";
import Loader from "../Loader/Loader";
import SimpleTable, {
  TrColumnNames,
  TrTableRow
} from "../simpleTable/simpleTable";
import SwitchInOutSection from "./SwitchInOutSection";
import { OverlayTrigger } from "react-bootstrap";
import { pledgePopover } from "components/FinancialAdviceProductsList/FinancialAdviceProductsList";
import { getDefaultMarketPrice, getDefaultOperationType } from "tools/product";
import { getSelectMarketOperationDetails } from "components/MarketTypeModal/utils";
import { fatcaAlertType, fatcaBankQualification } from "model/customer";
import Medal from "assets/illustrazione/functional/medal-orange.svg";
import SearchBar from "components/SearchBar";
import "./ListProducts.scss";

const INCREMENT_VALUE = 1000;
const DEFAULT_SEARCH_SIZE = 10;

interface IProps {
  products: any[];
  toggleAllVisible?: boolean;
  className?: string;
  onToggleProduct?: any;
  onToggleAll?: any;
  onSort?: any;
  allSelected?: any;
  fetchMore?: any;
  filterPreferred?: any;
  saveFilters?: any;
  lastPage?: boolean;
  activeSort?: any;
  sortStep?: any;
  loadingMore?: boolean;
  scalar?: boolean;
  preventClick?: boolean;
  updateProducts?: Function;
  showFavorites?: boolean;
  customCheckParam?: string;
  condensed?: boolean;
  isSwitchingFund?: boolean;
  isAddProduct?: boolean;
  remainingSwitchInFund?: number;
  tempProductCtv?: number;
  tempProductQuantity?: number;
  switchOutProduct?: any;
  setTempProductCtv?: (a: number | null) => void;
  setTempProductQuantity?: (a: number) => void;
  setRemainingSwitchInFund?: (a: number) => void;
  setSwitchInFundExceeded?: (a: boolean) => void;
  totalElements?: number;
  hasSort?: boolean;
  numberOfElements?: number;
  totalPages?: number;
  currentPage?: number;
  headers: any;
  spacedGetMore?: boolean;
  isSwitchingFundPolicy?: boolean;
  intestatarioNewProduct?: string;
  fatcaInfo?: any;
  isAddIBIPS?: boolean;
  handleSearchSwitchInIbips?: Function;
}

enum CtvErrorType {
  PAC_MULTIPLE_INVESTMENT = "PAC_MULTIPLE_INVESTMENT",
  MIN_INVESTMENT = "MIN_INVESTMENT"
}

const ListProducts: React.FC<IProps> = ({
  isSwitchingFund = false,
  setTempProductCtv = () => null,
  setTempProductQuantity = () => null,
  setRemainingSwitchInFund = () => null,
  setSwitchInFundExceeded = () => null,
  totalElements = 0,
  numberOfElements = 0,
  totalPages = 0,
  currentPage = 0,
  hasSort,
  headers = {},
  spacedGetMore = false,
  isSwitchingFundPolicy = false,
  fatcaInfo,
  isAddIBIPS = false,
  ...props
}) => {
  const [preferredList, setPreferred] = useState(new Set<any>(["preferredList"]));
  const [productWithCtvError, setProductWithCtvError] = useState<any>();
  const [minInvestableValueForError, setMinInvestableValueForError] = useState<
    number | undefined
  >();
  const [productCtvErrorType, setProductCtvErrorType] = useState<
    CtvErrorType | undefined
  >();
  const [inputQntFocused, setInputQntfocused] = useState<boolean>(false);
  const [inputCtvFocused, setInputCtvfocused] = useState<boolean>(false);
  const [loadingPreferred, setLoadingPreferred] = useState(false);
  const [selectedPreferred, setSelectedPreferred] = useState("");
  const [loadingMarketPlaces, setLoadingMarketPlaces] = useState({
    productId: null as any,
    loading: false
  });
  const [inputSearch, setInputSearch] = useState("");

  const proposalOperativityType = useSelector(
    (state: any) => state.proposal?.dto?.operativityType
  );

  useEffect(() => {
    collectPreferred(props.products);
  }, [props.products]);

  const isProductFiscalityUS = (isin: string) => {
    return (
      fatcaInfo &&
      fatcaInfo?.isinsWithAmericanTaxation?.find((single: any) => single === isin)
    );
  };

  const getFiscalityLabelUS = (isin: string) => {
    const { bankQualification, tipoBloccoSeCitUsa } = fatcaInfo || {};

    if (
      tipoBloccoSeCitUsa === fatcaAlertType.B &&
      (bankQualification === fatcaBankQualification.NQI ||
        bankQualification === fatcaBankQualification.QI)
    ) {
      return (
        <FormattedMessage
          id={"fatca.american.title.BLOCKING.NQI_QI"}
          values={{ isin }}
        />
      );
    }

    return isin;
  };

  const getSemanticHighlightClassName = (product: any) => {
    const rank = product?._semanticHighlight?.rank;
    if (!rank || rank > 3) return "";

    return `listProducts__semanticHighlight listProducts__semanticHighlight--${rank}`;
  };

  const getSemanticHighlightTitle = (product: any) => {
    const highlight = product?._semanticHighlight;
    if (!highlight) return undefined;

    const score =
      typeof highlight.score === "number"
        ? `Score ${highlight.score.toFixed(3)}`
        : undefined;
    const rules = highlight.matchedRules?.length
      ? highlight.matchedRules.join(", ")
      : undefined;

    return [score, rules].filter(Boolean).join(" - ");
  };

  const handlePreferredFilter = (_e: any, _id: any, preferred: boolean) => {
    props.filterPreferred?.(preferred);
  };

  const collectPreferred = (data: any[]) => {
    const prevPreferred = new Set(preferredList);
    data?.forEach(p => {
      if (p.preferred) prevPreferred.add(p.productId);
    });
    setPreferred(prevPreferred);
  };

  const patchData = (params: any, payload: any) => {
    return patchProducts(params, payload)
      .then(status => status)
      .catch(() => null);
  };

  const handleFavoriteToggle = (e: any, id: string, preferred: boolean) => {
    setSelectedPreferred(e.currentTarget.id);
    if (e.currentTarget.id == id) setLoadingPreferred(true);
    patchData({ productId: id }, { preferred })
      .then(status => {
        if (status == 200) {
          let preferredItems = new Set(preferredList);
          if (preferredItems.has(id) && preferredItems.size > 1) {
            preferredItems.delete(id);
          } else if (preferredItems.has(id) && preferredItems.size == 1) {
            preferredItems = new Set(["preferredList"]);
          } else {
            preferredItems.add(id);
          }
          setPreferred(preferredItems);
          props.updateProducts?.(preferredItems);
        }
        setLoadingPreferred(false);
      })
      .catch(() => {
        setLoadingPreferred(false);
      });
  };

  const updateProductQuantity = (product: any, ctv: number) => {
    const marketPrice = product?.marketPrice;
    const maxQuantity = (props.switchOutProduct?.initialCtv ?? 0) / marketPrice;
    const quantity = ctv / marketPrice;
    if (quantity > maxQuantity) {
      setTempProductQuantity(maxQuantity);
    } else {
      setTempProductQuantity(ctv / marketPrice || 0);
    }
  };

  const onIncrementSwitchFundValue = useCallback(
    (product: any, amount?: number) => {
      const minInvestmentValue = product?.asIsPosition
        ? product?.productMinimumInvestable?.minimumSuccessiveSubscriptionAmount
        : product?.productMinimumInvestable?.minimumInitialSubscriptionAmount;

      let currentCtv = Number(props.tempProductCtv);
      if (currentCtv == null) {
        currentCtv = amount || minInvestmentValue || 0;
      }
      let newProductCtv;
      if (amount && currentCtv === 0) {
        newProductCtv = amount;
      } else if (amount) {
        newProductCtv = currentCtv + amount;
      } else if (minInvestmentValue && currentCtv < minInvestmentValue) {
        newProductCtv = minInvestmentValue;
      } else {
        newProductCtv = currentCtv + INCREMENT_VALUE;
      }

      const maxCtv = props.switchOutProduct?.initialCtv ?? 0;
      if (newProductCtv > maxCtv) {
        newProductCtv = maxCtv;
      }

      updateProductQuantity(product, newProductCtv);
      setTempProductCtv(newProductCtv);
      checkCtvValidity(newProductCtv, product);
    },
    [props.switchOutProduct, props.tempProductCtv]
  );

  const onDecrementSwitchFundValue = useCallback(
    (product: any, amount?: number) => {
      const minInvestmentValue = product?.asIsPosition
        ? product?.productMinimumInvestable?.minimumSuccessiveSubscriptionAmount
        : product?.productMinimumInvestable?.minimumInitialSubscriptionAmount;
      const currentCtv = Number(props.tempProductCtv);
      let newProductCtv;
      if (amount && currentCtv <= amount) {
        newProductCtv = 0;
      } else if (amount && currentCtv > amount) {
        newProductCtv = currentCtv - amount;
      } else if (minInvestmentValue && currentCtv <= minInvestmentValue) {
        newProductCtv = 0;
      } else if (currentCtv > INCREMENT_VALUE) {
        newProductCtv = currentCtv - INCREMENT_VALUE;
      } else {
        newProductCtv = 0;
      }
      updateProductQuantity(product, newProductCtv);
      setTempProductCtv(newProductCtv);
      checkCtvValidity(newProductCtv, product);
    },
    [props.tempProductCtv]
  );

  const checkCtvValidity = (ctv: number, product: any) => {
    const minValue = product?.asIsPosition
      ? product?.productMinimumInvestable?.minimumSuccessiveSubscriptionAmount
      : product?.productMinimumInvestable?.minimumInitialSubscriptionAmount;
    const productId = product?.productId;

    let importoRataPac = 0;

    if (isBccRpFund(product) && isPacEnabled(product)) {
      importoRataPac =
        _.find(product?.pacInfo, {
          pacStatus: pacStatusEnum.PAC_IN_CORSO
        })?.importoRata ?? 0;
    }

    if (!ctv || !minValue || !productId) {
      setProductWithCtvError(null);
      setMinInvestableValueForError(undefined);
      setProductCtvErrorType(undefined);
      return;
    }

    const shouldDisplayPacMultipleError =
      importoRataPac > 0 && ctv >= minValue && ctv % importoRataPac !== 0;

    if (!isSwitchingFund && (ctv < minValue || shouldDisplayPacMultipleError)) {
      setProductWithCtvError(product);
      setMinInvestableValueForError(
        shouldDisplayPacMultipleError ? importoRataPac : minValue
      );
      setProductCtvErrorType(
        shouldDisplayPacMultipleError
          ? CtvErrorType.PAC_MULTIPLE_INVESTMENT
          : CtvErrorType.MIN_INVESTMENT
      );

      try {
        props.products.filter(
          productFromProps =>
            productFromProps.productId === productId &&
            _.isEqual(
              productFromProps.positionIdentifier,
              product?.positionIdentifier
            )
        )[0].belowMinInvestable = true;
      } catch (_e) {}
    } else {
      setProductWithCtvError(null);
      setMinInvestableValueForError(undefined);
      setProductCtvErrorType(undefined);
      try {
        props.products.filter(
          productFromProps =>
            productFromProps.productId === productId &&
            _.isEqual(
              productFromProps.positionIdentifier,
              product?.positionIdentifier
            )
        )[0].belowMinInvestable = false;
      } catch (_e) {}
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (productWithCtvError?.productId) {
      dispatch(
        updateProductsWithErrorsAction({
          error: !!productWithCtvError?.productId,
          showAlert: !!productWithCtvError?.productId,
          message: (
            <FormattedMessage
              id={`proposal.product.${
                productCtvErrorType === CtvErrorType.PAC_MULTIPLE_INVESTMENT
                  ? "valueHasToBeMultiple"
                  : "newSubscription"
              }.minInvestableError`}
              values={{
                minInvestable:
                  (minInvestableValueForError ?? 0) < 0.01
                    ? unboundVariableFloatingPoint(
                        minInvestableValueForError ?? 0
                      )
                    : euroFormatter(minInvestableValueForError)
              }}
            />
          )
        })
      );
    } else {
      dispatch(
        updateProductsWithErrorsAction({ showAlert: false, error: false })
      );
    }
  }, [dispatch, minInvestableValueForError, productCtvErrorType, productWithCtvError?.productId]);

  const quantityValueHandler = (values: any, product: any) => {
    const marketPrice = product.marketPrice;
    let tempQuantity = values.floatValue;
    if (Number.isNaN(tempQuantity)) {
      tempQuantity = 0;
    }
    const tempCtv = tempQuantity * marketPrice;
    setTempProductCtv(tempCtv);
    checkCtvValidity(tempCtv, product);
    updateProductQuantity(product, tempCtv);
  };

  const setProductMarketPlaceForPrimaryMarket = (marketPlaces: any[], product: any) => {
    if (marketPlaces && marketPlaces[0]) {
      product.marketPrice = marketPlaces[0].marketPrice;
      product.noMarketPriceFound = false;
      if (marketPlaces[0]?.marketTypeWrapper) {
        marketPlaces[0].trends = "INVESTMENT";
        marketPlaces[0].asIsPosition = false;
        const { defaultMarketType, defaultOperationType } = getDefaultOperationType(
          marketPlaces[0]
        );
        if (defaultMarketType) {
          if (defaultMarketType === "PRIMARY" && defaultOperationType) {
            marketPlaces[0].marketTypeWrapper.selectedMarketTypeDetail =
              getSelectMarketOperationDetails(
                marketPlaces[0],
                defaultMarketType,
                defaultOperationType
              );
          } else {
            marketPlaces[0].marketTypeWrapper.selectedMarketTypeDetail = {
              marketType: "SECONDARY"
            };
          }
        }
      }

      const { marketPrice, marketPriceInCurrency } = getDefaultMarketPrice(
        marketPlaces[0]
      );

      product.intestatario = props.intestatarioNewProduct;
      product.originalMarketPrice = marketPrice;
      product.originalMarketPriceInCurrency = marketPriceInCurrency;
      product.marketTypeWrapper = marketPlaces[0]?.marketTypeWrapper;
    } else {
      product.noMarketPriceFound = true;
    }
  };

  const [nextPageElements, setNextPageElements] = useState(DEFAULT_SEARCH_SIZE);

  useEffect(() => {
    computeNumberOfNextElements({
      defaultSearchSize: DEFAULT_SEARCH_SIZE,
      totalElements,
      numberOfElements,
      totalPages,
      currentPage,
      setNextPageElements
    });
  }, [currentPage, numberOfElements, totalElements, totalPages]);

  const canOperateOnFund = (product: any): boolean => {
    if (!product) return false;
    const { noMarketPriceFound } = product;
    if (noMarketPriceFound) return false;
    return true;
  };

  return (
    <>
      {isSwitchingFund && (
        <SwitchInOutSection
          switchOutProduct={props.switchOutProduct}
          condensed={props.condensed}
          remainingSwitchInFund={props.remainingSwitchInFund}
          scalar={props.scalar}
        />
      )}
      {props.switchOutProduct?.instrumentCategory === "IBIP" && (
        <div className="productsActionModal__searchWrapper">
          <SearchBar
            placeholder="ISIN"
            handleSubmit={(e: Event) =>
              props.handleSearchSwitchInIbips?.(e, inputSearch)
            }
            inputSearch={inputSearch}
            handleInputSearch={setInputSearch}
          />
        </div>
      )}
      <div className={`${props.className ? props.className : ""}`}>
        <SimpleTable scalarDisplay={props.scalar}>
          <>
            <thead>
              <TrColumnNames>
                {Object.keys(headers).map(header => {
                  return (
                    <th
                      key={header}
                      className={`${
                        isSwitchingFund && header === "managementCompany"
                          ? "with-left-padding"
                          : ""
                      } ${
                        header === "managementCompany"
                          ? "listProducts__managementCompany"
                          : ""
                      }`.trim()}
                    >
                      {header === "toggle" ? (
                        !isSwitchingFund &&
                        !isSwitchingFundPolicy &&
                        !isAddIBIPS && (
                          <CustomCheckbox
                            onChange={props.onToggleAll}
                            checked={
                              props.allSelected &&
                              props.products &&
                              props.products.length !== 0
                            }
                          />
                        )
                      ) : header === "preferred" ? (
                        <Favorite
                          preferred={props.showFavorites}
                          className="listProductsTh__preferred"
                          onToggle={handlePreferredFilter}
                        />
                      ) : hasSort && header !== "totalCostInPercentage" ? (
                        <FormattedMessage id={`common.label.${header}`} />
                      ) : header === "isin" ||
                        header === "quantity" ||
                        header === "isPlaced" ||
                        header === "ctv" ? (
                        <FormattedMessage id={`common.label.${header}`} />
                      ) : header === "totalCostInPercentage" &&
                        isSwitchingFundPolicy ? (
                        <FormattedMessage
                          id={`common.label.${header}`}
                          values={{ br: <br /> }}
                        />
                      ) : header === "exAnteCommission" ||
                        header === "exAnteCommissionGap" ? (
                        <FormattedMessage
                          id={`common.label.${header}`}
                          values={{ br: <br /> }}
                        />
                      ) : (
                        <Sorter
                          name={
                            <FormattedMessage id={`common.label.${header}`} />
                          }
                          onSort={props.onSort}
                          sortKey={header === "productName" ? "name" : header}
                          current={props.activeSort}
                          sortStep={props.sortStep}
                        />
                      )}
                    </th>
                  );
                })}
              </TrColumnNames>
            </thead>
            <tbody>
              {props.products &&
                props.products.length > 0 &&
                props.products.map((product, index) => (
                  <TrTableRow
                    key={`key_${index}_${product.productId}`}
                    className={`${product.belowMinInvestable
                      ? "investmentProspectList__trCTVError"
                      : ""} ${getSemanticHighlightClassName(product)}`.trim()}
                  >
                    {Object.keys(headers).map(header => (
                      <td
                          key={header}
                          className={`${
                            header === "managementCompany"
                              ? "text-break with-left-padding listProducts__managementCompany"
                              : header === "riskKiid"
                                ? "text-right"
                                : ""
                          }`.trim()}
                          style={{
                            background: isProductFiscalityUS(product.isin)
                              ? "#e9edf2"
                            : ""
                        }}
                      >
                        {header === "toggle" ? (
                          isSwitchingFund && !canOperateOnFund(product) ? (
                            <TooltipWrapper
                              tooltipTitle={""}
                              showIcon={false}
                              tooltipContent={
                                product?.noMarketPriceFound
                                  ? "Non è stato trovato il prezzo di mercato per questo prodotto"
                                  : "Il minimo investibile su questo fondo è superiore al massimo ctv allocabile"
                              }
                            >
                              <CustomCheckbox
                                className="listProductsTd__checkbox"
                                onChange={() => null}
                                disabled
                              />
                            </TooltipWrapper>
                          ) : (
                            <CustomCheckbox
                              className="listProductsTd__checkbox"
                              loading={
                                product?.loadingFatcaInfo ||
                                (loadingMarketPlaces.productId ===
                                  product.productId &&
                                  loadingMarketPlaces.loading)
                              }
                              disabled={
                                product?.lockedAsPartOfPotentialPtf ||
                                product?.isFatcaBlocked ||
                                product?.isChildMultilineaBlocked ||
                                loadingMarketPlaces.loading
                              }
                              onChange={async () => {
                                if (
                                  isSwitchingFund &&
                                  product.marketPrice == null
                                ) {
                                  setLoadingMarketPlaces({
                                    productId: product.productId,
                                    loading: true
                                  });
                                  await fetchDefaultMarketPlaces(
                                    [product.productId],
                                    proposalOperativityType
                                  )
                                    .then((marketPlaces: any[]) => {
                                      const productMarketPlace = marketPlaces.find(
                                        item => item.productId === product.productId
                                      );

                                      if (
                                        !productMarketPlace ||
                                        !productMarketPlace?.pricePresent
                                      ) {
                                        throw new Error();
                                      } else {
                                        setLoadingMarketPlaces({
                                          productId: null,
                                          loading: false
                                        });
                                        product.valueDateDTO =
                                          productMarketPlace?.valueDateDTO;
                                        setProductMarketPlaceForPrimaryMarket(
                                          marketPlaces,
                                          product
                                        );
                                      }
                                    })
                                    .catch(() => {
                                      setLoadingMarketPlaces({
                                        productId: null,
                                        loading: false
                                      });
                                      delete product.switchedIn;
                                      product.noMarketPriceFound = true;
                                    });
                                }
                                props.onToggleProduct?.(index);
                                setTempProductCtv(null);
                                setTempProductQuantity(0);
                                setSwitchInFundExceeded(false);
                              }}
                              checked={
                                !product?.lockedAsPartOfPotentialPtf &&
                                props?.customCheckParam
                                  ? product[props.customCheckParam]
                                  : product.checked || false
                              }
                            />
                          )
                        ) : header === "preferred" ? (
                          <Favorite
                            preferred={
                              preferredList && preferredList.size > 0
                                ? preferredList.has(product.productId)
                                : product.preferred
                            }
                            id={product.productId}
                            className="listProductsTd__preferred"
                            onToggle={handleFavoriteToggle}
                            loading={
                              selectedPreferred == product.productId &&
                              loadingPreferred
                            }
                          />
                        ) : header === "totalCostInPercentage" &&
                          isSwitchingFundPolicy ? (
                          <>
                            {percFormatter(
                              product?.ibipEquivalentProductInfoDTO
                                ?.costsFinancialInstrCommissionPercentage
                            ) || "-"}
                          </>
                        ) : header === "exAnteCommission" ? (
                          <>
                            {percFormatter(
                              product?.ibipEquivalentProductInfoDTO
                                ?.exAnteCommission
                            ) || "-"}
                          </>
                        ) : header === "exAnteCommissionGap" ? (
                          <>
                            {percFormatter(
                              product?.ibipEquivalentProductInfoDTO
                                ?.costsFinancialInstrCommissionPercentageGap
                            ) || "-"}
                          </>
                        ) : header === "productType" ? (
                          <FormattedMessage
                            id={`common.label.productType.${product.productType}`}
                          />
                        ) : header === "currency" ? (
                          <div className="currencyWithIcon">
                            {product?.[header]}
                            {props?.isAddProduct &&
                              product?.bestExecutionStatus ===
                                bestExecutionStatusEnum.BEST_MULTI_CURRENCY && (
                                <img src={Medal} width={24} alt="" />
                              )}
                          </div>
                        ) : header === "productName" ? (
                          <span className="listProductsTd__name">
                            {!props.preventClick && product?.detailInfo ? (
                              <Link
                                to={`${PATH.PRODUCTS}/${product.productId}/detail`}
                                onClick={props.saveFilters}
                              >
                                {product.name?.toLocaleUpperCase()}
                              </Link>
                            ) : (
                              <span className={"not-clickable"}>
                                {product.name?.toLocaleUpperCase()}
                              </span>
                            )}
                            {product?._semanticHighlight && (
                              <span
                                className="listProductsTd__semanticBadge"
                                title={getSemanticHighlightTitle(product)}
                              >
                                {product._semanticHighlight.label}
                              </span>
                            )}
                          </span>
                        ) : isAddIBIPS && header === "nameIbips" ? (
                          <span className="listProductsTd__name">
                            <span className={"not-clickable"}>
                              {product?.product?.toLocaleUpperCase()}
                            </span>
                          </span>
                        ) : isAddIBIPS && header === "codProdExt" ? (
                          <span>{product?.codProdExt}</span>
                        ) : isAddIBIPS && header === "company" ? (
                          <span>{product?.company}</span>
                        ) : isAddIBIPS && header === "fictitiousIsinList" ? (
                          <span className="listProductsTd__tooltip-ibips">
                            <TooltipWrapper
                              tooltipContent={product?.fictitiousIsinList}
                              showIcon={true}
                              placement="right"
                              trigger={["hover", "focus"]}
                            />
                          </span>
                        ) : header === "quantity" ? (
                          <InputWithIncrement
                            placeholder="0"
                            value={
                              !product.switchedIn
                                ? 0
                                : !inputQntFocused ||
                                  Number(props.tempProductQuantity)
                                ? Number(props.tempProductQuantity)
                                : null
                            }
                            className="investmentProjectListTd__input"
                            isCurrency
                            onFocus={() => {
                              setInputQntfocused(true);
                            }}
                            onBlur={() => {
                              setInputQntfocused(false);
                            }}
                            disabled={
                              !product.switchedIn || product?.noMarketPriceFound
                            }
                            onValueChange={(value: any) =>
                              quantityValueHandler(value, product)
                            }
                            onAdd={() =>
                              onIncrementSwitchFundValue(product, product.marketPrice)
                            }
                            onSubtract={() =>
                              onDecrementSwitchFundValue(product, product.marketPrice)
                            }
                          />
                        ) : header === "ctv" ? (
                          <InputWithIncrement
                            placeholder="0"
                            value={
                              !product.switchedIn
                                ? 0
                                : !inputCtvFocused ||
                                  Number(props.tempProductCtv)
                                ? Number(props.tempProductCtv)
                                : null
                            }
                            className="investmentProjectListTd__input"
                            isCurrency
                            onFocus={() => {
                              setInputCtvfocused(true);
                            }}
                            onBlur={() => {
                              setInputCtvfocused(false);
                            }}
                            disabled={
                              !product.switchedIn || product?.noMarketPriceFound
                            }
                            onValueChange={(values: any) => {
                              let tempCtv = values.floatValue;
                              if (Number.isNaN(tempCtv)) {
                                tempCtv = 0;
                              }
                              setTempProductCtv(tempCtv);
                              updateProductQuantity(product, tempCtv);
                              checkCtvValidity(tempCtv, product);
                            }}
                            onAdd={() => onIncrementSwitchFundValue(product)}
                            onSubtract={() =>
                              onDecrementSwitchFundValue(product)
                            }
                          />
                        ) : header === "bestInClass" ? (
                          <BestInClass bic={product.bicType} />
                        ) : header === "coupon" ||
                          header === "esg" ||
                          header === "isPlaced" ||
                          header === "ecoSustainable" ||
                          header === "sustainable" ||
                          header === "pai" ? (
                          header in product ? (product?.[header] ? "Sì" : "No") : "No"
                        ) : header === "riskKiid" ? (
                          product.riskKiid
                        ) : header === "isin" &&
                          isProductFiscalityUS(product[header]) ? (
                          <TooltipWrapper
                            tooltipContent={getFiscalityLabelUS(product[header])}
                            showIcon={false}
                            placement="right"
                            popoverClassName="listProductsTd__tooltip-us"
                            trigger={["hover", "click"]}
                          >
                            {product?.[header]}
                          </TooltipWrapper>
                        ) : header === "isin" &&
                          product?.lockedAsPartOfPotentialPtf ? (
                          <OverlayTrigger
                            trigger={["hover", "focus"]}
                            delay={100}
                            placement={
                              product.lockedAsPartOfPotentialPtf ? "top" : "right"
                            }
                            overlay={pledgePopover(product)}
                          >
                            <span>
                              <span
                                className="icon-lock-close"
                                style={{
                                  marginRight: 5,
                                  fontWeight: "bold",
                                  color: "#22608f"
                                }}
                              />
                              {product?.[header]}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          product?.[header]
                        )}
                      </td>
                    ))}
                  </TrTableRow>
                ))}
            </tbody>
          </>
        </SimpleTable>
        {props.products && props.products.length === 0 && (
          <div className="noProductContainer mt-3">
            <FormattedMessage id="products.list.empty" />
          </div>
        )}
      </div>

      {!props.lastPage ? (
        props.loadingMore ? (
          <div className={"position-relative mt-5"} style={{ marginBottom: "120px" }}>
            <Loader.WidgetWrapper>
              <Loader.Spinner />
            </Loader.WidgetWrapper>
          </div>
        ) : !_.isEmpty(props.products) ? (
          <div
            className={`simpleTable__getMore ${spacedGetMore ? "spaced" : ""}`}
            onClick={props.fetchMore}
          >
            <FormattedMessage
              id="simpleTable.getMore"
              values={{ listSize: nextPageElements }}
            />
            <span className="icon-disinvesti"></span>
          </div>
        ) : (
          <div style={{ marginBottom: "80px" }}></div>
        )
      ) : (
        <div style={{ marginBottom: "80px" }}></div>
      )}
    </>
  );
};

export default ListProducts;
