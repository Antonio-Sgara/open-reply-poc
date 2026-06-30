/* eslint-disable eqeqeq */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useState, useCallback, useEffect, useMemo } from "react";
import SearchBar from "components/SearchBar";
import ListProducts from "components/ListProducts/ListProducts";
import Loader from "components/Loader/Loader";
import Title from "components/Title/Title";
import { FormattedMessage, useIntl } from "react-intl";
import {
  fetchProducts,
  getAdvancedProductFilter,
  getProductCompanyNames
} from "store/product/product.service";
import { AdvancedSearchPanelFilterProps } from "components/AdvancedSearchPanel/AdvancedSearchPanel";
import {
  AdvancedFilterForProductDTO,
  advancedProductSearchModel,
  advancedProductSearchModelOptions,
  CatalogueProductListHeaders,
  IFiltersDTO,
  updateValuesForAssetLevels
} from "model/product";
import { getAdvancedSearchInitialState } from "tools/product";
import { updateFiltersAction } from "../../../store/product/product.actions";
import { useDispatch, useSelector } from "react-redux";
import { productTypes } from "../../../model/proposal";
import useFundsAnalysisSearch from "hooks/useFundsAnalysisSearch";
import moment from "moment";
import { Col, Row } from "react-bootstrap";
import ListProductsFundsAnalysis from "components/ListProductsFundsAnalysis/ListProductsFundsAnalysis";
import IconWithPopover from "components/IconWithPopover/IconWithPopover";
import { ReactiveDateRangePicker } from "components/ReactiveDateRangePicker/ReactiveDateRangePicker";
import InfoAlert from "components/InfoAlert";
import { useSemanticProductSearch } from "../../../semantic-search/useSemanticProductSearch";
import { semanticDebugGroup, semanticDebugLog } from "../../../semantic-search/debug";
import {
  EMBEDDING_MODEL_ID,
  EMBEDDING_MODEL_VERSION
} from "../../../semantic-search/embeddingService";
import "./WidgetProductList.scss";

const POC_API_HEALTH_URL = "http://127.0.0.1:3001/health";
const POC_API_PRODUCT_EMBEDDINGS_URL =
  "http://127.0.0.1:3001/api/product-embeddings";

interface IProps {
  className?: string;
  selectedView?: string;
}

const TOP_MATCH_LABELS = ["Miglior match", "Molto coerente", "Buona corrispondenza"];

const getSemanticScoreValue = (result: any) =>
  result.finalScore ?? result.score ?? 0;

const formatSemanticScore = (score: number) => score.toFixed(3);

const getSemanticScoreBarWidth = (score: number, topScore: number) => {
  if (!topScore || topScore <= 0) return 0;
  return Math.max(8, Math.min(100, Math.round((score / topScore) * 100)));
};

const getReadableSemanticReasons = (rules: string[] = []) => {
  const reasons = rules
    .map(rule => {
      if (rule.includes("riskKiid basso")) return "rischio basso";
      if (rule.includes("riskKiid alto")) return "rischio alto";
      if (rule.includes("riskKiid exact")) return "rischio richiesto";
      if (rule.includes("riskKiid near")) return "rischio vicino";
      if (rule.includes("sustainable true")) return "sostenibile";
      if (rule.includes("ecoSustainable true")) return "eco-sostenibile";
      if (rule.includes("pai true")) return "PAI";
      if (rule.includes("coupon true")) return "con cedola";
      if (rule.includes("currency EUR")) return "valuta EUR";
      if (rule.includes("automotive brand")) return "tema automotive";
      if (rule.includes("pharma brand")) return "tema farmaceutico";
      if (rule.includes("isPlaced true")) return "collocato";
      return undefined;
    })
    .filter(Boolean);

  return [...new Set(reasons)].slice(0, 3);
};

const cleanAdvancedFilterPayload = (payload: IFiltersDTO) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.some(
          item => item !== "" && item !== undefined && item !== null
        );
      }

      return value !== "" && value !== undefined && value !== null;
    })
  );
};

export interface FilterDTOParsingOptions {
  isSorting?: boolean;
  forceApply?: boolean;
  flatten?: boolean;
  filters?: AdvancedSearchPanelFilterProps;
}

const WidgetProductsList: FC<IProps> = ({
  className,
  selectedView = "products"
}) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any>(null);
  const [numberOfElements, setNumberOfElements] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [inputSearch, setInputSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [lastPage, setLastPage] = useState(true);
  const [activeSort, setActiveSort] = useState<any>(null);
  const [currentSortStep, setCurrentSortStep] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sorted, setSort] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState(
    getAdvancedSearchInitialState(advancedProductSearchModel())
  );
  const [prodFilter, setProdFilter] = useState<any>(null);
  const [companyName, setCompanyName] = useState<any>(null);
  const productListHeaderRef = React.useRef<any>(undefined);
  const [filters, setFilters] = useState<any>(undefined);
  const [advancedFilterModel, setAdvancedFilterModel] = useState(
    advancedProductSearchModel()
  );
  const savedFilters = useSelector((state: any) => state.product.filters);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isAdvancedSearchPerformed, setIsAdvancedSearchPerformed] = useState(
    false
  );
  const [errorAdvancedSearch, setErrorAdvancedSearch] = useState(false);
  const [pastMonthLastDay, setPastMonthLastDay] = useState("");
  const [pocApiProducts, setPocApiProducts] = useState<any[]>([]);
  const generatedEmbeddingSaveCountRef = React.useRef(0);
  const semanticDatasetProducts = useMemo(
    () => (pocApiProducts.length > 0 ? pocApiProducts : []),
    [pocApiProducts]
  );
  const saveGeneratedEmbedding = useCallback(
    ({ product, semanticText, embedding }) => {
      generatedEmbeddingSaveCountRef.current += 1;
      const generated = generatedEmbeddingSaveCountRef.current;

      if (generated % 25 === 0 || generated === 1) {
        semanticDebugLog("Embedding generato nel FE, salvo su SQLite", {
          generated,
          productId: product.productId,
          isin: product.isin,
          model: EMBEDDING_MODEL_ID,
          modelVersion: EMBEDDING_MODEL_VERSION,
          dimensions: embedding.length
        });
      }

      fetch(POC_API_PRODUCT_EMBEDDINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product: {
            productId: product.productId,
            isin: product.isin
          },
          semanticText,
          embedding
        })
      }).catch(error => {
        semanticDebugLog("Salvataggio embedding su SQLite fallito", {
          productId: product.productId,
          isin: product.isin,
          error: error instanceof Error ? error.message : error
        });
      });
    },
    []
  );
  const {
    semanticQuery,
    setSemanticQuery,
    semanticProducts,
    semanticResults,
    isIndexingSemanticProducts,
    isSemanticSearchActive,
    searchSemantically,
    clearSemanticSearch
  } = useSemanticProductSearch<any>(semanticDatasetProducts, {
    useBackendSearch: false,
    onEmbeddingGenerated: saveGeneratedEmbedding
  });

  const firstSearchProducts = (resetInputSearch = false) => {
    if (savedFilters && savedFilters?.filters) {
      const { sort, page, filter, ...activeFilters } = savedFilters?.filters;
      setInputSearch(filter);
      setFilters(activeFilters);
      setCurrentPage(page);
      setLastPage(savedFilters?.last);
      setNumberOfElements(savedFilters?.numberOfElements);
      setTotalElements(savedFilters?.totalElements);
      setTotalPages(savedFilters?.totalPages);
      setSort(sort);
      setProducts(savedFilters?.products);
      setActiveSort(savedFilters?.activeSort);
      setCurrentSortStep(savedFilters?.sortStep);
      dispatch(updateFiltersAction(undefined));
    } else
      fetchData(
        {
          ...getParams(currentPage, false, null, 10, resetInputSearch),
          types: [productTypes.FUND]
        },
        true,
        null,
        !isAdvancedSearchPerformed
          ? { productype: [productTypes.FUND] }
          : parsedFilterRequestDTO()
      );
    setIsLoadingOptions(true);
  };

  useEffect(() => {
    let isMounted = true;

    fetch(POC_API_HEALTH_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`POC API health failed: ${response.status}`);
        }

        return response.json();
      })
      .then(async data => {
        if (!isMounted) return;
        const apiProducts = Array.isArray(data?.products) ? data.products : [];
        semanticDebugLog("Prodotti caricati dal server POC", {
          count: apiProducts.length,
          status: data?.status,
          baseCount: data?.baseCount,
          extraCount: data?.extraCount,
          storedCount: data?.storedCount,
          embeddingStats: data?.embeddingStats
        });

        try {
          const embeddingResponse = await fetch(POC_API_PRODUCT_EMBEDDINGS_URL);
          if (!embeddingResponse.ok) {
            throw new Error(
              `POC API embeddings failed: ${embeddingResponse.status}`
            );
          }

          const embeddingData = await embeddingResponse.json();
          const embeddingsByIsin = new Map<string, any>(
            (embeddingData?.embeddings ?? []).map((embedding: any) => [
              embedding.isin,
              embedding
            ])
          );
          const productsWithCachedEmbeddings = apiProducts.map(product => ({
            ...product,
            ...(embeddingsByIsin.get(product.isin) ?? {})
          }));

          setPocApiProducts(productsWithCachedEmbeddings);
          semanticDebugGroup("Embedding prodotti letti da SQLite per FE", () => {
            console.log("Prodotti totali:", apiProducts.length);
            console.log("Embedding in cache SQLite:", embeddingData?.cached ?? 0);
            console.log(
              "Embedding mancanti da generare nel FE:",
              apiProducts.length - (embeddingData?.cached ?? 0)
            );
            console.table(
              productsWithCachedEmbeddings.slice(0, 20).map(product => ({
                productId: product.productId,
                isin: product.isin,
                name: product.name ?? product.productName,
                hasCachedEmbedding: Array.isArray(product.semanticEmbedding),
                embeddingDimensions: product.semanticEmbedding?.length,
                model: product.semanticEmbeddingModel,
                modelVersion: product.semanticEmbeddingModelVersion
              }))
            );
          });
        } catch (error) {
          setPocApiProducts(apiProducts);
          semanticDebugLog(
            "Embedding SQLite non disponibili: il FE li generera' con Transformers.js",
            {
              url: POC_API_PRODUCT_EMBEDDINGS_URL,
              error: error instanceof Error ? error.message : error,
              products: apiProducts.length
            }
          );
        }
      })
      .catch(error => {
        semanticDebugLog("Server POC non disponibile", {
          url: POC_API_HEALTH_URL,
          error: error instanceof Error ? error.message : error,
          localFallbackDisabled: true
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      setPastMonthLastDay(
        moment().subtract(1, "months").endOf("month").format("DD/MM/YYYY")
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchData = useCallback(
    (params: any, reset = false, callBack: any = () => null, filtersDTO = {}) => {
      if (params.page > 0) setLoadingMore(true);
      else setLoading(true);
      const fetchParams = filtersDTO ? params : { ...params };

      fetchProducts(fetchParams, filtersDTO)
        .then((newProducts: any) => {
          let mergeProducts = products && !reset ? products : [];
          if (newProducts.content) {
            mergeProducts = mergeProducts.concat(newProducts.content);
            setFilters(params);
          }
          setNumberOfElements(newProducts.numberOfElements ?? 0);
          setTotalElements(newProducts.totalElements ?? 0);
          setTotalPages(newProducts.totalPages ?? 0);
          setProducts(mergeProducts);
          setLastPage(!!newProducts.last);
          callBack();

          if (params.page > 0) setLoadingMore(false);
          else setLoading(false);
        })
        .catch(() => {
          if (params.page > 0) setLoadingMore(false);
          else setLoading(false);
          setError(false);
        });
    },
    [products, inputSearch, currentPage]
  );

  const fetchMore = useCallback(() => {
    const page = currentPage + 1;
    const filtersDTO = isAdvancedSearchPerformed
      ? parsedFilterRequestDTO()
      : { productype: [productTypes.FUND] };
    fetchData(
      getParams(page, sorted, showFavorites),
      false,
      null,
      filtersDTO
    );
    setCurrentPage(page);
  }, [
    currentPage,
    products,
    sorted,
    activeSort,
    showFavorites,
    isAdvancedSearchPerformed,
    activeFilters
  ]);

  const fetchAdvancedSearchItems = () => {
    setIsLoadingOptions(true);

    const parsedFilters = cleanAdvancedFilterPayload(
      parsedFilterRequestDTO({ flatten: false, filters })
    );
    semanticDebugLog("Caricamento opzioni ricerca avanzata", {
      parsedFilters
    });
    const advancedProductFilterPromise = getAdvancedProductFilter(parsedFilters);
    const productCompanyNamesPromise = getProductCompanyNames(parsedFilters);

    Promise.all([advancedProductFilterPromise, productCompanyNamesPromise])
      .then(responses => {
        semanticDebugGroup("Opzioni ricerca avanzata ricevute", () => {
          console.log("advanced-product-filter", responses[0]);
          console.log("product-company-names", responses[1]);
        });
        setProdFilter(responses[0]);
        setCompanyName(responses[1]);
        setIsLoadingOptions(false);
      })
      .catch(e => {
        setIsLoadingOptions(false);
        setErrorAdvancedSearch(e);
      });
  };

  const filterPreferred = useCallback(
    (preferred: boolean) => {
      setShowFavorites(preferred);
      let params = getParams(0, sorted, preferred);
      if (!isAdvancedSearchPerformed) {
        params = { ...params };
      }
      setLoading(true);
      fetchProducts(
        {
          ...params
        },
        isAdvancedSearchPerformed ? parsedFilterRequestDTO() : {}
      )
        .then((newProducts: any) => {
          const content = newProducts.content;
          if (content) {
            setCurrentPage(0);
            setLastPage(newProducts.last);
            setProducts(content);
            setFilters(params);
            setNumberOfElements(newProducts.numberOfElements);
            setTotalElements(newProducts.totalElements);
            setTotalPages(newProducts.totalPages);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [products, sorted]
  );

  const [isShowingSecondary, setIsShowingSecondary] = useState(false);

  const fetchFundsAnalysisProductsPrevState = useCallback(() => {
    if (savedFilters && savedFilters?.isShowingFundsAnalysis) {
      if (savedFilters?.filters) {
        const { sort, page, filter } = savedFilters?.filters;
        setSortFundsAnalysis(sort);
        setSort(sort);
        setInputSearch(filter);
        setCurrentPageFundsAnalysisProducts(page);
        setActiveParamsFundsAnalysis(savedFilters?.filters);
      }
      setShowFavoritesFundsAnalysis(savedFilters?.showFavorites);
      setActiveFiltersForFundsAnalysis(savedFilters?.activeFilters);
      setFundAnalysisFilters(savedFilters?.activeFilters);
      setLastPageFundsAnalysisProducts(savedFilters?.last);
      setNumberOfElementsFundsAnalysisProducts(savedFilters?.numberOfElements);
      setTotalElementsFundsAnalysisProducts(savedFilters?.totalElements);
      setFundsAnalysisProducts(savedFilters?.products);
      setProducts(savedFilters?.products);
      setActiveSortFundsAnalysis(savedFilters?.activeSort);
      setCurrentSortStepFundsAnalysis(savedFilters?.sortStep);
    }
  }, [savedFilters]);

  useEffect(() => {
    setCurrentPage(0);
    setInputSearch("");

    if (
      selectedView === "fundsAnalysis" ||
      savedFilters?.isShowingFundsAnalysis
    ) {
      const resetFilters = getAdvancedSearchInitialState(
        advancedProductSearchModel()
      );
      setActiveFilters(resetFilters);
      fetchFundsAnalysisProductsPrevState();
    } else {
      setIsLoadingFundsAnalysisSearchOptions(false);
      handleResetFundsAnalysisFilter({ reloadOptions: false });
      setFundsAnalysisProducts([]);
      setActiveSortFundsAnalysis(null);
      setCurrentSortStepFundsAnalysis(null);
      setSortFundsAnalysis(null);
      firstSearchProducts(true);
      setLastPageFundsAnalysisProducts(true);
      setDatePikerLabel("1 anno");
    }
  }, [selectedView]);

  const handleSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      const page = 0;
      setCurrentPage(page);
      setIsAdvancedSearchPerformed(true);
      toggleFundsAnalysisProductsFiltersChanged(false);
      fetchData(
        {
          ...getParams(page, sorted, showFavorites)
        },
        true,
        null,
        { types: [productTypes.FUND] }
      );
    },
    [products, inputSearch, isShowingSecondary, sorted, showFavorites]
  );

  useEffect(() => {
    let filter: AdvancedFilterForProductDTO | {} = {};
    filter = { ...prodFilter, managementCompany: companyName };
    (filter as any)["isPlaced"] = [true, false];
    setAdvancedFilterModel(
      advancedProductSearchModelOptions(filter, activeFilters)
    );
  }, [prodFilter, companyName]);

  const handleAdvancedFilter = useCallback(
    (filterId: string, value: string | string[]) => {
      const newActiveFilters = { ...activeFilters } as any;
      newActiveFilters[filterId] = Array.isArray(value)
        ? value
        : value !== null && value !== undefined
          ? [value]
          : [];
      setActiveFilters(newActiveFilters);
      reloadOptionsBasedOnFilters(newActiveFilters, filterId);
    },
    [activeFilters, prodFilter]
  );

  const parsedFilterRequestDTO = (
    options: FilterDTOParsingOptions = {
      isSorting: false,
      flatten: true,
      filters: undefined
    }
  ) => {
    const { isSorting, flatten, filters } = options;
    let filtersDTO: IFiltersDTO = filters
      ? { ...filters, productType: [productTypes.FUND] }
      : { ...activeFilters, productType: [productTypes.FUND] };

    if (isSorting) {
      delete (filtersDTO as any)["isPlaced"];
    }

    Object.keys(filtersDTO).map(item => {
      if (
        (filtersDTO as any)[item].length > 0 &&
        item !== "filter" &&
        item !== "types"
      ) {
        if (flatten) {
          if (
            item === "coupon" ||
            item === "bestInClass" ||
            item === "esg" ||
            item === "isPlaced" ||
            item === "ecoSustainable" ||
            item === "sustainable" ||
            item === "pai"
          ) {
            (filtersDTO as any)[item] = (filtersDTO as any)[item][0] === "true";
            return;
          }
          if (item === "currency") {
            (filtersDTO as any)[item] = (filtersDTO as any)[item][0];
            return;
          }
          if (item === "riskKiid") {
            (filtersDTO as any)[item] = Number((filtersDTO as any)[item][0]);
            return;
          }
        } else {
          const setObjKey = [];
          for (let key of (filtersDTO as any)[item]) {
            if (item === "riskKiid") key = Number(key);
            setObjKey.push(key);
          }
          (filtersDTO as any)[item] = setObjKey;
          if (!(filtersDTO as any).hasOwnProperty("isPlaced")) {
            (filtersDTO as any)["isPlaced"] = ["true"];
          }
        }
      } else delete (filtersDTO as any)[item];
    });

    filtersDTO = updateValuesForAssetLevels(filtersDTO);
    return filtersDTO;
  };

  const getParams = useCallback(
    (
      page: any,
      sort: any = null,
      preferred = false,
      size = 10,
      resetInputSearch = false
    ) => {
      const defaultParams = {
        page: page,
        size
      };
      return Object.assign(
        {},
        defaultParams,
        sort ? { sort: sort } : {},
        preferred === true ? { preferred: true } : {},
        !resetInputSearch ? (inputSearch ? { filter: inputSearch } : {}) : {},
        filters?.["types"]?.length > 0 ? { types: filters["types"] } : {}
      );
    },
    [inputSearch, filters]
  );

  const ranges = [
    { label: "1 anno", range: [moment().subtract(1, "year"), moment()] },
    { label: "3 anni", range: [moment().subtract(3, "year"), moment()] },
    { label: "5 anni", range: [moment().subtract(5, "year"), moment()] }
  ];

  const [datePikerLabel, setDatePikerLabel] = useState<string>("1 anno");

  const [
    showFundsAnalysisFilterNotSetInfo,
    setShowFundsAnalysisFilterNotSetInfo
  ] = useState(false);

  const {
    isLoadingFundsAnalysisSearchOptions,
    fundsAnalysisFilterModel,
    activeFiltersForFundsAnalysis,
    fundAnalysisFilters,
    fundsAnalysisProductsFiltersChanged,
    fundsAnalysisProducts,
    lastPageFundsAnalysisProducts,
    loadingMoreFundsAnalysisProducts,
    showFavoritesFundsAnalysis,
    activeSortFundsAnalysis,
    currentSortStepFundsAnalysis,
    numberOfElementsFundsAnalysisProducts,
    totalElementsFundsAnalysisProducts,
    totalPagesFundsAnalysisProducts,
    currentPageFundsAnalysisProducts,
    handleFundsAnalysisFilter,
    toggleFundsAnalysisProductsFiltersChanged,
    handleResetFundsAnalysisFilter,
    handleApplyFundsAnalysisFilter,
    filterPreferredFundsAnalysis,
    sortProductsFundsAnalysis,
    fetchMoreFundsAnalysisProducts,
    saveFiltersFundsAnalysis,
    fetchAdvancedSearchItemsFundsAnalysis,
    fetchFundsAnalysisProductsWithinDateRange,
    setFundAnalysisFilters,
    setActiveFiltersForFundsAnalysis,
    setNumberOfElementsFundsAnalysisProducts,
    setTotalElementsFundsAnalysisProducts,
    setLastPageFundsAnalysisProducts,
    setCurrentPageFundsAnalysisProducts,
    setFundsAnalysisProducts,
    setActiveSortFundsAnalysis,
    setCurrentSortStepFundsAnalysis,
    setIsLoadingFundsAnalysisSearchOptions,
    handleSubmitFundsAnalysis,
    canPerformSearch,
    setActiveParams: setActiveParamsFundsAnalysis,
    setSort: setSortFundsAnalysis,
    setShowFavoritesFundsAnalysis,
    isTableFiltered
  } = useFundsAnalysisSearch(
    getParams,
    setLoading,
    setShowFundsAnalysisFilterNotSetInfo,
    datePikerLabel,
    inputSearch
  );

  const reloadOptionsBasedOnFilters = (
    filters?: AdvancedSearchPanelFilterProps,
    filterIdToKeep?: string
  ) => {
    setIsLoadingOptions(true);
    const parsedFilters = cleanAdvancedFilterPayload(
      parsedFilterRequestDTO({ flatten: false, filters })
    );
    semanticDebugLog("Ricaricamento opzioni ricerca avanzata", {
      filterIdToKeep,
      parsedFilters
    });
    const advancedProductFilterPromise = getAdvancedProductFilter(parsedFilters);
    const productCompanyNamesPromise = getProductCompanyNames(parsedFilters);

    Promise.all([advancedProductFilterPromise, productCompanyNamesPromise])
      .then(responses => {
        semanticDebugGroup("Opzioni ricerca avanzata ricaricate", () => {
          console.log("advanced-product-filter", responses[0]);
          console.log("product-company-names", responses[1]);
        });
        const advancedProductFilterResponse: any = responses[0];
        if (filterIdToKeep && prodFilter) {
          for (const option of (prodFilter as any)[filterIdToKeep] ?? []) {
            if (
              advancedProductFilterResponse[filterIdToKeep].indexOf(option) ===
              -1
            ) {
              advancedProductFilterResponse[filterIdToKeep].push(option);
            }
          }
        }
        setProdFilter(advancedProductFilterResponse);
        setCompanyName(responses[1]);
        setIsLoadingOptions(false);
      })
      .catch(() => {
        setIsLoadingOptions(false);
      });
  };

  const handleApplyAdvancedFilter = () => {
    setIsAdvancedSearchPerformed(true);
    setCurrentPage(0);
    fetchData(
      getParams(0, null, showFavorites),
      true,
      null,
      parsedFilterRequestDTO()
    );
  };

  const handleResetAdvancedFilter = useCallback(() => {
    const resetFilters = getAdvancedSearchInitialState(
      advancedProductSearchModel()
    );
    (resetFilters as any).isPlaced = [""];
    setActiveFilters(resetFilters);
    reloadOptionsBasedOnFilters(resetFilters);
  }, [activeFilters]);

  const sortProducts = useCallback(
    (key: string, sort: string) => {
      const params = getParams(
        0,
        sort != "RESET" ? [`${key},${sort.toLowerCase()}`] : null,
        showFavorites
      );
      setLoading(true);
      fetchProducts(
        {
          ...params
        },
        parsedFilterRequestDTO({
          isSorting: true,
          flatten: true,
          filters: undefined
        })
      )
        .then((newProducts: any) => {
          if (newProducts && newProducts.content) {
            setProducts(newProducts.content);
            setFilters(params);
          }
          if (sort != "RESET") setSort([`${key},${sort.toLowerCase()}`]);
          else setSort(null);
          setActiveSort(key);
          setCurrentSortStep(sort);
          setCurrentPage(0);
          setLastPage(newProducts.last);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [products, activeSort]
  );

  const saveFilters = () => {
    dispatch(
      updateFiltersAction({
        isShowingFundsAnalysis: false,
        filters,
        products,
        last: lastPage,
        activeSort,
        numberOfElements,
        totalElements,
        sortStep: currentSortStep,
        showFavorites: showFavorites
      })
    );
  };

  useEffect(() => {
    if (selectedView === "fundsAnalysis") {
      setIsShowingSecondary(true);
    } else {
      setIsShowingSecondary(false);
    }
  }, [selectedView]);

  const Intl = useIntl();

  const memoizedSearchBar = useMemo(() => {
    return (
      <SearchBar
        key="searchbar-products"
        placeholder={Intl.formatMessage({
          id: "products.productList.searchProducts"
        })}
        className=""
        handleSubmit={handleSubmit}
        inputSearch={inputSearch}
        handleInputSearch={setInputSearch}
        activeFilters={activeFilters}
        modelFilters={advancedFilterModel}
        onFilter={handleAdvancedFilter}
        onResetFilters={handleResetAdvancedFilter}
        onApplyFilters={handleApplyAdvancedFilter}
        onToggleFilters={(open: boolean, fundsAnalysisFilters: any) => {
          if (open && !isShowingSecondary) fetchAdvancedSearchItems();
          if (open && isShowingSecondary)
            fetchAdvancedSearchItemsFundsAnalysis(fundsAnalysisFilters);
        }}
        advanced
        isLoadingOptions={
          isShowingSecondary
            ? isLoadingFundsAnalysisSearchOptions
            : isLoadingOptions
        }
        defaultFiltersChanged={
          isShowingSecondary ? fundsAnalysisProductsFiltersChanged : false
        }
        isShowingSecondary={isShowingSecondary}
      />
    );
  }, [
    inputSearch,
    activeFilters,
    advancedFilterModel,
    isShowingSecondary,
    sorted,
    showFavorites
  ]);

  const memoizedSearchBarFundsAnalysis = useMemo(() => {
    return (
      <SearchBar
        key="searchbar-acf"
        placeholder={Intl.formatMessage({
          id: "products.productList.searchProducts"
        })}
        className=""
        handleSubmit={(e: any) => {
          setIsAdvancedSearchPerformed(false);
          handleSubmitFundsAnalysis(e);
        }}
        inputSearch={inputSearch}
        handleInputSearch={setInputSearch}
        activeFilters={activeFiltersForFundsAnalysis}
        modelFilters={fundsAnalysisFilterModel}
        onFilter={(filterId: any, value: any) => {
          handleFundsAnalysisFilter(filterId, value);
          toggleFundsAnalysisProductsFiltersChanged(true);
        }}
        onResetFilters={() =>
          handleResetFundsAnalysisFilter({ reloadOptions: true })
        }
        onApplyFilters={() => {
          setIsAdvancedSearchPerformed(false);
          toggleFundsAnalysisProductsFiltersChanged(false);
          handleApplyFundsAnalysisFilter();
        }}
        onToggleFilters={(open: boolean, fundsAnalysisFilters: any) => {
          if (open) fetchAdvancedSearchItemsFundsAnalysis(fundsAnalysisFilters);
        }}
        advanced
        isLoadingOptions={isLoadingFundsAnalysisSearchOptions}
        defaultFiltersChanged={fundsAnalysisProductsFiltersChanged}
        isShowingSecondary={isShowingSecondary}
        disableApplyButton={!canPerformSearch()}
      />
    );
  }, [
    inputSearch,
    activeFilters,
    advancedFilterModel,
    isShowingSecondary,
    sorted,
    showFavorites
  ]);

  return (
    <div className={`widgetProductsList ${className ?? ""}`}>
      <InfoAlert
        hasAutoHide={true}
        showInfo={showFundsAnalysisFilterNotSetInfo}
        closeInfo={() => setShowFundsAnalysisFilterNotSetInfo(false)}
        typeClassName="WARNING"
      >
        <FormattedMessage id="products.list.empty.filters" />
      </InfoAlert>
      <div className={"widgetProductsList__search"}>
        {isShowingSecondary
          ? memoizedSearchBarFundsAnalysis
          : memoizedSearchBar}
      </div>
      {!isShowingSecondary && (
        <form
          className="widgetProductsList__semanticSearch"
          onSubmit={event => {
            event.preventDefault();
            semanticDebugLog("Submit form ricerca semantica", {
              semanticQuery,
              loadedTableProducts: products?.length ?? 0,
              semanticDatasetProducts: semanticDatasetProducts.length
            });
            searchSemantically();
          }}
        >
          <label
            className="widgetProductsList__semanticSearchLabel"
            htmlFor="semantic-product-search"
          >
            Ricerca semantica
          </label>
          <div className="widgetProductsList__semanticSearchControls">
            <input
              id="semantic-product-search"
              className="widgetProductsList__semanticSearchInput"
              value={semanticQuery}
              onChange={event => setSemanticQuery(event.target.value)}
              placeholder="Es. fondi sostenibili con rischio basso in euro"
              disabled={
                isIndexingSemanticProducts || !semanticDatasetProducts.length
              }
            />
            <button
              className="widgetProductsList__semanticSearchButton"
              type="submit"
              disabled={
                isIndexingSemanticProducts ||
                !semanticDatasetProducts.length ||
                !semanticQuery.trim()
              }
            >
              Cerca
            </button>
            {isSemanticSearchActive && (
              <button
                className="widgetProductsList__semanticSearchButton widgetProductsList__semanticSearchButton--secondary"
                type="button"
                onClick={clearSemanticSearch}
              >
                Reset
              </button>
            )}
          </div>
          <div className="widgetProductsList__semanticSearchStatus">
            {isIndexingSemanticProducts
              ? "Preparazione indice semantico..."
              : isSemanticSearchActive
                ? `${semanticResults.length} risultati semantici su ${semanticDatasetProducts.length} prodotti`
                : `La ricerca interpreta una frase libera su ${semanticDatasetProducts.length} prodotti della POC.`}
          </div>
        </form>
      )}
      {!isShowingSecondary && isSemanticSearchActive && semanticResults.length > 0 && (
        <section
          className="widgetProductsList__topMatches"
          aria-label="Top match ricerca semantica"
        >
          <div className="widgetProductsList__topMatchesHeader">
            <div>
              <div className="widgetProductsList__topMatchesEyebrow">
                Top match
              </div>
              <div className="widgetProductsList__topMatchesTitle">
                Risultati piu' rilevanti
              </div>
            </div>
            <div className="widgetProductsList__topMatchesCount">
              {Math.min(semanticResults.length, 3)} di {semanticResults.length}
            </div>
          </div>
          <div className="widgetProductsList__topMatchesGrid">
            {semanticResults.slice(0, 3).map((result, index) => {
              const topScore = getSemanticScoreValue(semanticResults[0]);
              const score = getSemanticScoreValue(result);
              const scoreWidth = getSemanticScoreBarWidth(score, topScore);
              const product = result.product;
              const reasons = getReadableSemanticReasons(result.matchedRules);

              return (
                <article
                  className={`widgetProductsList__topMatch widgetProductsList__topMatch--${index +
                    1}`}
                  key={`semantic-top-match-${product.productId ?? product.isin}`}
                >
                  <div className="widgetProductsList__topMatchRank">
                    {index + 1}
                  </div>
                  <div className="widgetProductsList__topMatchContent">
                    <div className="widgetProductsList__topMatchLabel">
                      {TOP_MATCH_LABELS[index]}
                    </div>
                    <div className="widgetProductsList__topMatchName">
                      {(product.name ?? product.productName ?? "-").toLocaleUpperCase()}
                    </div>
                    <div className="widgetProductsList__topMatchMeta">
                      <span>{product.isin ?? "-"}</span>
                      <span>{product.currency ?? "-"}</span>
                      <span>
                        SRRI{" "}
                        {typeof product.riskKiid === "number"
                          ? product.riskKiid
                          : "-"}
                      </span>
                    </div>
                    <div className="widgetProductsList__topMatchFooter">
                      <div
                        className="widgetProductsList__topMatchRelevance"
                        aria-label={`Rilevanza ${scoreWidth}%`}
                      >
                        <div className="widgetProductsList__topMatchRelevanceHeader">
                          <span>Rilevanza</span>
                          <span>Score {formatSemanticScore(score)}</span>
                        </div>
                        <div className="widgetProductsList__topMatchRelevanceTrack">
                          <div
                            className="widgetProductsList__topMatchRelevanceFill"
                            style={{ width: `${scoreWidth}%` }}
                          />
                        </div>
                      </div>
                      {reasons.length > 0 && (
                        <span className="widgetProductsList__topMatchReasons">
                          {reasons.join(" · ")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <div className="widgetProductsList__scrollerAnchor">
        <div ref={productListHeaderRef}></div>
      </div>
      <div className={"widgetProductsList__title"}>
        <Row>
          <Col>
            <Title.Widget>
              <FormattedMessage id="products.productList.products" />
              {!isShowingSecondary && products && !isSemanticSearchActive && (
                <span className="simpleTableTitle__numberOfElements">
                  ({totalElements} totali){" "}
                </span>
              )}
              {!isShowingSecondary && isSemanticSearchActive && (
                <span className="simpleTableTitle__numberOfElements">
                  ({semanticResults.length} risultati semantici){" "}
                </span>
              )}
              {isShowingSecondary && fundsAnalysisProducts?.length > 0 && (
                <span className="simpleTableTitle__numberOfElements">
                  ({totalElementsFundsAnalysisProducts} totali){" "}
                </span>
              )}
            </Title.Widget>
          </Col>

          {fundsAnalysisProducts?.length > 0 && isShowingSecondary && (
            <Col style={{ paddingRight: "30px" }}>
              <Row className="justify-content-sm-end">
                <ReactiveDateRangePicker
                  ranges={ranges}
                  chosenLabel={datePikerLabel}
                  setChosenLabel={setDatePikerLabel}
                  onClick={(params: any) => {
                    fetchFundsAnalysisProductsWithinDateRange(
                      params,
                      fundAnalysisFilters,
                      inputSearch
                    );
                    setDatePikerLabel(params.timeIntervalType);
                  }}
                  style={{ marginTop: 0 }}
                  disabled={!canPerformSearch()}
                  key="reactive-date-range-picker-funds-analysis"
                  id="reactive-date-range-picker"
                />
                {pastMonthLastDay && (
                  <IconWithPopover
                    popover={{
                      content: `I dati di Volatilità, Sharpe Ratio e Max Drawdown sono aggiornati al ${pastMonthLastDay}`
                    }}
                  />
                )}
              </Row>
            </Col>
          )}
        </Row>
      </div>
      {loading && (
        <Loader.FixedWrapper>
          <Loader.Spinner />
        </Loader.FixedWrapper>
      )}
      {!loading && (!products || error) ? (
        <FormattedMessage id="products.productList.products.empty" />
      ) : isShowingSecondary && fundsAnalysisProducts ? (
        <ListProductsFundsAnalysis
          products={fundsAnalysisProducts}
          className={"withColFixed"}
          onSort={sortProductsFundsAnalysis}
          activeSort={activeSortFundsAnalysis}
          sortStep={currentSortStepFundsAnalysis}
          lastPage={lastPageFundsAnalysisProducts}
          fetchMore={fetchMoreFundsAnalysisProducts}
          filterPreferred={filterPreferredFundsAnalysis}
          saveFilters={saveFiltersFundsAnalysis}
          loadingMore={loadingMoreFundsAnalysisProducts}
          scalar
          showFavorites={showFavoritesFundsAnalysis}
          datePikerLabel={datePikerLabel}
          numberOfElements={numberOfElementsFundsAnalysisProducts}
          totalElements={totalElementsFundsAnalysisProducts}
          totalPages={totalPagesFundsAnalysisProducts}
          currentPage={currentPageFundsAnalysisProducts}
          isTableFiltered={isTableFiltered}
        />
      ) : products ? (
        <ListProducts
          products={isSemanticSearchActive ? semanticProducts : products}
          className={"withColFixed"}
          onSort={sortProducts}
          activeSort={activeSort}
          sortStep={currentSortStep}
          lastPage={isSemanticSearchActive ? true : lastPage}
          fetchMore={isSemanticSearchActive ? () => null : fetchMore}
          filterPreferred={(preferred: boolean) => filterPreferred(preferred)}
          saveFilters={saveFilters}
          loadingMore={isSemanticSearchActive ? false : loadingMore}
          showFavorites={showFavorites}
          numberOfElements={
            isSemanticSearchActive ? semanticProducts.length : numberOfElements
          }
          totalElements={
            isSemanticSearchActive ? semanticProducts.length : totalElements
          }
          totalPages={isSemanticSearchActive ? 1 : totalPages}
          currentPage={isSemanticSearchActive ? 0 : currentPage}
          headers={CatalogueProductListHeaders}
          scalar
        />
      ) : null}
    </div>
  );
};

export default WidgetProductsList;
