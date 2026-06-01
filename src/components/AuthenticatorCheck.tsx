import React, { useEffect, useRef } from "react";
import OAuth from "../authentication/OAuth";
import Loader from "./Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentProfileAction,
  refreshTokenAction,
  setTokenAction
} from "../store/currentProfile/current-profile.actions";
import { isLocalhost } from "../tools/common";
import { gbiauthsso } from "../store/customer/customer.service";
import { history } from "../store/store";
import { FOCUS_BASE_PATH, PATH } from "../model/common";
import { REDIRECT_URL } from "utils/data-collection";
import { storeRedirectIfFocus } from "pages/reports/proposal/utils";

const TIMER = 3000000;

export const CheckAuthentication = ({ children }) => {
  const dispatch = useDispatch();
  const loginRef = useRef(null);
  const url = new URL(window.location.href);

  const { token, loadingCurrentProfile, info, loggingOut } = useSelector(
    (state: any) => state.currentProfile
  );
  const loadingWmpDossiers = useSelector(
    (state: any) => state.customer.loadingWmpDossiers
  );

  useEffect(() => {
    console.log("ENTRO");
  }, []);
  const onToken = ({ token }) => {
    dispatch(setTokenAction(token));

    localStorage.setItem("token", token);
    if (token) {
      dispatch(fetchCurrentProfileAction({ ndg: url.searchParams.get("ndg") }));
      const storedUrl = sessionStorage.getItem(REDIRECT_URL);
      if (storedUrl) {
        sessionStorage.removeItem(REDIRECT_URL);
        history.replace(storedUrl);
      }
    }
  };

  const handleAuth = () => {
    if (isLocalhost()) {
      dispatch(fetchCurrentProfileAction({ ndg: url.searchParams.get("ndg") }));
    } else if (!token && !localStorage.getItem("token")) {
      loginRef.current?.startAuth();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const urlToken = url.searchParams.get("token");

    if (storedToken && !urlToken && !isLocalhost()) {
      onToken({ token: storedToken });
    } else if (urlToken) {
      const RedirectInFocus = sessionStorage.getItem(REDIRECT_URL);
      const firstRedirectPath = RedirectInFocus ? RedirectInFocus : PATH.HOME;
      history.replace(firstRedirectPath);
      gbiauthsso(urlToken)
        .then(res => onToken({ token: res.JWT }))
        .catch(handleAuth);
    } else {
      // store wmp-redirect from focus when login is not successfull.
      storeRedirectIfFocus(window.location.href, FOCUS_BASE_PATH, REDIRECT_URL);

      handleAuth();
    }

    if (!isLocalhost()) {
      const refreshTimer = setInterval(
        () => dispatch(refreshTokenAction()),
        TIMER
      );
      return () => clearInterval(refreshTimer);
    }
  }, []);

  let isLoading =
    loadingWmpDossiers ||
    (loadingWmpDossiers === undefined &&
      ((loadingCurrentProfile && !info) ||
        loadingCurrentProfile === undefined ||
        loggingOut)) ||
    (!token && !isLocalhost());

  return isLoading ? (
    <>
      <Loader.WidgetWrapper>
        <Loader.Spinner />
      </Loader.WidgetWrapper>
      <OAuth
        ref={loginRef}
        token={onToken}
      />
    </>
  ) : (
    children
  );
};
