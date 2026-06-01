import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { all, call, spawn } from "redux-saga/effects";
//import axiosMiddleware from 'redux-axios-middleware';

//reducers
import { alertReducer } from "./alert/alert.reducer";
import { customerReducer } from "./customer/customer.reducer";
import { identityDocumentReducer } from "./identity-document/identity-document.reducer";
import { investmentProjectReducer } from "./investment-project/investmentProject.reducer";
import { portfolioReducer } from "./portfolio/portfolio.reducer";
import { productReducer } from "./product/product.reducer";
import { proposalReducer } from "./proposal/proposal.reducer";
import { questionnairesReducer } from "./questionnaires/questionnaires.reducer";
import { responsiveReducer } from "./responsive";

//saga

import { watchProposalSaga } from "./proposal/proposal.saga";
import { watchAlertsSaga } from "./alert/alert.saga";
import { watchCustomerSaga } from "./customer/customer.saga";
import { watchPortfolioSaga } from "./portfolio/portfolio.saga";
import { composeWithDevTools } from "redux-devtools-extension";
import client from "../authentication/request";
import { addCustomerReducer } from "./add-customer/add-customer.reducer";
import { watchAddCustomerSaga } from "./add-customer/add-customer.saga";
import { advancedProposalReducer } from "./advanced-proposal/advanced-proposal.reducer";
import { watchAdvancedProposalSagas } from "./advanced-proposal/advanced-proposal.saga";
import { logErrorToServer } from "./alert/alert.service";
import { cruscottoReducer } from "./cruscotto/cruscotto.reducer";
import { CurrentProfileReducer } from "./currentProfile/current-profile.reducer";
import { watchCurrentProfileSagas } from "./currentProfile/current-profile.saga";
import { familyMembersReducer } from "./family-members/family-members.reducer";
import { watchFamilyMembersSaga } from "./family-members/family-members.saga";
import { homeReducer } from "./home/home.reducer";
import { watchHomeSaga } from "./home/home.saga";
import { watchInvestmentProjectSaga } from "./investment-project/investmentProject.saga";
import { ManualForcingReducer } from "./manual-forcing/manual-forcing.reducer";
import { watchManualForcing } from "./manual-forcing/manual-forcing.saga";
import { monitorinReducer } from "./monitoring/monitoring.reducer";
import { watchMonitoringSaga } from "./monitoring/monitoring.saga";
import { PdfExportReducer } from "./pdfExport/pdfExport.reducer";
import { watchExportReportSaga } from "./pdfExport/pdfExport.saga";
import { watchProductsSaga } from "./product/product.saga";
import { proposalGuidedReducer } from "./proposal/guided/proposal.guided.reducer";
import { watchProposalGuidedSaga } from "./proposal/guided/proposal.guided.saga";
import { watchQuestionnairesSaga } from "./questionnaires/questionnaires.saga";
import { socketNotificationReducer } from "./socket-notification/socket-notification.reducer";
import { validationReducer } from "./validation/validation.reducer";
import { watchValidationSaga } from "./validation/validation.saga";
import { modalsReportFlowReducer } from "./modals-report-flow/modals-report-flow.reducer";
import { getLogErrorMessage } from "tools/common";
import { watchFocusSaga } from "./focus/focus.saga";
import { focusReducer } from "./focus/focus.reducer";

//mock configuration
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  client.defaults.headers.common["Authorization"] =
    /**REGULAR */
    "Bearer eyJqd3RUb2tlbiI6eyJqd3RUb2tlbiI6eyJhY2Nlc3NfdG9rZW4iOiJGTEMyNzE2IiwiaXN0aXR1dG9Db3JyZW50ZSI6IjAwMSIsImZpbGlhbGVDb3JyZW50ZSI6Ijk5MCIsInVzZXJJZCI6IkZMQzU0MzEifSwiZXhwIjoxNjg0OTIyMzc4NjkxfSwiYWxnIjoiSFMyNTYifQ.eyJqd3RUb2tlbiI6eyJhY2Nlc3NfdG9rZW4iOiJGTEMyNzE2IiwiaXN0aXR1dG9Db3JyZW50ZSI6IjAwMSIsImZpbGlhbGVDb3JyZW50ZSI6Ijk5MCIsInVzZXJJZCI6IkZMQzU0MzEifSwiZXhwIjoxNjg0OTIyMzc4NjkxfQ.Q4-lJE6-Bbuq5am-CkTtM6o0bPUFlJzdxojuuLOt1EU";
  /**SUPER ABI */
  //"Bearer eyJqd3RUb2tlbiI6eyJqd3RUb2tlbiI6eyJhY2Nlc3NfdG9rZW4iOiI1NTU1NTVlYmFiNTZmMTk1NjFkNjRjZDNjYWRjNTM5MiIsImlzdGl0dXRvQ29ycmVudGUiOiIwODU1MCIsImZpbGlhbGVDb3JyZW50ZSI6IjU1MTAwIiwidXNlcklkIjoiRkxDMTM0NSJ9LCJleHAiOjE2MjQ0NjA5ODg0OTB9LCJhbGciOiJIUzI1NiJ9.eyJqd3RUb2tlbiI6eyJhY2Nlc3NfdG9rZW4iOiI1NTU1NTVlYmFiNTZmMTk1NjFkNjRjZDNjYWRjNTM5MiIsImlzdGl0dXRvQ29ycmVudGUiOiIwODU1MCIsImZpbGlhbGVDb3JyZW50ZSI6IjU1MTAwIiwidXNlcklkIjoiRkxDMTM0NSJ9LCJleHAiOjE2MjQ0NjA5ODg0OTB9.KJv8S9XPSytGMY9ezJH-hISLvGkosZqzbtlt4fMoK1s";
}

const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory({
  basename: process.env.REACT_APP_FE
});
const router = routerMiddleware(history);

const createRootReducer = hy =>
  combineReducers({
    router: connectRouter(hy),
    home: homeReducer,
    alerts: alertReducer,
    add_customer: addCustomerReducer,
    customer: customerReducer,
    portfolio: portfolioReducer,
    monitoring: monitorinReducer,
    product: productReducer,
    proposal: proposalReducer,
    proposalGuided: proposalGuidedReducer,
    focus: focusReducer,
    investment_project: investmentProjectReducer,
    responsive: responsiveReducer,
    advancedProposal: advancedProposalReducer,
    validation: validationReducer,
    questionnaires: questionnairesReducer,
    familyMembers: familyMembersReducer,
    pdfExport: PdfExportReducer,
    currentProfile: CurrentProfileReducer,
    manualForcing: ManualForcingReducer,
    cruscotto: cruscottoReducer,
    socketNotification: socketNotificationReducer,
    idDocuments: identityDocumentReducer,
    modalsReportFlow: modalsReportFlowReducer
  });

export const store =
  process.env.NODE_ENV === "production"
    ? createStore(
        createRootReducer(history),
        compose(applyMiddleware(sagaMiddleware, router))
      )
    : createStore(
        createRootReducer(history),
        composeWithDevTools(compose(applyMiddleware(sagaMiddleware, router)))
      );

function* rootSaga() {
  const sagaWatchers = [
    watchHomeSaga,
    watchAlertsSaga,
    watchValidationSaga,
    watchCustomerSaga,
    watchProposalSaga,
    watchFamilyMembersSaga,
    watchPortfolioSaga,
    watchMonitoringSaga,
    watchProductsSaga,
    watchInvestmentProjectSaga,
    watchAddCustomerSaga,
    watchAdvancedProposalSagas,
    watchQuestionnairesSaga,
    watchCurrentProfileSagas,
    watchExportReportSaga,
    watchProposalGuidedSaga,
    watchFocusSaga,
    watchManualForcing
  ];

  yield all(
    sagaWatchers.map(saga =>
      spawn(function*() {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (e) {
            console.error(e);
            logErrorToServer(getLogErrorMessage(e));
          }
        }
      })
    )
  );
}

sagaMiddleware.run(rootSaga);
