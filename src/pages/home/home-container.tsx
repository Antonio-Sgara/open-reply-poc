import React, { FC, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { HomePage } from "./home";
import { useDispatch, useSelector } from "react-redux";
import { homePageLoadedAction } from "store/currentProfile/current-profile.actions";

const HomePageContainerInner: FC<RouteComponentProps<any>> = () => {
  const url = new URL(window.location.href);
  const homePageLoaded = useSelector(
    (state: any) => state.currentProfile.homePageLoaded
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!homePageLoaded) {
      dispatch(homePageLoadedAction());
      window.scrollTo(0, 0);
    }
  }, [dispatch, homePageLoaded]);

  return homePageLoaded && !url.searchParams.get("ndg") ? <HomePage /> : null;
};

export const HomePageContainer = withRouter(HomePageContainerInner);
