import { all, put, select, takeLatest } from "redux-saga/effects";
import { history } from "store/store";
import { FOCUS_BASE_PATH, PATH, PATH_API } from "../../model/common";
import {
  fetchCurrentProfile,
  logoutProfile,
  refreshToken
} from "./current-profile.service";
import * as actionTypes from "./current-profile.action-types";
import {
  loggingOutAction,
  saveCompanyInfoAction,
  setTokenAction,
  setWMPProfileErrorAction,
  showBlockingAlertAction,
  showNotBlockingAlertAction,
  showVisibilityConeModalAction
} from "./current-profile.actions";
import { push } from "connected-react-router";
import * as service from "./current-profile.service";
import * as customerService from "../customer/customer.service";
import * as actions from "./current-profile.actions";
import { GrantTypes, visibilityTypes } from "components/GrantsCheck";
import { noVisibilityConesMessageType } from "model/cone-visibility";
import { fetchWmpDossiersAction } from "store/customer/customer.actions";
import { REDIRECT_URL } from "utils/data-collection";
import { storeRedirectIfFocus } from "pages/reports/proposal/utils";

const getProfile = state => state.currentProfile;

function* fetchCurrentProfileSaga(action) {
  try {
    let profile = yield fetchCurrentProfile();
    if (profile) {
      Object.assign(
        profile,
        !profile.hasOwnProperty("advisor") ? { advisor: {} } : {}
      );

      if (!profile.abiConfig?.massiveOnboarding) {
        profile.grants.push({ functionCode: GrantTypes.MANUAL_ONBOARDING });
      }

      if (
        profile.visibility === visibilityTypes.ALL ||
        profile.visibility === visibilityTypes.ABI
      ) {
        yield put(actions.fetchAbiListAction());
      }

      yield put(actions.fetchCabListAction({ abi: profile?.abi }));

      yield put(
        saveCompanyInfoAction({
          profile: profile,
          gediStatus: profile.gediStatus,
          grants: profile.grants?.map(el => {
            return el.functionCode;
          }),
          visibility: profile.visibility,
          userGrantType: profile.userGrantType
        })
      );
      if (action?.payload?.ndg) {
        yield put(fetchWmpDossiersAction(action.payload.ndg));
      } else {
        const gediStatus = profile.gediStatus;
        if (gediStatus?.enabled) {
          yield fetchActiveVisibilityConesSaga();
        }
        if (gediStatus?.showPopup && gediStatus?.enabled) {
          if (
            gediStatus?.noVisibilityConesMessageType ===
            noVisibilityConesMessageType.BLOCK
          ) {
            // store wmp-redirect from focus when login is not successfull.
            storeRedirectIfFocus(
              window.location.href,
              FOCUS_BASE_PATH,
              REDIRECT_URL
            );

            yield put(showBlockingAlertAction(true));
            yield put(push(`${PATH.SECURITY_ERROR}`));
          } else if (
            gediStatus?.noVisibilityConesMessageType ===
            noVisibilityConesMessageType.INFORMATIVE
          ) {
            yield put(showNotBlockingAlertAction(true));
            yield put(push(`${PATH.SECURITY_WARNING}`));
          } else if (
            !gediStatus?.selectedVisibilityCone?.defaultChoice &&
            !gediStatus?.selectedVisibilityCone?.wallet &&
            !gediStatus?.selectedVisibilityCone?.bankBranch
          ) {
            yield put(showVisibilityConeModalAction(true));
            history.push(`${PATH.SECURITY_WARNING}`);
          }
        }
      }
    }
  } catch (error) {
    if (error?.message) {
      yield put(setWMPProfileErrorAction(error?.message));
    } else {
      yield put(setWMPProfileErrorAction("SERVER_ERROR"));
    }
    // store wmp-redirect from focus when login is not successfull.
    storeRedirectIfFocus(window.location.href, FOCUS_BASE_PATH, REDIRECT_URL);

    yield put(push(`${PATH.SECURITY_ERROR}`));
  }
}

function* logoutProfileSaga(action) {
  yield put(loggingOutAction(true));
  try {
    yield logoutProfile();
    localStorage.removeItem("token");
    yield put(setTokenAction(undefined));
    window.location.replace(`${PATH_API.DOMAIN}gbiauthlogin`);
  } catch {
    yield put(loggingOutAction(false));
  }
}

function* refreshTokenSaga(action) {
  try {
    const newToken = yield refreshToken();
    if (typeof newToken === "string") {
      localStorage.setItem("token", newToken);
      yield put(setTokenAction(newToken));
    }
  } catch {}
}

function* fetchActiveVisibilityConesSaga() {
  try {
    const visibilityCones = yield service.fetchActiveVisibilityConesService();
    yield put(actions.fetchActiveVisibilityConesSuccessAction(visibilityCones));
  } catch (error) {
    yield put(actions.fetchActiveVisibilityConesErrorAction(error));
  }
}

function* fetchVisibilityConesSaga() {
  try {
    const visibilityCones = yield service.fetchVisibilityConesService();
    yield put(actions.fetchVisibilityConesSuccessAction(visibilityCones));
  } catch (error) {
    yield put(actions.fetchVisibilityConesErrorAction(error));
  }
}

function* postVisibilityConesSaga(action) {
  try {
    yield service.postVisibilityConesService(action.payload);
    yield put(actions.postVisibilityConesSuccessAction());
    yield put(actions.resetVisibilityConesAction());
    history.push(`${PATH.HOME}`);
    yield service.fetchActiveVisibilityConesService();
  } catch (error) {
    yield put(actions.postVisibilityConesErrorAction(error));
  }
}

// Visibility Cone Message

function* fetchVisibilityConesMessageSaga() {
  try {
    const visibilityConesMessage = yield service.fetchVisibilityConesMessageService();
    yield put(
      actions.fetchVisibilityConesMessageSuccessAction(visibilityConesMessage)
    );
  } catch (error) {
    yield put(actions.fetchVisibilityConesMessageErrorAction(error));
  }
}

function* postVisibilityConesMessageSaga(action) {
  try {
    yield service.postVisibilityConesMessageService(action.payload);
    yield put(actions.postVisibilityConesMessageSuccessAction());
    history.push(`${PATH.HOME}`);
  } catch (error) {
    yield put(actions.postVisibilityConesMessageErrorAction(error));
  }
}

function* fetchNavUrlsSaga(action) {
  try {
    //STAN MENU -> SE RECUPERO PATH VARIABILE IN BASE AI GRANTS
    // const navUrls = yield service.fetchNavUrlsService(action.payload);
    //STAN MENU -> SE RECUPERO PATH COSTANTE E POI SI GESTISCE NON MOSTRANDO I BOTTONI NEL MENU
    const profile = yield select(getProfile);

    const navUrls = yield service.fetchNavUrlsService(
      profile?.info?.isFocusAllowed,
      profile?.info?.isChatAllowed,
      profile?.info?.isIGPIntegrated,
      false
    );

    yield put(actions.fetchNavUrlsResponseAction(navUrls));
  } catch (error) {
    yield put(actions.fetchNavUrlsResponseAction({}));
  }
}

function* fetchAbiListSaga() {
  try {
    const banks = yield customerService.fetchAbiList();
    yield put(actions.fetchAbiListSuccessAction(banks));
  } catch (error) {
    yield put(actions.fetchAbiListFailureAction());
  }
}

function* fetchCabListSaga(action) {
  try {
    if (!action.payload.abi) yield put(actions.fetchCabListSuccessAction([]));
    else {
      const branches = yield customerService.fetchCabList(action.payload.abi);
      yield put(actions.fetchCabListSuccessAction(branches));
    }
  } catch (error) {
    yield put(actions.fetchCabListFailureAction());
  }
}

export function* watchCurrentProfileSagas() {
  yield all([
    takeLatest(actionTypes.FETCH_CURRENT_PROFILE, fetchCurrentProfileSaga),
    takeLatest(actionTypes.LOGOUT, logoutProfileSaga),
    takeLatest(actionTypes.REFRESH_TOKEN, refreshTokenSaga),
    takeLatest(
      actionTypes.FETCH_ACTIVE_VISIBILITY_CONES,
      fetchActiveVisibilityConesSaga
    ),
    takeLatest(actionTypes.POST_VISIBILITY_CONES, postVisibilityConesSaga),
    takeLatest(
      actionTypes.FETCH_VISIBILITY_CONES_MESSAGE,
      fetchVisibilityConesMessageSaga
    ),
    takeLatest(
      actionTypes.POST_VISIBILITY_CONES_MESSAGE,
      postVisibilityConesMessageSaga
    ),
    takeLatest(actionTypes.FETCH_VISIBILITY_CONES, fetchVisibilityConesSaga),
    takeLatest(actionTypes.FETCH_NAV_URLS, fetchNavUrlsSaga),
    takeLatest(actionTypes.FETCH_ABI_LIST, fetchAbiListSaga),
    takeLatest(actionTypes.FETCH_CAB_LIST, fetchCabListSaga)
    // takeLatest(
    //   [
    //     customerActionTypes.FETCH_CUSTOMER_BY_ID_SUCCESS,
    //     MODIFYING_EXISTING_ONBOARDING
    //   ],
    //   checkPermissionsSaga
    // )
  ]);
}
