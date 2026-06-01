const SET_BREAKPOINT = "SET_BREAKPOINT";
const SET_DEVICE = "SET_DEVICE";

const initialState = {
  breakpoint: undefined,
  device: undefined
};

export const setBreakpointAction = (payload?: any) => ({
  type: SET_BREAKPOINT,
  payload
});

export const setDeviceAction = (payload?: any) => ({
  type: SET_DEVICE,
  payload
});

export const responsiveReducer = (state = initialState, action?: any) => {
  switch (action?.type) {
    case SET_BREAKPOINT:
      return {
        ...state,
        breakpoint: action.payload
      };
    case SET_DEVICE:
      return {
        ...state,
        device: action.payload
      };
    default:
      return state;
  }
};
