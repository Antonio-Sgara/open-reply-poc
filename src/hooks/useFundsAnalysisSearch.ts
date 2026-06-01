/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { AdvancedSearchPanelFilterProps } from "components/AdvancedSearchPanel/AdvancedSearchPanel";
import { FilterDTOParsingOptions } from "components/widget/WidgetProductList/WidgetProductList";
import {
  FundsAnalysisSearchForProductDTO,
  fundsCategoriesAnalysisModel,
  fundsCategoriesAnalysisModelOptions,
  IFiltersDTO,
  updateValuesForAssetLevels
} from "model/product";
import { MWRRPerformanceType } from "pages/products/product-details";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFiltersAction } from "store/product/product.actions";
import {
  fetchFundsAnalysisProducts,
  getAdvancedFundsAnalysisFilter
} from "store/product/product.service";
import { getAdvancedSearchInitialState } from "tools/product";

export const DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE = 40;
export const MISSING_REQUIRED_ASSET_CLASS_FILTERS_ERROR = "PRD_016";

interface IHandleResetFundsAnalysisFiltersOptions {
  reloadOptions?: boolean;
}

interface IUseFundsAnalysisSearch {
  fetchAdvancedSearchItemsFundsAnalysis: (filters?: any) => void;
  fundAnalysisFilters: any;
  isLoadingFundsAnalysisSearchOptions: boolean;
  fundsAnalysisFilterModel: any;
  setFundsAnalysisFilterModel: (a: any) => void;
  setActiveFiltersForFundsAnalysis: (a: any) => void;
  handleFundsAnalysisFilter: (filterId: any, value: any) => void;
  activeFiltersForFundsAnalysis: any;
  toggleFundsAnalysisProductsFiltersChanged: (a: boolean) => void;
  handleResetFundsAnalysisFilter: (
    options?: IHandleResetFundsAnalysisFiltersOptions
  ) => void;
  fundsAnalysisProductsFiltersChanged: boolean;
  handleApplyFundsAnalysisFilter: () => void;
  fundsAnalysisProducts: any;
  lastPageFundsAnalysisProducts: boolean;
  setLastPageFundsAnalysisProducts: (a: boolean) => void;
  loadingMoreFundsAnalysisProducts: boolean;
  filterPreferredFundsAnalysis: (preferred: boolean) => void;
  showFavoritesFundsAnalysis: boolean;
  saveFiltersFundsAnalysis: () => void;
  currentSortStepFundsAnalysis: any;
  activeSortFundsAnalysis: any;
  sortProductsFundsAnalysis: (key: any, sort: any) => void;
  fetchMoreFundsAnalysisProducts: () => void;
  fetchFundsAnalysisProductsWithinDateRange: (
    params: any,
    filtersDTO: any,
    inputSearch: string
  ) => void;
  numberOfElementsFundsAnalysisProducts: number;
  totalElementsFundsAnalysisProducts: number;
  totalPagesFundsAnalysisProducts: number;
  currentPageFundsAnalysisProducts: number;
  setNumberOfElementsFundsAnalysisProducts: (a: number) => void;
  setTotalElementsFundsAnalysisProducts: (a: number) => void;
  setTotalPagesFundsAnalysisProducts: (a: number) => void;
  setCurrentPageFundsAnalysisProducts: (a: number) => void;
  fundsAnalysisParsedFilterRequestDTO: (
    options?: FilterDTOParsingOptions
  ) => any;
  fetchFundsAnalysisData: (
    params: any,
    reset: boolean,
    callback: any,
    filtersDTO: any
  ) => void;
  setFundAnalysisFilters: (filters: any) => void;
  setFundsAnalysisProducts: (products: any) => void;
  setActiveSortFundsAnalysis: (a: any) => void;
  setCurrentSortStepFundsAnalysis: (a: any) => void;
  setIsLoadingFundsAnalysisSearchOptions: (a: boolean) => void;
  handleSubmitFundsAnalysis: (e: any) => void;
  canPerformSearch: () => boolean;
  setActiveParams: (a: any) => void;
  setSort: (a: any) => void;
  setShowFavoritesFundsAnalysis: (a: boolean) => void;
  isTableFiltered?: boolean;
}

const useFundsAnalysisSearch = (
  getParams: (page: number, sort?: any, preferred?: boolean, size?: number) => any,
  setLoading: (a: boolean) => void,
  setShowFundsAnalysisFilterNotSetInfo: (a: boolean) => void,
  datePikerLabel: string,
  inputSearch = ""
): IUseFundsAnalysisSearch => {
  const [
    isLoadingFundsAnalysisSearchOptions,
    setIsLoadingFundsAnalysisSearchOptions
  ] = useState(false);
  const [isTableFiltered, setIsTableFiltered] = useState(false);
  const [errorFundsAnalysisSearch, setErrorFundsAnalysisSearch] = useState(false);
  const [fundAnalysisFilters, setFundAnalysisFilters] = useState<any>({});
  const [prodFundAnalysisFilters, setProdFundAnalysisFilters] = useState<any>({});
  const [activeParams, setActiveParams] = useState<any>();
  const [fundsAnalysisFilterModel, setFundsAnalysisFilterModel] = useState(
    fundsCategoriesAnalysisModel
  );
  const [
    fundsAnalysisProductsFiltersChanged,
    toggleFundsAnalysisProductsFiltersChanged
  ] = useState(false);
  const [
    activeFiltersForFundsAnalysis,
    setActiveFiltersForFundsAnalysis
  ] = useState(getAdvancedSearchInitialState(fundsCategoriesAnalysisModel));
  const [
    currentPageFundsAnalysisProducts,
    setCurrentPageFundsAnalysisProducts
  ] = useState(0);
  const [showFavoritesFundsAnalysis, setShowFavoritesFundsAnalysis] = useState(
    false
  );
  const [
    loadingMoreFundsAnalysisProducts,
    setLoadingMoreFundsAnalysisProducts
  ] = useState(false);
  const [
    numberOfElementsFundsAnalysisProducts,
    setNumberOfElementsFundsAnalysisProducts
  ] = useState(0);
  const [
    totalElementsFundsAnalysisProducts,
    setTotalElementsFundsAnalysisProducts
  ] = useState(0);
  const [
    totalPagesFundsAnalysisProducts,
    setTotalPagesFundsAnalysisProducts
  ] = useState(0);
  const [fundsAnalysisProducts, setFundsAnalysisProducts] = useState<any[]>([]);
  const [
    lastPageFundsAnalysisProducts,
    setLastPageFundsAnalysisProducts
  ] = useState(true);
  const [sorted, setSort] = useState<any>(null);
  const [activeSortFundsAnalysis, setActiveSortFundsAnalysis] = useState<any>(null);
  const [
    currentSortStepFundsAnalysis,
    setCurrentSortStepFundsAnalysis
  ] = useState<any>(null);

  const savedFilters = useSelector((state: any) => state.product.filters);
  const dispatch = useDispatch();

  const handleRequestFailure = (data: any) => {
    if (data?.code === MISSING_REQUIRED_ASSET_CLASS_FILTERS_ERROR) {
      setShowFundsAnalysisFilterNotSetInfo(true);
    }
  };

  useEffect(() => {
    let filter: FundsAnalysisSearchForProductDTO | {} = {};
    filter = { ...prodFundAnalysisFilters };
    setFundsAnalysisFilterModel(
      fundsCategoriesAnalysisModelOptions(filter, activeFiltersForFundsAnalysis)
    );
    if (fundsAnalysisProducts.length > 0) {
      setIsTableFiltered(true);
    }
  }, [
    prodFundAnalysisFilters,
    activeFiltersForFundsAnalysis,
    fundsAnalysisProducts,
    isTableFiltered
  ]);

  const fundsAnalysisParsedFilterRequestDTO = (
    options: FilterDTOParsingOptions = { flatten: true, filters: undefined }
  ) => {
    const { flatten, filters } = options;
    let filtersDTO: IFiltersDTO = filters
      ? { ...filters }
      : { ...activeFiltersForFundsAnalysis };

    Object.keys(filtersDTO).map(item => {
      if (filtersDTO[item]?.length > 0) {
        if (flatten) {
          if (
            item === "coupon" ||
            item === "changeRisk" ||
            item === "isPlaced"
          ) {
            filtersDTO[item] = filtersDTO[item][0] === "true";
            return null;
          }
        } else {
          const setObjKey = [];
          for (const key of filtersDTO[item]) {
            setObjKey.push(key);
          }
          filtersDTO[item] = setObjKey;
        }
      } else {
        delete filtersDTO[item];
      }
      return null;
    });

    filtersDTO = updateValuesForAssetLevels(filtersDTO);
    return filtersDTO;
  };

  const fetchAdvancedSearchItemsFundsAnalysis = (currentFilters?: any) => {
    setIsLoadingFundsAnalysisSearchOptions(true);

    const parsedFilters = savedFilters?.isShowingFundsAnalysis
      ? savedFilters?.activeFilters
      : fundsAnalysisParsedFilterRequestDTO({
          flatten: false,
          filters: currentFilters ? currentFilters : fundAnalysisFilters
        });

    dispatch(updateFiltersAction(undefined));

    getAdvancedFundsAnalysisFilter(parsedFilters)
      .then(response => {
        setProdFundAnalysisFilters(response ?? {});
        setIsLoadingFundsAnalysisSearchOptions(false);
      })
      .catch(e => {
        setIsLoadingFundsAnalysisSearchOptions(false);
        setErrorFundsAnalysisSearch(e);
      });
  };

  const reloadOptionsBasedOnFilters = (
    filters?: AdvancedSearchPanelFilterProps,
    filterIdToKeep?: string
  ) => {
    setIsLoadingFundsAnalysisSearchOptions(true);

    const parsedFilters = fundsAnalysisParsedFilterRequestDTO({
      flatten: false,
      filters
    });

    dispatch(updateFiltersAction(undefined));

    getAdvancedFundsAnalysisFilter(parsedFilters)
      .then(response => {
        const advancedProductFilterResponse = { ...(response ?? {}) };
        const previousOptions = filterIdToKeep
          ? prodFundAnalysisFilters?.[filterIdToKeep] ?? []
          : [];
        if (filterIdToKeep && Array.isArray(previousOptions)) {
          const currentOptions = advancedProductFilterResponse[filterIdToKeep] ?? [];
          for (const option of previousOptions) {
            if (currentOptions.indexOf(option) === -1) {
              currentOptions.push(option);
            }
          }
          advancedProductFilterResponse[filterIdToKeep] = currentOptions;
        }
        setProdFundAnalysisFilters(advancedProductFilterResponse);
        setIsLoadingFundsAnalysisSearchOptions(false);
      })
      .catch(e => {
        setIsLoadingFundsAnalysisSearchOptions(false);
        setErrorFundsAnalysisSearch(e);
      });
  };

  const canPerformSearch = useCallback(() => {
    return (
      activeFiltersForFundsAnalysis?.commercialAssetFirstLevel?.length > 0 &&
      activeFiltersForFundsAnalysis?.commercialAssetSecondLevel?.length > 0 &&
      activeFiltersForFundsAnalysis?.commercialAssetThirdLevel?.length > 0
    );
  }, [activeFiltersForFundsAnalysis]);

  const sortProductsFundsAnalysis = useCallback(
    (key: any, sort: any) => {
      if (!canPerformSearch()) {
        setShowFundsAnalysisFilterNotSetInfo(true);
        return;
      }
      const params = {
        ...getParams(
          0,
          sort != "RESET" ? [`${key},${sort.toLowerCase()}`] : null,
          showFavoritesFundsAnalysis,
          DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
        ),
        timeIntervalType:
          MWRRPerformanceType[datePikerLabel as keyof typeof MWRRPerformanceType]
      };

      const newFundsAnalysisFilters = fundsAnalysisParsedFilterRequestDTO({
        flatten: false
      });
      setFundAnalysisFilters(newFundsAnalysisFilters);
      setLoading(true);
      fetchFundsAnalysisProducts(
        { ...params },
        fundsAnalysisParsedFilterRequestDTO()
      )
        .then((newProducts: any) => {
          if (newProducts?.content) {
            setFundsAnalysisProducts(newProducts.content);
            setActiveParams(params);
          }
          if (sort != "RESET") setSort([`${key},${sort.toLowerCase()}`]);
          else setSort(null);
          setActiveSortFundsAnalysis(key);
          setCurrentSortStepFundsAnalysis(sort);
          setCurrentPageFundsAnalysisProducts(0);
          setLastPageFundsAnalysisProducts(!!newProducts?.last);
          setLoading(false);
        })
        .catch(data => {
          handleRequestFailure(data);
          setLoading(false);
        });
    },
    [
      activeFiltersForFundsAnalysis,
      activeSortFundsAnalysis,
      canPerformSearch,
      datePikerLabel,
      fundsAnalysisProducts,
      getParams,
      showFavoritesFundsAnalysis
    ]
  );

  const saveFiltersFundsAnalysis = useCallback(() => {
    dispatch(
      updateFiltersAction({
        isShowingFundsAnalysis: true,
        filters: activeParams,
        activeFilters: activeFiltersForFundsAnalysis,
        products: fundsAnalysisProducts,
        last: lastPageFundsAnalysisProducts,
        activeSort: activeSortFundsAnalysis,
        numberOfElements: numberOfElementsFundsAnalysisProducts,
        totalElements: totalElementsFundsAnalysisProducts,
        sortStep: currentSortStepFundsAnalysis,
        prodFilters: prodFundAnalysisFilters,
        showFavorites: showFavoritesFundsAnalysis
      })
    );
  }, [
    activeFiltersForFundsAnalysis,
    activeParams,
    activeSortFundsAnalysis,
    currentSortStepFundsAnalysis,
    dispatch,
    fundsAnalysisProducts,
    lastPageFundsAnalysisProducts,
    numberOfElementsFundsAnalysisProducts,
    prodFundAnalysisFilters,
    showFavoritesFundsAnalysis,
    totalElementsFundsAnalysisProducts
  ]);

  const handleResetFundsAnalysisFilter = useCallback(
    (
      options: IHandleResetFundsAnalysisFiltersOptions = { reloadOptions: true }
    ) => {
      const resetFilters = getAdvancedSearchInitialState(fundsAnalysisFilterModel);
      setActiveFiltersForFundsAnalysis(resetFilters);
      if (options?.reloadOptions) {
        reloadOptionsBasedOnFilters(resetFilters);
      }
      toggleFundsAnalysisProductsFiltersChanged(true);
    },
    [fundsAnalysisFilterModel]
  );

  const handleFundsAnalysisFilter = useCallback(
    (filterId: string, value: string | string[]) => {
      const newActiveFilters = { ...activeFiltersForFundsAnalysis };
      if (newActiveFilters?.commercialAssetSecondLevel?.length === 0) {
        newActiveFilters.commercialAssetThirdLevel = [];
      }
      newActiveFilters[filterId] = Array.isArray(value)
        ? value
        : value !== null && value !== undefined
        ? [value]
        : [];
      setActiveFiltersForFundsAnalysis(newActiveFilters);
      reloadOptionsBasedOnFilters(newActiveFilters, filterId);
    },
    [activeFiltersForFundsAnalysis, prodFundAnalysisFilters]
  );

  const filterPreferredFundsAnalysis = useCallback(
    (preferred: boolean) => {
      if (!canPerformSearch()) {
        setShowFundsAnalysisFilterNotSetInfo(true);
        return;
      }
      setShowFavoritesFundsAnalysis(preferred);
      let params = {
        ...getParams(0, sorted, preferred, DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE),
        timeIntervalType:
          MWRRPerformanceType[datePikerLabel as keyof typeof MWRRPerformanceType]
      };
      params = { ...params };
      setLoading(true);
      fetchFundsAnalysisProducts(
        { ...params },
        fundsAnalysisParsedFilterRequestDTO()
      )
        .then((newProducts: any) => {
          const content = newProducts?.content;
          if (content) {
            setCurrentPageFundsAnalysisProducts(0);
            setLastPageFundsAnalysisProducts(!!newProducts?.last);
            setFundsAnalysisProducts(content);
            setActiveParams(params);
            setNumberOfElementsFundsAnalysisProducts(
              newProducts?.numberOfElements ?? 0
            );
            setTotalElementsFundsAnalysisProducts(newProducts?.totalElements ?? 0);
            setTotalPagesFundsAnalysisProducts(newProducts?.totalPages ?? 0);
          }
          setLoading(false);
        })
        .catch(data => {
          handleRequestFailure(data);
          setLoading(false);
        });
    },
    [
      activeFiltersForFundsAnalysis,
      canPerformSearch,
      datePikerLabel,
      fundsAnalysisProducts,
      getParams,
      sorted
    ]
  );

  const fetchFundsAnalysisData = useCallback(
    (params: any, reset = false, callBack: any = () => null, filtersDTO = {}) => {
      if (!canPerformSearch()) {
        setShowFundsAnalysisFilterNotSetInfo(true);
        return;
      }
      setIsTableFiltered(true);
      if (params.page > 0) setLoadingMoreFundsAnalysisProducts(true);
      else setLoading(true);

      fetchFundsAnalysisProducts(params, filtersDTO)
        .then((newProducts: any) => {
          let mergeProducts =
            fundsAnalysisProducts && !reset ? fundsAnalysisProducts : [];
          if (newProducts?.content) {
            mergeProducts = mergeProducts.concat(newProducts.content);
            setActiveParams(params);
          }
          setNumberOfElementsFundsAnalysisProducts(
            newProducts?.numberOfElements ?? 0
          );
          setTotalElementsFundsAnalysisProducts(newProducts?.totalElements ?? 0);
          setTotalPagesFundsAnalysisProducts(newProducts?.totalPages ?? 0);
          setFundsAnalysisProducts(mergeProducts);
          setLastPageFundsAnalysisProducts(!!newProducts?.last);
          callBack();

          if (params.page > 0) setLoadingMoreFundsAnalysisProducts(false);
          else setLoading(false);
        })
        .catch(data => {
          handleRequestFailure(data);
          if (params.page > 0) setLoadingMoreFundsAnalysisProducts(false);
          else setLoading(false);
          setErrorFundsAnalysisSearch(false);
        });
    },
    [
      activeFiltersForFundsAnalysis,
      canPerformSearch,
      currentPageFundsAnalysisProducts,
      fundsAnalysisProducts,
      inputSearch
    ]
  );

  const fetchDataWithinDateRange = useCallback(
    (params: any, _reset = false, callBack: any = () => null, filtersDTO = {}) => {
      if (!canPerformSearch()) {
        setShowFundsAnalysisFilterNotSetInfo(true);
        return;
      }

      if (params.page > 0) setLoadingMoreFundsAnalysisProducts(true);
      else setLoading(true);

      fetchFundsAnalysisProducts(params, filtersDTO)
        .then((newProducts: any) => {
          setNumberOfElementsFundsAnalysisProducts(
            newProducts?.numberOfElements ?? 0
          );
          setTotalElementsFundsAnalysisProducts(newProducts?.totalElements ?? 0);
          setTotalPagesFundsAnalysisProducts(newProducts?.totalPages ?? 0);
          setFundsAnalysisProducts(newProducts?.content ?? []);
          setLastPageFundsAnalysisProducts(!!newProducts?.last);
          callBack();

          if (params.page > 0) setLoadingMoreFundsAnalysisProducts(false);
          else setLoading(false);
        })
        .catch(data => {
          handleRequestFailure(data);
          if (params.page > 0) setLoadingMoreFundsAnalysisProducts(false);
          else setLoading(false);
          setErrorFundsAnalysisSearch(false);
        });
    },
    [
      activeFiltersForFundsAnalysis,
      activeSortFundsAnalysis,
      canPerformSearch,
      currentPageFundsAnalysisProducts,
      fundsAnalysisProducts,
      inputSearch,
      sorted
    ]
  );

  const fetchFundsAnalysisProductsWithinDateRange = useCallback(
    (params: any, _filters: any, _inputSearchFromParams: string) => {
      if (!canPerformSearch()) {
        setShowFundsAnalysisFilterNotSetInfo(true);
        return;
      }
      const page = 0;
      setCurrentPageFundsAnalysisProducts(page);
      const filtersDto = fundsAnalysisParsedFilterRequestDTO({
        flatten: true,
        filters: fundAnalysisFilters
      });
      fetchDataWithinDateRange(
        {
          ...getParams(
            page,
            sorted,
            showFavoritesFundsAnalysis,
            DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
          ),
          ...(inputSearch ? { filter: inputSearch } : {}),
          timeIntervalType:
            MWRRPerformanceType[
              params.timeIntervalType as keyof typeof MWRRPerformanceType
            ]
        },
        false,
        null,
        filtersDto
      );
      setCurrentPageFundsAnalysisProducts(page);
    },
    [
      activeFiltersForFundsAnalysis,
      activeSortFundsAnalysis,
      canPerformSearch,
      currentPageFundsAnalysisProducts,
      datePikerLabel,
      fundAnalysisFilters,
      getParams,
      inputSearch,
      showFavoritesFundsAnalysis,
      sorted
    ]
  );

  const fetchMoreFundsAnalysisProducts = useCallback(() => {
    if (!canPerformSearch()) {
      setShowFundsAnalysisFilterNotSetInfo(true);
      return;
    }

    const page = currentPageFundsAnalysisProducts + 1;
    const params = {
      ...getParams(
        page,
        sorted,
        showFavoritesFundsAnalysis,
        DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
      ),
      timeIntervalType:
        MWRRPerformanceType[datePikerLabel as keyof typeof MWRRPerformanceType]
    };

    setFundAnalysisFilters(
      fundsAnalysisParsedFilterRequestDTO({
        flatten: false
      })
    );
    fetchFundsAnalysisData(
      params,
      false,
      null,
      fundsAnalysisParsedFilterRequestDTO()
    );
    setCurrentPageFundsAnalysisProducts(page);
  }, [
    activeFiltersForFundsAnalysis,
    activeSortFundsAnalysis,
    canPerformSearch,
    currentPageFundsAnalysisProducts,
    datePikerLabel,
    fetchFundsAnalysisData,
    fundsAnalysisProducts,
    getParams,
    showFavoritesFundsAnalysis,
    sorted
  ]);

  const handleApplyFundsAnalysisFilter = useCallback(() => {
    if (!canPerformSearch()) {
      setShowFundsAnalysisFilterNotSetInfo(true);
      return;
    }

    setCurrentPageFundsAnalysisProducts(0);
    const params = {
      ...getParams(
        0,
        sorted,
        showFavoritesFundsAnalysis,
        DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
      ),
      timeIntervalType:
        MWRRPerformanceType[datePikerLabel as keyof typeof MWRRPerformanceType]
    };
    const newFundsAnalysisFilters = fundsAnalysisParsedFilterRequestDTO({
      flatten: false
    });
    setFundAnalysisFilters(newFundsAnalysisFilters);
    setActiveFiltersForFundsAnalysis(newFundsAnalysisFilters);
    fetchFundsAnalysisData(
      params,
      true,
      null,
      fundsAnalysisParsedFilterRequestDTO()
    );
  }, [
    activeFiltersForFundsAnalysis,
    activeSortFundsAnalysis,
    canPerformSearch,
    datePikerLabel,
    fetchFundsAnalysisData,
    getParams,
    showFavoritesFundsAnalysis,
    sorted
  ]);

  const handleSubmitFundsAnalysis = (e: any) => {
    e.preventDefault();
    const page = 0;
    setCurrentPageFundsAnalysisProducts(page);
    toggleFundsAnalysisProductsFiltersChanged(false);
    fetchFundsAnalysisData(
      {
        ...getParams(
          page,
          sorted,
          showFavoritesFundsAnalysis,
          DEFAULT_FUNDS_ANALYSIS_SEARCH_SIZE
        ),
        timeIntervalType:
          MWRRPerformanceType[datePikerLabel as keyof typeof MWRRPerformanceType]
      },
      true,
      () => null,
      fundsAnalysisParsedFilterRequestDTO({
        flatten: true,
        filters: activeFiltersForFundsAnalysis
      })
    );
  };

  useEffect(() => {}, [activeParams]);

  return {
    fundAnalysisFilters,
    isLoadingFundsAnalysisSearchOptions,
    fundsAnalysisFilterModel,
    activeFiltersForFundsAnalysis,
    fundsAnalysisProductsFiltersChanged,
    fundsAnalysisProducts,
    lastPageFundsAnalysisProducts,
    loadingMoreFundsAnalysisProducts,
    showFavoritesFundsAnalysis,
    currentSortStepFundsAnalysis,
    activeSortFundsAnalysis,
    numberOfElementsFundsAnalysisProducts,
    totalElementsFundsAnalysisProducts,
    totalPagesFundsAnalysisProducts,
    currentPageFundsAnalysisProducts,
    fundsAnalysisParsedFilterRequestDTO,
    fetchAdvancedSearchItemsFundsAnalysis,
    setFundsAnalysisFilterModel,
    setActiveFiltersForFundsAnalysis,
    handleFundsAnalysisFilter,
    toggleFundsAnalysisProductsFiltersChanged,
    handleResetFundsAnalysisFilter,
    handleApplyFundsAnalysisFilter,
    filterPreferredFundsAnalysis,
    saveFiltersFundsAnalysis,
    sortProductsFundsAnalysis,
    fetchMoreFundsAnalysisProducts,
    fetchFundsAnalysisProductsWithinDateRange,
    fetchFundsAnalysisData,
    setFundAnalysisFilters,
    setNumberOfElementsFundsAnalysisProducts,
    setTotalElementsFundsAnalysisProducts,
    setTotalPagesFundsAnalysisProducts,
    setLastPageFundsAnalysisProducts,
    setCurrentPageFundsAnalysisProducts,
    setFundsAnalysisProducts,
    setActiveSortFundsAnalysis,
    setCurrentSortStepFundsAnalysis,
    setIsLoadingFundsAnalysisSearchOptions,
    handleSubmitFundsAnalysis,
    canPerformSearch,
    setActiveParams,
    setSort,
    setShowFavoritesFundsAnalysis,
    isTableFiltered
  };
};

export default useFundsAnalysisSearch;
