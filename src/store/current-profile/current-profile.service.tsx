import { IRestResponseBody } from "model/common";
import { AxiosResponse } from "axios";
import client from "authentication/request";

export const fetchCurrentProfile = () => {
  return client
    .get(`security`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => Promise.reject(e.response.data));
};

export const logoutProfile = () => {
  return client
    .get(`gbiauthlogout`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => e);
};

export const refreshToken = () => {
  return client
    .post(`gbiauthrefresh`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody: IRestResponseBody = response.data;
      return restResponseBody;
    })
    .catch(e => e);
};

/* VisibilityCones services */
export const fetchVisibilityConesService = () => {
  return client
    .get(`gedi-api/users/visibility-cones`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchActiveVisibilityConesService = () => {
  return client
    .get(`gedi-api/users/visibility-cones/active`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const postVisibilityConesService = payload => {
  return client
    .post(`gedi-api/users/visibility-cones`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchVisibilityConesMessageService = () => {
  return client
    .get(`/gedi-api/bank-message-type-visibility-cones`)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const postVisibilityConesMessageService = payload => {
  return client
    .post(`/gedi-api/bank-message-type-visibility-cones`, payload)
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data;
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};

export const fetchNavUrlsService = (
  isFocusAllowed,
  isChatAllowed,
  isIGPIntegrated,
  customerId?
) => {
  let props = isFocusAllowed
    ? [
        "VISION",
        "WMP_INFO",
        "GUARANTEES",
        "FOCUS_LANDING_AGGREGATE",
        "FOCUS_ACCOUNTS",
        "FOCUS_PROPOSAL_ARCHIVES",
        "FOCUS_MODELS",
        "FOCUS_PROPOSAL"
      ]
    : ["VISION", "WMP_INFO", "GUARANTEES"];

  if (isChatAllowed) props.push("CHATBOT");

  if (isIGPIntegrated) props.push("INVESTIPER_GP");

  return client
    .get(
      `properties?properties=${props.join(",")}${
        customerId ? `&customerId=${customerId}` : ""
      }`
    )
    .then((response: AxiosResponse<IRestResponseBody>) => {
      const restResponseBody = response.data || {};
      return restResponseBody;
    })
    .catch(error => {
      throw error;
    });
};
