import {
  call,
  put,
  take,
  fork,
  takeLatest,
  all,
  cancel
} from "redux-saga/effects";
import { PROXY } from "../reducers/types";
import { checkProxy } from "../utils/checkProxy";

function* checkOne(ipaddr, port, username, password) {
  try {
    // console.log("checkone", ipaddr, port);
    const res = yield checkProxy(`${ipaddr}:${port}`, username, password);
    return res;
  } catch (e) {
    console.error(e);
    return "bad";
  }
}

function* checkValidRequest(action) {
  if (action.adding) {
    const newProxies = [];
    // eslint-disable-next-line no-unused-vars
    for (const proxy of action.proxies) {
      const resp = yield call(
        checkOne,
        proxy.ipaddr,
        proxy.port,
        proxy.username,
        proxy.password
      );
      if (resp !== "bad") {
        proxy.speed = resp;
        newProxies.push(proxy);
      }
    }
    yield put({
      type: PROXY.CHECKVALID_END,
      newProxies,
      adding: true
    });
  } else {
    // eslint-disable-next-line no-unused-vars
    for (const proxy of action.proxies) {
      const res = yield call(
        checkOne,
        proxy.ipaddr,
        proxy.port,
        proxy.username,
        proxy.password
      );
      yield put({
        type: PROXY.CHECKVALID_END,
        valid: res,
        adding: false,
        key: proxy.key
      });
    }
  }
}

function* takeCheck() {
  yield all([takeLatest(PROXY.CHECKVALID_REQUEST, checkValidRequest)]);
}

function* proxySagas() {
  let task;
  // eslint-disable-next-line
  while ((task = yield fork(takeCheck))) {
    yield take(PROXY.CANCEL_CHECK);
    yield cancel(task);
  }
}

export default proxySagas;
