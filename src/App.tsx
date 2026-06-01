import React, { useEffect } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { history, store } from "./store/store";

//import layout
import { PageTemplateContainer } from "./components/template/page/page/page-container";

//import pages
import { HomePageContainer } from "./pages/home/home-container";
import { ProductsPageContainer } from "pages/products/products-container";

import "./axiosConfig";

//container page

import { PATH } from "model/common";
import { PageNotFound } from "./pages/PageNotFound/PageNotFound";
import { ProductDetailsContainer } from "./pages/products/product-details-container";
import { FixedStaticHeader } from "./components/template/header/FixedStaticHeader/FixedStaticHeader";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { CheckAuthentication } from "./components/AuthenticatorCheck";
import { ProfilePage } from "pages/profile/profile";
import { WmpSecurityError } from "components/WmpSecurityError/WmpSecurityError";
import { WmpSecurityWarning } from "components/WmpSecurityWarning/WmpSecurityWarning";

function App() {
  useEffect(() => {
    console.log("APP TSX");
  }, []);
  return (
    <Provider store={store}>
      <CheckAuthentication>
        <Router history={history}>
          <Switch>
            <Route
              path={`${PATH.SECURITY_ERROR}`}
              exact
              component={WmpSecurityError}
            />
            <Route
              path={`${PATH.SECURITY_WARNING}`}
              exact
              component={WmpSecurityWarning}
            />
            <FixedStaticHeader>
              <PageTemplateContainer>
                <Switch>
                  <Route
                    path={[`${PATH.HOME}/`, `${PATH.LOGOUT}/`]}
                    exact
                    component={HomePageContainer}
                  />

                  <Route
                    path={`${PATH.PRODUCTS}`}
                    exact
                    component={ProductsPageContainer}
                  />
                  <Route
                    path={`${PATH.PRODUCTS}/:productCode/detail`}
                    exact
                    component={ProductDetailsContainer}
                  />

                  <Route
                    path={`${PATH.PROFILE}`}
                    exact
                    component={ProfilePage}
                  />
                  <Route
                    path="*"
                    exact
                    component={PageNotFound}
                  />
                </Switch>
              </PageTemplateContainer>
            </FixedStaticHeader>
          </Switch>
        </Router>
      </CheckAuthentication>
    </Provider>
  );
}
export default App;
