import { IRestResponseBody } from "model/common";
import { AxiosResponse } from "axios";
import client from "authentication/request";
import {
  productDetailIncludedFields,
  ProductDetailsDTO
} from "../../model/product";
import { operativityTypes } from "model/proposal";
import qs from "qs";

export const fetchProducts = (params: any, payload = {}) => {
  return client
    .post(`products`, payload, {
      params: params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFundsAnalysisProducts = (params: any, payload = {}) => {
  return client
    .post(`category-funds-products`, payload, {
      params: params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      return Promise.reject(error.response?.data ?? error);
    });
};

export const getAdvancedProductFilter = (payload = {}) => {
  return client
    .post("advanced-product-filter", payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const getAdvancedFundsAnalysisFilter = (payload = {}) => {
  return client
    .post("category-funds-products/populate-filters", payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const getProductCompanyNames = (
  payload = {},
  queryParams: any = undefined
) => {
  return client
    .post(
      "product-company-names",
      payload || {},
      queryParams?.equivalentProductId && {
        params: { equivalentProductId: queryParams.equivalentProductId }
      }
    )
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const filteredProductsAdvancedFilter = (
  payload = {},
  queryParams = {}
) => {
  return client
    .post("/filtered-products/advanced-filter", payload, {
      params: queryParams
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchProductDetails = ({
  productCode,
  includeFields
}: {
  productCode: string;
  includeFields: string[];
}) => {
  return client
    .get(`products/${productCode}`, {
      params: { includeFields },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<ProductDetailsDTO>) => {
      const restResponseBody: ProductDetailsDTO = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchProductPosition = ({
  portfolioId,
  productCode,
  intestatario = "",
  rubrica = undefined,
  detailed = false
}: {
  portfolioId: string;
  productCode: string;
  intestatario?: string;
  rubrica?: any;
  detailed?: boolean;
}) => {
  return client
    .get(`portfolios/${portfolioId}/positions/${productCode}`, {
      params: Object.assign(
        {
          intestatario: intestatario || undefined,
          includeFields: detailed ? productDetailIncludedFields : undefined,
          portfolioPositionView: detailed ? "MONITORING" : undefined
        },
        rubrica ? { rubrica } : {}
      ),
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<ProductDetailsDTO>) => {
      const restResponseBody: ProductDetailsDTO = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const patchProducts = (params: any, payload: any) => {
  return client
    .patch(`products/${params.productId}`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseStatus: number = response.status;
      return restResponseStatus;
    })
    .catch(() => null);
};

export const fetchFilteredProductsPolicy = ({ ...params }: any, payload = {}) => {
  const body = { ...params, IBIPEquivalentProductsDTORequest: { ...payload } };
  return client
    .post(`/ibip-equivalent-products`, body, { params: {} })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFilteredProducts = (
  { equivalentProductId, ...params }: any,
  payload = {}
) => {
  const body = { ...params, AdvancedFilteredProductDTORequest: { ...payload } };
  return client
    .post(`filtered-products`, body, { params: { equivalentProductId } })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFilteredProductsEligibleSwitchFunds = (
  bodyParams: any,
  payload = {},
  queryParams: any
) => {
  const body = {
    ...bodyParams,
    AdvancedFilteredProductDTORequest: { ...payload }
  };
  return client
    .post(`/filtered-products/eligible-switch-funds`, body, {
      params: queryParams
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFilteredProductsEligibleSwitchGPs = (
  bodyParams: any,
  payload = {},
  queryParams: any
) => {
  const body = {
    ...bodyParams,
    AdvancedFilteredProductDTORequest: { ...payload }
  };
  return client
    .post(`/filtered-products/eligible-switch-gps`, body, {
      params: queryParams
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchProductDescription = (productId: string) => {
  return client
    .get(`products/${productId}/descriptions`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFaaFirstLevel = (productId: string, sorter: any) => {
  return client
    .get(`products/${productId}/faa-first-level-components`, {
      params: sorter ? { sort: sorter } : {}
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFaaCurrencies = (productId: string) => {
  return client
    .get(`products/${productId}/faa-currencies`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFaaSecondLevel = (productId: string, sorter: any) => {
  return client
    .get(`products/${productId}/faa-second-level-components`, {
      params: sorter ? { sort: sorter } : {}
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchMainSecurities = (productId: string, sorter: any) => {
  return client
    .get(`products/${productId}/main-securities`, {
      params: { sort: sorter }
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchDurations = (productId: string, sorter: any) => {
  return client
    .get(`products/${productId}/durations`, {
      params: { sort: sorter }
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchMWRRPerformance = (productId: string, params: any) => {
  return client
    .get(`products/${productId}/performance-graph-points`, { params })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchRiskPerformance = (productId: string, params: any) => {
  return client
    .get(`products/${productId}/risk-indicators`, {
      params
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchMarketPlaces = (productIdList: string[]) => {
  return client
    .get(`products/market-places`, {
      params: {
        productIdList: productIdList
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      return Promise.reject(error);
    });
};

export const fetchFondamentalAnalysis = (portfolioId: string) => {
  return client
    .get(`products/${portfolioId}/analysis-variables`)
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const downloadProductPdf = (id: string, documentType: string) => {
  return client
    .get(`products/${id}`, {
      params: { documentType },
      responseType: "arraybuffer",
      headers: {
        accept: "application/pdf"
      }
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      const decoder = new TextDecoder("utf-8");
      return Promise.reject(JSON.parse(decoder.decode(error.response.data)));
    });
};

export const fetchPACOptions = (productId: string) => {
  return client
    .get(`products/${productId}/pac-options`)
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchDefaultMarketPlaces = (
  productIdList: string[],
  operativityType: operativityTypes
) => {
  return client
    .get(`products/default-market-places`, {
      params: {
        productIdList: productIdList,
        operativityType: operativityType
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchFilteredIBIPSProducts = (
  params: any,
  payload = {},
  filter = ""
) => {
  return client
    .post(`products/filtered-ibips-products`, payload, {
      params: Object.assign(params, { switchInIsin: filter })
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      return Promise.reject(error.response);
    });
};
