import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
// import { AppContainer } from "react-hot-loader";
import * as Sentry from '@sentry/browser';
import AuthContainer from "./containers/AuthContainer";
import Root from "./containers/Root";
import { configureStore, history } from "./store/configureStore";
import "./app.global.scss";
// import "!style-loader!css-loader!antd/dist/antd.css";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  Sentry.init({dsn: "https://4913edfb068f40e1ae5647ec32e60ad4@sentry.io/1724986"});
}

const store = configureStore();

render(
  <Provider store={store}>
    <AuthContainer theme={store.getState().settings.theme}>
      <Root history={history} />
    </AuthContainer>
  </Provider>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./containers/Root", () => {
    // eslint-disable-next-line global-require
    const NextRoot = require("./containers/Root").default;
    render(
      <Provider store={store}>
        <AuthContainer>
          <NextRoot history={history} />
        </AuthContainer>
      </Provider>,
      document.getElementById("root")
    );
  });
}
