import * as actionTypes from "./current-profile.action-types";
import { VisibilityConePostRequest } from "model/cone-visibility";

export const fetchCurrentProfileAction = (params?: any) => ({
  type: actionTypes.FETCH_CURRENT_PROFILE,
  payload: params
});

export const saveCompanyInfoAction = (params?: any) => ({
  type: actionTypes.SAVE_CURRENT_PROFILE,
  payload: params
});

export const setWMPProfileErrorAction = (params?: any) => ({
  type: actionTypes.WMP_PROFILE_ERROR,
  payload: params
});

export const showVisibilityConeModalAction = (show: boolean) => ({
  type: actionTypes.VISIBILITY_CONE,
  payload: show
});

export const showBlockingAlertAction = (show: boolean) => ({
  type: actionTypes.BLOCKING_ALERT,
  payload: show
});

export const showNotBlockingAlertAction = (show: boolean) => ({
  type: actionTypes.NOT_BLOCKING_ALERT,
  payload: show
});

export const loggingOutAction = (params?: any) => ({
  type: actionTypes.LOGGING_OUT,
  payload: params
});

export const logoutAction = (params?: any) => ({
  type: actionTypes.LOGOUT,
  payload: params
});

export const setTokenAction = (params?: any) => ({
  type: actionTypes.SET_TOKEN,
  payload: params
});

export const refreshTokenAction = (params?: any) => ({
  type: actionTypes.REFRESH_TOKEN,
  payload: params
});

// fetchActiveVisibilityConesAction

export const fetchActiveVisibilityConesAction = () => ({
  type: actionTypes.FETCH_ACTIVE_VISIBILITY_CONES
});

export const fetchActiveVisibilityConesSuccessAction = (
  visibilityCones: any
) => ({
  type: actionTypes.FETCH_ACTIVE_VISIBILITY_CONES_SUCCESS,
  payload: visibilityCones
});

export const fetchActiveVisibilityConesErrorAction = (error: any) => ({
  type: actionTypes.FETCH_ACTIVE_VISIBILITY_CONES_ERROR,
  payload: error
});

// fetchVisibilityConesAction

export const fetchVisibilityConesAction = () => ({
  type: actionTypes.FETCH_VISIBILITY_CONES
});

export const fetchVisibilityConesSuccessAction = (visibilityCones: any) => ({
  type: actionTypes.FETCH_VISIBILITY_CONES_SUCCESS,
  payload: visibilityCones
});

export const fetchVisibilityConesErrorAction = (error: any) => ({
  type: actionTypes.FETCH_VISIBILITY_CONES_ERROR,
  payload: error
});

export const postVisibilityConesAction = (
  postRequestObject: VisibilityConePostRequest
) => ({
  type: actionTypes.POST_VISIBILITY_CONES,
  payload: postRequestObject
});

export const postVisibilityConesSuccessAction = () => ({
  type: actionTypes.POST_VISIBILITY_CONES_SUCCESS
});

export const postVisibilityConesErrorAction = (error: any) => ({
  type: actionTypes.POST_VISIBILITY_CONES_ERROR,
  payload: error
});

export const resetVisibilityConesAction = () => ({
  type: actionTypes.RESET_ACTIVE_VISIBILITY_CONES
});

export const clearVisibilityErrorAction = () => ({
  type: actionTypes.CLEAR_VISIBILITY_ERROR
});

// fetchVisibilityConesMessageAction

export const clearVisibilityMessageErrorAction = () => ({
  type: actionTypes.CLEAR_VISIBILITY_MESSAGE_ERROR
});

export const fetchVisibilityConesMessageAction = () => ({
  type: actionTypes.FETCH_VISIBILITY_CONES_MESSAGE
});

export const fetchVisibilityConesMessageSuccessAction = (
  visibilityConesMessage: any
) => ({
  type: actionTypes.FETCH_VISIBILITY_CONES_MESSAGE_SUCCESS,
  payload: visibilityConesMessage
});

export const fetchVisibilityConesMessageErrorAction = (error: any) => ({
  type: actionTypes.FETCH_VISIBILITY_CONES_MESSAGE_ERROR,
  payload: error
});

export const postVisibilityConesMessageAction = (postRequestObject: any) => ({
  type: actionTypes.POST_VISIBILITY_CONES_MESSAGE,
  payload: postRequestObject
});

export const postVisibilityConesMessageSuccessAction = () => ({
  type: actionTypes.POST_VISIBILITY_CONES_MESSAGE_SUCCESS
});

export const postVisibilityConesMessageErrorAction = (error: any) => ({
  type: actionTypes.POST_VISIBILITY_CONES_MESSAGE_ERROR,
  payload: error
});

export const fetchNavUrlsAction = (params?: any) => ({
  type: actionTypes.FETCH_NAV_URLS
});

export const fetchNavUrlsResponseAction = (navUrls: any) => ({
  type: actionTypes.FETCH_NAV_URLS_RESPONSE,
  payload: navUrls
});

export const fetchAbiListAction = () => ({
  type: actionTypes.FETCH_ABI_LIST
});

export const fetchAbiListSuccessAction = (params: any) => ({
  type: actionTypes.FETCH_ABI_LIST_SUCCESS,
  payload: params
});

export const fetchAbiListFailureAction = () => ({
  type: actionTypes.FETCH_ABI_LIST_FAILURE
});

export const fetchCabListAction = (params: any) => ({
  type: actionTypes.FETCH_CAB_LIST,
  payload: params
});

export const fetchCabListSuccessAction = (params: any) => ({
  type: actionTypes.FETCH_CAB_LIST_SUCCESS,
  payload: params
});

export const fetchCabListFailureAction = () => ({
  type: actionTypes.FETCH_CAB_LIST_FAILURE
});

export const homePageLoadedAction = () => ({
  type: actionTypes.HOME_PAGE_LOADED
});

export const setNotificationsAction = (params?: any) => ({
  type: actionTypes.SET_NOTIFICATIONS,
  payload: params
});

export const setUnreadNotificationsCountAction = (params?: any) => ({
  type: actionTypes.SET_UNREAD_NOTIFICATIONS_COUNT,
  payload: params
});

export const setNotificationsFetchedAction = () => ({
  type: actionTypes.SET_NOTIFICATIONS_FETCHED
});

export const setUnreadNotificationsCountFetchedAction = () => ({
  type: actionTypes.SET_UNREAD_NOTIFICATIONS_COUNT_FETCHED
});
