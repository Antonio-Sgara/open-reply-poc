import { IRestResponseBody } from "model/common";
import {
  accountType,
  CompanyInfoDTO,
  customerDossierDTO,
  CustomerDTO,
  ICustomersByCustomerIDParam,
  ICustomersParam,
  ICustomersQmifidParam,
  IDDcallDBusProps
} from "model/customer";
import { AxiosResponse } from "axios";
import client from "authentication/request";
import { IBranch } from "model/bank";
import { FatcaInfoResponseDTO } from "../../model/FatcaInfoDTO";
import qs from "qs";

export const fetchBccCustomersService = params => {
  return client
    .get(`bcc-customers`, {
      params: params,
      paramsSerializer: function(params) {
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
export const fetchWmpCustomersService = (params, advanced = false) => {
  return client
    .post(
      `wmp-customers`,
      { ...params, searchMode: advanced ? "ADVANCED" : "SIMPLE" }
      // {
      //   params: { ...params, searchMode: !advanced ? "SIMPLE" : "ADVANCED" },
      //   paramsSerializer: function(params) {
      //     return qs.stringify(params, { arrayFormat: "repeat" });
      //   }
      // }
    )
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchCustomerDossier = customerId => {
  return client
    .get(`/customers/${customerId}/dossier`)
    .then((response: AxiosResponse<customerDossierDTO>) => {
      let restResponseBody: customerDossierDTO = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};
export const fetchCustomersPdfExport = (params: ICustomersParam) => {
  return client
    .post(
      `customers/export-pdf`,
      params
      //  {
      //   params: params,
      //   paramsSerializer: function(params) {
      //     return qs.stringify(params, { arrayFormat: "repeat" });
      //   }
      // }
    )
    .then((response: AxiosResponse<CustomerDTO[]>) => {
      let restResponseBody: CustomerDTO[] = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchCustomersExcelExport = (params: ICustomersParam) => {
  return client
    .post(`customers/export-xls`, params, {
      //   params: params,
      //   paramsSerializer: function(params) {
      //     return qs.stringify(params, { arrayFormat: "repeat" });
      //   },
      responseType: "blob"
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchCustomerById = (params: ICustomersByCustomerIDParam) => {
  const customerId = params.customerId;
  const accountInfo = params.accountInfo;
  delete params.customerId;
  delete params.accountInfo;
  return client
    .get(`customers/${customerId ? customerId : accountInfo}`, {
      params: params,
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<CustomerDTO>) => {
      let restResponseBody: CustomerDTO = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchPGCompanyInfo = customerId => {
  return client
    .get(`customers/${customerId}/company-info`)
    .then((response: AxiosResponse<CompanyInfoDTO>) => {
      let restResponseBody: CompanyInfoDTO = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchPersonalProductTypes = () => {
  return client
    .get(`personal-product-types`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchPersonalPropertyTypes = () => {
  return client
    .get(`personal-property-types`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchPersonalAssetsDivisionsByIds = (
  customerId,
  personalAssetId
) => {
  return client
    .get(`customers/${customerId}`, {
      params: { includeFields: ["personalassetdivisions"] },
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: any) => {
      const restResponseBody: IRestResponseBody =
        response.data?.personalAssetDivisions;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchPersonalAssetsResourcesByIds = (
  customerId,
  personalAssetId
) => {
  return client
    .get(
      `customers/${customerId}/personal-assets/${personalAssetId}/personal-asset-resources`
    )
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const patchCustomer = (customerId, actionBE = "", data) => {
  return client
    .patch(
      `customers/${customerId}/${actionBE ? `?action=${actionBE}` : ""}`,
      data
    )
    .then(response => ({ response }))
    .catch(error => ({ error }));
};

export const patchMifidExternalCustomer = (actionBE = "", data) => {
  return client
    .patch(`external-customers${actionBE ? `?action=${actionBE}` : ""}`, data)
    .then((response: AxiosResponse<IRestResponseBody>) => ({ response }))
    .catch(error => ({ error }));
};

export const fetchCustomersQMifidTab = (params: ICustomersQmifidParam) => {
  return client
    .get("/customers/qmifid-tab", { params })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      return response.data;
    })
    .catch(error => ({ error }));
};

export const patchPersonalAssets = (customerId, personalAssets) => {
  return client
    .patch(`customers/${customerId}/personal-assets`, personalAssets)
    .then(res => {
      return res;
    })
    .catch(error => {});
};
export const patchIncomes = (customerId, incomes) => {
  return client
    .patch(`customers/${customerId}/incomes`, incomes)
    .then(res => {
      return res;
    })
    .catch(error => {});
};
export const patchExpenditures = (customerId, incomes) => {
  return client
    .patch(`customers/${customerId}/expenditures`, incomes)
    .then(res => {
      return res;
    })
    .catch(error => {});
};

export const patchQuestionnaires = (customerId, mifidType, data) => {
  return client
    .patch(`customers/${customerId}/questionnaires/${mifidType}`, data)
    .then(res => res)
    .catch(error => error);
};

export const fetchBankAccounts = customerId => {
  return client
    .get(`customers/${customerId}/bank-accounts`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return { bankAccounts: restResponseBody, error: undefined };
    })
    .catch(error => {
      return { bankAccounts: undefined, error: error.response };
    });
};

export const fetchIncomesByCustomerId = customerId => {
  return client
    .get(`customers/${customerId}/incomes`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchExpendituresByCustomerId = customerId => {
  return client
    .get(`customers/${customerId}/expenditures`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchProposalByCustomerId = (customerId, params) => {
  const parsedParams = {
    ...params,
    "proposal status": params.status
  };
  delete parsedParams.status;

  return client
    .get(`customers/${customerId}/proposals`, {
      params: parsedParams,
      paramsSerializer: function(params) {
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

export const fetchFilteredProposalByCustomerId = (
  customerId,
  params,
  filters
) => {
  const parsedParams = {
    ...params,
    "proposal status": params.status
  };
  delete parsedParams.status;

  return client
    .post(`customers/${customerId}/filtered-proposals`, filters, {
      params: parsedParams,
      paramsSerializer: function(params) {
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

export const fetchProposals = params => {
  return client
    .get(`proposals/`, {
      params: params,
      paramsSerializer: function(params) {
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

export const fetchRemoteProposals = params => {
  return client
    .get(`proposals/remote/`, {
      params: params,
      paramsSerializer: function(params) {
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

export const fetchAmlSuspendedProposals = params => {
  return client
    .get(`aml-suspended-proposal/`, {
      params: params,
      paramsSerializer: function(params) {
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

export const doFetchProposalsAdvancedSearch = payload => {
  return client
    .post(`proposals/`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};
export const doFetchRemoteProposalsAdvancedSearch = payload => {
  return client
    .post(`proposals/remote/`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};
export const doFetchCustomerProposalsAdvancedSearch = (customerId, payload) => {
  return client
    .post(`customers/${customerId}/proposals`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const deleteProposalByCustomerId = (customerId, proposalId) => {
  return client
    .delete(`customers/${customerId}/proposals/${proposalId}`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const downloadCustomerProposalReportPdf = (customerId, proposalId) => {
  return client
    .get(`customers/${customerId}/proposals/${proposalId}`, {
      responseType: "arraybuffer",
      headers: {
        accept: "application/pdf"
      }
    })
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(error => {
      return Promise.reject(error.response.status);
    });
};

export const fetchQuestionnairesByCustomerId = customerId => {
  return client
    .get(`customers/${customerId}/questionnaires`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchAlertsByCustomerId = (customerId, params) => {
  return client
    .get(`customers/${customerId}/alerts`, {
      params,
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: "comma" });
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

export const fetchAlertsByCustomerIdFiltered = (
  customerId,
  filters,
  params
) => {
  return client
    .post(`customers/${customerId}/alerts`, filters, { params })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchAlertsDocumentByCustomerIdFiltered = (
  customerId,
  filters?
) => {
  return client.post(
    `customers/${customerId}/alerts/download-excel-filtered-alerts/for-customers`,
    filters ?? {
      alertKeywordEnum: [],
      alertTypes: [],
      clientViewCallToActionFlag: "ALL",
      endDate: null,
      startDate: null
    },
    { responseType: "blob" }
  );
};

export const deleteCustomer = customerId => {
  return client
    .delete(`customers/${customerId}`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseStatus: number = response.status;
      return restResponseStatus;
    });
};

export const fetchProfessions = (dataType: string) => {
  return client
    .get(`${dataType}`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => e);
};

export const fetchQualifications = () => {
  return client
    .get(`qualifications`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => e);
};

export const fetchSupervisorProposals = params => {
  return client
    .get(`supervisioned-proposals`, {
      params: params,
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => e);
};

export const gbiauthsso = token => {
  return client
    .get(`gbiauthsso`, {
      params: { env: token }
    })
    .then((response: AxiosResponse<{ JWT: string }>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchWmpDossiers = ndg => {
  /**
   *
   **  TO DO :
   **  CONSIDERARE CHE L'INPUT POSSA ESSERE UN NDG OPPURE UN ACCOUNT INFO.
   **  DISCUTERE CON IL BE IN MERITO A QUESTA MODIFICA
   *
   **/
  return client
    .get(`wmp-dossiers?ndg=${ndg}`)
    .then((response: AxiosResponse<{ JWT: string }>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchAbiList = () => {
  return client
    .get(`banks`)
    .then((response: AxiosResponse<Array<string>>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchCabList = abi => {
  return client
    .get(`banks/${abi}/branches`)
    .then((response: AxiosResponse<Array<IBranch>>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchCustomerExecutionInProgress = ({ customerId }) => {
  return client
    .get(`customers/${customerId}/hasInExecutionProposal`)
    .then((response: AxiosResponse<boolean>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchModelPortfoliosHistory = (customerId, page, size) => {
  return client
    .get(`customers/${customerId}/customer-model-portfolios`, {
      params: { page, size },
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<Array<any>>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchCustomerDisclaimers = async params => {
  const customerId = params.customerId;
  delete params.customerId;
  return await client
    .get(`/customers/disclaimers/${customerId}`, {
      params: params,
      paramsSerializer: function(params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      }
    })
    .then((response: AxiosResponse<any>) => {
      return response.data;
    })
    .catch(e => Promise.reject(e.response));
};

export const fetchCustomerOptInInfo = customerId => {
  return client
    .get(`customers/${customerId}/opt-in-info`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const callDBus = async params => {
  try {
    const { data } = await client.get("call-dbus", { params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchFatcaInfo = (customer: CustomerDTO, isin: string) => {
  const {
    abi,
    dossierId,
    ndg: ndgIntestatario,
    accountType: customerType
  } = customer;
  return client
    .post(
      "/customers/fatca-info",
      Object.assign(
        {
          abi,
          dossierId,
          isin
        },
        customerType !== accountType.JOINT_OWNERSHIP && {
          ndgIntestatario
        }
      )
    )
    .then((response: AxiosResponse<FatcaInfoResponseDTO>) => {
      return response.data;
    })
    .catch(error => {
      return Promise.reject(error);
    });
};
