import axios from "axios";
import { PATH_API } from "model/common";
import { isLocalhost } from "../tools/common";
import axiosAuthRefresh from "axios-auth-refresh";

const client = axios.create({
  baseURL: `${PATH_API.DOMAIN}`
});

// /** Da implementare */
// function issueToken() {
//   return new Promise((resolve, reject) => {
//
//
//     return client(config)
//       .then(response => {
//         resolve(response?.data);
//       })
//       .catch(err => {
//         reject(err);
//       });
//   });
// }

client.interceptors.request.use(
  config => {
    if (config.url !== "/gbiauthlogin" && localStorage.token !== undefined) {
      config.headers.Authorization = "Bearer " + localStorage.token;
    }
    return config;
  },
  error => Promise.reject(error)
);

const handleAuthRefreshError = () => {
  if (!isLocalhost()) {
    localStorage.removeItem("token");
    window.location.replace(`${PATH_API.DOMAIN}gbiauthlogin`);
  }
};

const refreshAuthLogic = failedRequest =>
  client
    .post("/gbiauthrefresh")
    .then(tokenRefreshResponse => {
      if (tokenRefreshResponse.data?.JWT) {
        localStorage.setItem("token", tokenRefreshResponse.data.JWT);
        failedRequest.response.config.headers["Authorization"] =
          "Bearer " + tokenRefreshResponse.data.JWT;
        return Promise.resolve();
      } else if (failedRequest.config.skipAuthRefresh) {
        return Promise.reject();
      } else {
        handleAuthRefreshError();
        return Promise.reject();
      }
    })
    .catch(() => handleAuthRefreshError());

const createAuthRefreshInterceptor =
  typeof axiosAuthRefresh === "function"
    ? axiosAuthRefresh
    : axiosAuthRefresh?.default;

if (typeof createAuthRefreshInterceptor === "function") {
  createAuthRefreshInterceptor(client, refreshAuthLogic, { statusCodes: [403] });
}

// client.interceptors.response.use(undefined, err => {
//   console.log(err.response);
//   let originalRequest = err.response;
//   if (err.response.status === 403) {
//     isRefreshing = true;
//     return issueToken().then(({JWT}) => {
//       console.log(JWT);
//       if (JWT) {
//         localStorage.token = JWT;
//         originalRequest["Authorization"] = "" + JWT;
//         return Promise.resolve(originalRequest);
//       } else {
//         if (!isLocalhost()) {
//           localStorage.removeItem("token");
//           // window.location.replace(`${PATH_API.DOMAIN}gbiauthlogin`);
//         }
//       }
//     });
//   }
//   return Promise.reject(err.response);
//   // return Promise.reject(err);
// });

export default client;
