import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import app from './app';
import accountReducer from "./accountReducer";
import proxyReducer from "./proxyReducer";
import settingsReducer from "./settingsReducer";
import billingReducer from "./billingReducer";

export default (history) => {
  return combineReducers({
    router: connectRouter(history),
    app,
    accounts: accountReducer,
    proxies: proxyReducer,
    settings: settingsReducer,
    billingData: billingReducer
  });
}
