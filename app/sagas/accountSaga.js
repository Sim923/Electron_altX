import {
  call,
  put,
  take,
  fork,
  takeLatest,
  all,
  cancel
} from "redux-saga/effects";
import { ACCOUNT } from "../reducers/types";
import { checkProxy } from "../utils/checkProxy";

function* checkOne(ipaddr, port, username, password) {
  try {
    // console.log("checkone", ipaddr, port);
    const res = yield checkProxy(`${ipaddr}:${port}`, username, password);
    return res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function* checkValidRequest(action) {
  // console.log(action.accounts, action.proxies);
  const newAccounts = [];
  const { proxies } = action;
  let newkey = proxies && proxies.length > 0 ? proxies[0].key : -1;

  for (const account of action.accounts) {
    // eslint-disable-next-line no-unused-vars
    if (account.proxy) {
      const str = account.proxy.split("@");
      const user = str.length > 1 ? str[0] : null;
      const proxi = str.length > 1 ? str[1] : str[0];
      if (user) {
        const [username, prx_password] = user.split(':');
        account.username = username;
        account.prx_password = prx_password;
      }
      if (proxi) {
        const [ipaddr, port] = proxi.split(':');
        account.ipaddr = ipaddr;
        account.port = port;
      }
    }
    // console.log("account, ... ", account);
    if (
      account.ipaddr &&
      account.port &&
      proxies.findIndex(
        proxy => proxy.ipaddr === account.ipaddr && proxy.port === account.port
      ) === -1
    ) {
      const proxyCheckResult = yield call(
        checkOne,
        account.ipaddr,
        account.port,
        account.username,
        account.prx_password
      );
      if (Number.isInteger(parseInt(proxyCheckResult, 10))) {
        let proxy = `${account.ipaddr}:${account.port}`;
        if (account.username)
          proxy = `${account.username}:${account.prx_password}@${proxy}`;
        const newacc = {
          email: account.email,
          password: account.password,
          proxy,
          category: account.category || "None"
        };
        newAccounts.push(newacc);

        newkey += 1;
        const row = {
          key: newkey,
          ipaddr: account.ipaddr,
          port: account.port,
          username: account.username || "",
          password: account.prx_password || "",
          validation: [true, true],
          speed: proxyCheckResult,
          edit: true
        };
        proxies.unshift(row);
      } else {
        const newacc = {
          email: account.email,
          password: account.password,
          proxy: "None",
          category: account.category || "None"
        };
        newAccounts.push(newacc);
      }
    } else {
      const { ipaddr, port, username, prx_password } = account;
      let proxy = 'None';
      if (ipaddr && port && username) {
        proxy = `${username}:${prx_password}@${ipaddr}:${port}`;
      } else if (ipaddr && port) {
        proxy = `${ipaddr}:${port}`;
      }
      const newacc = {
        email: account.email,
        password: account.password,
        proxy,
        category: account.category || "None"
      };
      newAccounts.push(newacc);
    }
  }
  yield put({ type: ACCOUNT.CHECKVALID_END, newAccounts });
}

function* takeCheck() {
  yield all([takeLatest(ACCOUNT.CHECKVALID_REQUEST, checkValidRequest)]);
}

function* checkValid() {
  let task;
  // eslint-disable-next-line
  while ((task = yield fork(takeCheck))) {
    yield take(ACCOUNT.CANCEL_CHECK);
    yield cancel(task);
  }
}

function* accountSaga() {
  yield all([fork(checkValid)]);
}

export default accountSaga;
