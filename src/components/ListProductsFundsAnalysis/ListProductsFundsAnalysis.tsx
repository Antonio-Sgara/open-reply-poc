import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import BestInClass from "components/BestInClass/BestInClass";
import Sorter from "components/Sorter/Sorter";
import Favorite from "components/Favorite/Favorite";
import { patchProducts } from "store/product/product.service";
import Loader from "../Loader/Loader";
import { euroFormatter, percFormatter } from "components/utils";
import { updateProductsWithErrorsAction } from "store/proposal/proposal.actions";
import { useDispatch } from "react-redux";
import {
  computeNumberOfNextElements,
  unboundVariableFloatingPoint
} from "tools/common";
import { Link } from "react-router-dom";
import { PATH } from "model/common";
import Star from "assets/icon/22/star-fillable.svg";
import { buildRating } from "tools/product";
import TableWithFixedColumns from "components/TableWithFixedColumns/TableWithFixedColumns";
import { DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE } from "hooks/useFundsAnalysisSearch";

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
  datePikerLabel?: string;
  totalElements?: number;
  numberOfElements?: number;
  totalPages?: number;
  currentPage?: number;
  isTableFiltered?: boolean;
}

const ListProductsFundsAnalysis: React.FC<IProps> = ({
  datePikerLabel = "",
  totalElements = 0,
  numberOfElements = 0,
  totalPages = 0,
  currentPage = 0,
  ...props
}) => {
  const [preferredList, setPreferred] = useState(new Set<any>(["preferredList"]));
  const [productWithCtvErrorId, setProductWithCtvErrorId] = useState<number>();
  const [minInvestableValueForError, setMinInvestableValueForError] = useState<
    number
  >(0);
  const dispatch = useDispatch();

  useEffect(() => {
    collectPreferred(props.products ?? []);
  }, [props.products]);

  const handlePreferredFilter = (_e: any, _id: any, preferred: boolean) => {
    props.filterPreferred?.(preferred);
  };

  const collectPreferred = (data: any[]) => {
    const prevPreferred = new Set(preferredList);
    data.forEach(p => {
      if (p.preferred) prevPreferred.add(p.productId);
    });
    setPreferred(prevPreferred);
  };

  const patchData = (params: any, payload: any) => {
    return patchProducts(params, payload)
      .then(status => status)
      .catch(() => null);
  };

  const handleFavoriteToggle = (_e: any, id: string, preferred: boolean) => {
    patchData({ productId: id }, { preferred }).then(status => {
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
    });
  };

  useEffect(() => {
    if (productWithCtvErrorId) {
      dispatch(
        updateProductsWithErrorsAction({
          error: !!productWithCtvErrorId,
          showAlert: !!productWithCtvErrorId,
          message: (
            <FormattedMessage
              id={"proposal.product.newSubscription.minInvestableError"}
              values={{
                minInvestable:
                  minInvestableValueForError < 0.01
                    ? unboundVariableFloatingPoint(minInvestableValueForError)
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
  }, [dispatch, minInvestableValueForError, productWithCtvErrorId]);

  const columns = React.useMemo(() => {
    return [
      {
        Header: () => (
          <div style={{ paddingLeft: "10px" }}>
            <Favorite
              preferred={props.showFavorites}
              className="listProductsTd__preferred"
              onToggle={handlePreferredFilter}
            />
          </div>
        ),
        id: "favorite",
        width: 50,
        headerClassName: "favoriteHeader",
        accessor: (product: any) => (
          <div style={{ paddingLeft: "10px" }}>
            <Favorite
              preferred={
                preferredList && preferredList.size > 0
                  ? preferredList.has(product.productId)
                  : product.preferred
              }
              id={product.productId}
              className="listProductsTd__preferred"
              onToggle={handleFavoriteToggle}
            />
          </div>
        ),
        fixed: "left"
      },
      {
        Header: () => <FormattedMessage id={"common.label.isin"} />,
        id: "isin",
        className: "isin",
        width: !props.products || props.products?.length === 0 ? 70 : 140,
        accessor: (product: any) => product.isin,
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.name"} />}
            onSort={props.onSort}
            sortKey={"name"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "productName",
        width: !props.products || props.products?.length === 0 ? 70 : 210,
        accessor: (product: any) => (
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
          </span>
        ),
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.bestInClass"} />}
            onSort={props.onSort}
            sortKey={"bestInClass"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "bestInClass",
        width: 50,
        accessor: (product: any) => <BestInClass bic={product.bicType} />,
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.ecoSustainable"} />}
            onSort={props.onSort}
            sortKey={"ecoSustainable"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "ecoSustainable",
        width: 100,
        accessor: (product: any) => (
          <div>
            {"ecoSustainable" in product
              ? product?.ecoSustainable
                ? "Si"
                : "No"
              : "--"}
          </div>
        ),
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.sustainable"} />}
            onSort={props.onSort}
            sortKey={"sustainable"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "sustainable",
        width: 100,
        accessor: (product: any) => (
          <div>
            {"sustainable" in product ? (product?.sustainable ? "Si" : "No") : "--"}
          </div>
        ),
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.pai"} />}
            onSort={props.onSort}
            sortKey={"pai"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "pai",
        width: 100,
        accessor: (product: any) => (
          <div>{"pai" in product ? (product?.pai ? "Si" : "No") : "--"}</div>
        ),
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name="RATING BCCR&P"
            onSort={props.onSort}
            sortKey={"finalRating"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "finalRating",
        width: !props.products || props.products?.length === 0 ? 70 : 125,
        headerClassName: "fixedRating lastFixedColumn",
        className: "fixedRating lastFixedColumn",
        accessor: (product: any) => (
          <div style={{ display: "flex", gap: 2 }}>
            {product.finalRating != null
              ? buildRating(product.finalRating).map(
                  (ratingPercentageFillClass: string, index: number) => (
                    <img
                      key={`${product.productId ?? product.isin}-star-${index}`}
                      src={Star}
                      alt={ratingPercentageFillClass}
                      className={`svgStarClass_${ratingPercentageFillClass}`}
                      width={14}
                      height={14}
                    />
                  )
                )
              : "--"}
          </div>
        ),
        fixed: "left"
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`PERF.\nYear To Date`}
            onSort={props.onSort}
            sortKey={"performanceYTD"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "performanceYtd",
        width: 102,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.performanceYTD != null
              ? percFormatter(product.performanceYTD)
              : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`PERF. 1 MESE`}
            onSort={props.onSort}
            sortKey={"performance1M"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "performance1Month",
        width: 98,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.performance1M != null
              ? percFormatter(product.performance1M)
              : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`PERF. 3 MESI`}
            onSort={props.onSort}
            sortKey={"performance3M"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "performance3Months",
        width: 94,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.performance3M != null
              ? percFormatter(product.performance3M)
              : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`PERF. 6 MESI`}
            onSort={props.onSort}
            sortKey={"performance6M"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "performance6Months",
        width: 94,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.performance6M != null
              ? percFormatter(product.performance6M)
              : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`PERFORMANCE ${datePikerLabel}`}
            onSort={props.onSort}
            sortKey={"performance"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "performance",
        width: 108,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.performance != null ? percFormatter(product.performance) : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`${"volatilità".toUpperCase()} ${datePikerLabel}`}
            onSort={props.onSort}
            sortKey={"volatility"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "volatility",
        width: 86,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.volatility != null ? percFormatter(product.volatility) : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`SHARPE RATIO\n${datePikerLabel}`}
            onSort={props.onSort}
            sortKey={"sharpeRatio"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "sharpeRatio",
        width: 105,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.sharpeRatio != null ? product.sharpeRatio : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={`MAX DRAWDOWN ${datePikerLabel}`}
            onSort={props.onSort}
            sortKey={"maxDrawdown"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "maxDrawdown",
        className: "maxDD",
        headerClassName: "maxDD",
        width: 130,
        accessor: (product: any) => (
          <div style={{ textAlign: "right" }}>
            {product.maxDrawdown != null ? percFormatter(product.maxDrawdown) : "--"}
          </div>
        )
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.currency"} />}
            onSort={props.onSort}
            sortKey={"currency"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "currency",
        width: 65,
        accessor: (product: any) => <div>{product.currency}</div>
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={<FormattedMessage id={"common.label.coupon"} />}
            onSort={props.onSort}
            sortKey={"coupon"}
            current={props.activeSort}
            sortStep={props.sortStep}
          />
        ),
        id: "coupon",
        width: !props.products || props.products?.length === 0 ? 60 : 80,
        accessor: (product: any) => <div>{product.coupon ? "Si" : "No"}</div>
      },
      {
        Header: () => <FormattedMessage id={"common.label.changeRisk"} />,
        id: "changeRisk",
        width: 85,
        accessor: (product: any) => <div>{product.changeRisk ? "Si" : "No"}</div>
      },
      {
        Header: () => (
          <Sorter
            perColumn
            name={
              <FormattedMessage id={"common.label.performanceLastUpdateDate"} />
            }
            onSort={props.onSort}
            sortKey={"lastUpdate"}
            current={props.activeSort}
            sortStep={props.sortStep}
            className={"fundAnalysis__sorter"}
          />
        ),
        id: "info",
        width: 110,
        accessor: (product: any) => (
          <div>
            {product.performanceLastUpdateDate
              ? product.performanceLastUpdateDate
              : "--"}
          </div>
        )
      },
      {
        Header: () => <FormattedMessage id={"common.label.isPlaced"} />,
        id: "isPlaced",
        width: 135,
        accessor: (product: any) => (
          <div>
            {"isPlaced" in product ? (product?.isPlaced ? "Si" : "No") : "--"}
          </div>
        )
      }
    ];
  }, [
    datePikerLabel,
    preferredList,
    props.activeSort,
    props.onSort,
    props.products,
    props.saveFilters,
    props.showFavorites,
    props.sortStep
  ]);

  const memoizedTable = React.useMemo(() => {
    return (
      <TableWithFixedColumns
        data={props.products}
        columns={columns}
        className={"FundAnalysis__table"}
      />
    );
  }, [columns, props.products]);

  const [nextPageElements, setNextPageElements] = useState(
    DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
  );

  useEffect(() => {
    computeNumberOfNextElements({
      defaultSearchSize: DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE,
      totalElements,
      numberOfElements,
      totalPages,
      currentPage,
      setNextPageElements
    });
  }, [currentPage, numberOfElements, totalElements, totalPages]);

  return (
    <div
      className={`${props.className ? props.className : ""} with-thick-rows ${
        !props.products || props.products?.length === 0 ? "empty-table" : ""
      }`}
    >
      {props.isTableFiltered ? (
        memoizedTable
      ) : (
        <div className="noProductContainer">
          <FormattedMessage id="products.list.empty.filters" />
        </div>
      )}
      {!props.lastPage &&
        (props.loadingMore ? (
          <div className={"position-relative mt-5"}>
            <Loader.WidgetWrapper>
              <Loader.Spinner />
            </Loader.WidgetWrapper>
          </div>
        ) : (
          <div className="simpleTable__getMore" onClick={props.fetchMore}>
            <FormattedMessage
              id={"simpleTable.getMore"}
              values={{
                listSize: nextPageElements
              }}
            />
            <span className="icon-disinvesti"></span>
          </div>
        ))}
    </div>
  );
};

export default ListProductsFundsAnalysis;
