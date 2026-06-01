import { IAction } from "../../model/common";
import * as actionTypes from "./current-profile.action-types";
import { VisibilityCones } from "model/cone-visibility";

export interface iGedi {
  enabled: boolean;
}

export interface iAbiList {
  loading: boolean;
  list: any[];
}

export interface ICurrentProfile {
  info: any;
  gediStatus: iGedi;
  loggingOut: boolean;
  loadingCurrentProfile: boolean;
  grants: any;
  visibility: any;
  wmpProfileError: false;
  token: any;
  loadingVisibilityCones: boolean;
  fetchVisibilityConesError: boolean;
  postVisibilityConesError: boolean;
  visibilityCones: VisibilityCones | undefined;
  visibilityConeMessageError: any;
  postVisibilityConeMessageError: any;
  activeVisibilityCones: any;
  loadingPostVisibilityCone: boolean;
  loadingVisibilityConesMessage: boolean;
  navUrls: any;
  abiList: iAbiList;
  homePageLoaded: boolean;
  notifications: any;
  notificationsFetched: boolean;
  unreadNotificationsCount: number;
  unreadNotificationsCountFetched: boolean;
}

export const CurrentProfileInitialState: ICurrentProfile = {
  info: undefined,
  gediStatus: undefined,
  grants: undefined,
  visibility: undefined,
  loadingCurrentProfile: undefined,
  wmpProfileError: undefined,
  loggingOut: false,
  token: undefined,
  loadingVisibilityCones: true,
  loadingPostVisibilityCone: undefined,
  fetchVisibilityConesError: undefined,
  postVisibilityConesError: undefined,
  visibilityCones: undefined,
  visibilityConeMessageError: undefined,
  loadingVisibilityConesMessage: undefined,
  postVisibilityConeMessageError: undefined,
  activeVisibilityCones: undefined,
  navUrls: undefined,
  abiList: undefined,
  homePageLoaded: false,
  notifications: [],
  notificationsFetched: false,
  unreadNotificationsCount: 0,
  unreadNotificationsCountFetched: false
};

export const CurrentProfileReducer = (
  state: ICurrentProfile = CurrentProfileInitialState,
  action: IAction<any>
) => {
  switch (action.type) {
    case actionTypes.FETCH_ACTIVE_VISIBILITY_CONES_SUCCESS:
      return { ...state, activeVisibilityCones: action.payload };
    case actionTypes.RESET_ACTIVE_VISIBILITY_CONES:
      return { ...state, activeVisibilityCones: undefined };
    case actionTypes.CLEAR_VISIBILITY_ERROR:
      return {
        ...state,
        postVisibilityConesError: undefined,
        fetchVisibilityConesError: undefined
      };
    case actionTypes.CLEAR_VISIBILITY_MESSAGE_ERROR:
      return {
        ...state,
        visibilityConeMessageError: undefined,
        postVisibilityConeMessageError: undefined
      };
    case actionTypes.FETCH_VISIBILITY_CONES_MESSAGE:
      return { ...state, visibilityConeMessage: true };
    case actionTypes.FETCH_VISIBILITY_CONES_MESSAGE_SUCCESS:
      return {
        ...state,
        loadingVisibilityConesMessage: false,
        visibilityConeMessage: action.payload
      };
    case actionTypes.FETCH_VISIBILITY_CONES_MESSAGE_ERROR:
      return {
        ...state,
        visibilityConeMessageError: action.payload
      };
    case actionTypes.POST_VISIBILITY_CONES_MESSAGE_ERROR:
      return {
        ...state,
        postVisibilityConeMessageError: action.payload
      };
    case actionTypes.POST_VISIBILITY_CONES:
      return { ...state, loadingPostVisibilityCone: true };
    case actionTypes.POST_VISIBILITY_CONES_SUCCESS:
      return {
        ...state,
        loadingPostVisibilityCone: false
      };
    case actionTypes.POST_VISIBILITY_CONES_ERROR:
      return {
        ...state,
        postVisibilityConesError: action.payload,
        loadingPostVisibilityCone: false
      };
    case actionTypes.FETCH_VISIBILITY_CONES:
      return { ...state, loadingVisibilityCones: true };
    case actionTypes.FETCH_VISIBILITY_CONES_SUCCESS:
      return {
        ...state,
        loadingVisibilityCones: false,
        visibilityCones: action.payload
      };
    case actionTypes.FETCH_VISIBILITY_CONES_ERROR:
      return {
        ...state,
        loadingVisibilityCones: false,
        visibilityCones: [],
        fetchVisibilityConesError: true
      };
    case actionTypes.FETCH_CURRENT_PROFILE:
      return {
        ...state,
        loadingCurrentProfile: true
      };
    case actionTypes.SAVE_CURRENT_PROFILE:
      return {
        ...state,
        info: action.payload.profile,
        grants: action.payload?.grants,
        gediStatus: action.payload?.gediStatus,
        visibility: action.payload?.visibility,
        userGrantType: action.payload?.userGrantType,
        loadingCurrentProfile: false
      };
    case actionTypes.LOGGING_OUT:
      return {
        ...state,
        loggingOut: action.payload
      };
    case actionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload
      };
    case actionTypes.WMP_PROFILE_ERROR:
      return {
        ...state,
        wmpProfileError: action.payload,
        loadingCurrentProfile: false
      };
    case actionTypes.VISIBILITY_CONE:
      return {
        ...state,
        showVisibilityConeModal: action.payload,
        loadingCurrentProfile: false
      };
    case actionTypes.BLOCKING_ALERT:
      return {
        ...state,
        showBlockingAlert: action.payload,
        loadingCurrentProfile: false
      };
    case actionTypes.NOT_BLOCKING_ALERT:
      return {
        ...state,
        showNotBlockingAlert: action.payload,
        loadingCurrentProfile: false
      };

    case actionTypes.FETCH_ABI_LIST:
      return {
        ...state,
        abiList: { loading: true, list: [] }
      };
    case actionTypes.FETCH_ABI_LIST_SUCCESS:
      return {
        ...state,
        abiList: { loading: false, list: action.payload }
      };
    case actionTypes.FETCH_ABI_LIST_FAILURE:
      return {
        ...state,
        abiList: { loading: false, list: [] }
      };
    case actionTypes.FETCH_CAB_LIST:
      return {
        ...state,
        cabList: { loading: true, list: [] }
      };
    case actionTypes.FETCH_CAB_LIST_SUCCESS:
      return {
        ...state,
        cabList: { loading: false, list: action.payload }
      };
    case actionTypes.FETCH_CAB_LIST_FAILURE:
      return {
        ...state,
        cabList: { loading: false, list: [] }
      };
    case actionTypes.FETCH_NAV_URLS_RESPONSE:
      return {
        ...state,
        navUrls: action.payload
      };
    case actionTypes.HOME_PAGE_LOADED:
      return { ...state, homePageLoaded: true };
    case actionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };
    case actionTypes.SET_NOTIFICATIONS_FETCHED:
      return {
        ...state,
        notificationsFetched: true
      };
    case actionTypes.SET_UNREAD_NOTIFICATIONS_COUNT:
      return {
        ...state,
        unreadNotificationsCount: action.payload
      };
    case actionTypes.SET_UNREAD_NOTIFICATIONS_COUNT_FETCHED:
      return {
        ...state,
        unreadNotificationsCountFetched: true
      };
    default:
      return state;
  }
};
