export const connectRouter = (_history?: any) => (state = {}) => state;

export const routerMiddleware = (_history?: any) => () => (next: any) => (action: any) =>
  next(action);

export const push = (payload?: any) => ({
  type: "@@router/CALL_HISTORY_METHOD",
  payload
});
