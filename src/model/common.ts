import React from "react";

export interface IRestResponseBody {
  values: any;
  content: any;
  last?: any;
  number?: number;
  totalElements?: number;
  numberOfElements?: number;
  totalPages?: number;
}

export interface IAction<T> {
  type: any;
  payload?: T;
  params?: any;
  status?: any;
}

export interface IErrorProps {
  message: string;
  type: "ERROR" | "SUCCESS" | "WARNING";
}

export interface IWidget {
  title?: string | React.ReactElement;
  data?: any;
  loading?: boolean;
  children?: any;
  extraClass?: string;
}

export const CATALOGO_PRODOTTI_PATH = "/products";
export const FOCUS_BASE_PATH = "";

export const PATH = {
  AUTHENTICATION: `/login`,
  HOME: ``,
  PORTFOLIO: "/portfolio",
  QUESTIONARIO_EXTERNAL: "/questionario-external",
  SBLOCCO_COOLING_OFF: "/sblocco-cooling-off",
  PRODUCTS: `/products`,
  EXTRACTIONS: "/extractions",
  CRUSCOTTO: "/cruscotto",
  DASHBOARD: "/dashboard",
  ASSETS: `${process.env.REACT_APP_FE}/static`,
  LOGOUT: "/logout",
  SECURITY_ERROR: "/security-error",
  SECURITY_WARNING: "/security-warning",
  PROFILE: "/profile"
};

export const PATH_API = {
  DOMAIN: `${process.env.REACT_APP_BE}/`,
};
