import { all, fork } from "redux-saga/effects";
import proxySaga from "./proxySaga";
import accountSaga from "./accountSaga";

export default function* rootSaga() {
  yield all([fork(proxySaga), fork(accountSaga)]);
}
