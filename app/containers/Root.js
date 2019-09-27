// @flow
import React, { Component } from "react";
import fs from "fs";
import path from 'path';
import { ipcRenderer } from "electron";
import * as Sentry from '@sentry/browser';
// import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { connect } from "react-redux";
// import type { Store } from "../reducers/types";
import Routes from "../Routes";
import { ACCOUNT, PROXY } from "../reducers/types";

type Props = {
  history: {}
};

class Root extends Component<Props> {
  componentDidMount() {
    if (this.props.socket.readyState) {
      this.props.socket.send(JSON.stringify({ event: "latestVersion", data: { platform: process.platform } }));
    } else {
      this.props.socket.onopen = () => {
        console.log("socket connected");
        this.props.socket.send(JSON.stringify({ event: "latestVersion" }));
      };
    }

    const accPath = path.join(__dirname, "/__accs.json");
    const prxPath = path.join(__dirname, "/__prxs.json");
    ipcRenderer.on("electronPath", (event, data) => {
      console.log("electron ...", data);
    });
    ipcRenderer.on("actionLog", (event, data) => {
      this.props.changeField(data.email, "actionlog", data.status);
      if (data.status === "Scheming") {
        this.props.changeField(data.email, "actions-0", true);
      }
    });
    ipcRenderer.on("oneClick", (event, data) => {
      this.props.changeOneClick(data.email, data.value);
    });
    ipcRenderer.on("eye", (event, data) => {
      this.props.changeField(data.email, "actions-1", data.value);
    });
    ipcRenderer.on("captcha-result", (event, data) => {
      this.props.changeField(data.email, "oneclick", data.oneclick);
    });

    ipcRenderer.on("saveAccounts", () => {
      const { accounts, proxies } = this.props;

      accounts.map((item) => {
        const updatedItem = { ...item };
        if (updatedItem.oneclick === 1) {
          updatedItem.oneclick = 0;
        }
        return updatedItem;
      });
      fs.writeFileSync(accPath, JSON.stringify(accounts), err => {
        if (err) {
          Sentry.captureException(err);
          alert(`An error ocurred creating the file: ${err.message}`);
        }
      });
      fs.writeFileSync(prxPath, JSON.stringify(proxies), err => {
        if (err) {
          Sentry.captureException(err);
          alert(`An error ocurred creating the file: ${err.message}`);
        }
      });
    });

    fs.readFile(accPath, "utf-8", (err, data) => {
      if (err) {
        Sentry.captureException(err);
        console.error(`An error ocurred reading the file: ${err.message}`);
      } else {
        this.props.addAccounts(JSON.parse(data));
      }
    });

    fs.readFile(prxPath, "utf-8", (err, data) => {
      if (err) {
        Sentry.captureException(err);
        console.error(`An error ocurred reading the file: ${err.message}`);
      } else {
        this.props.addProxies(JSON.parse(data));
      }
    });
  }

  render() {
    const { history, isConnected } = this.props;
    return (
      <ConnectedRouter history={history}>
        <Routes socket={this.props.socket} isConnected={isConnected} />
      </ConnectedRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
    accounts: state.accounts.accountList,
    proxies: state.proxies.proxyList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeField: (email, field, value) => {
      dispatch({
        type: ACCOUNT.CHANGEFIELD,
        email,
        field,
        value
      });
    },
    changeOneClick: (email, value) => {
      dispatch({
        type: ACCOUNT.CHANGEONECLICK,
        email,
        value
      });
    },
    addAccounts: accounts => {
      dispatch({
        type: ACCOUNT.CHECKVALID_END,
        newAccounts: accounts
      });
    },
    addProxies: proxies => {
      dispatch({
        type: PROXY.CHECKVALID_END,
        newProxies: proxies,
        adding: true
      });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Root);
