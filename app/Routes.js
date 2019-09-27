/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable camelcase */
import React, { useState, useEffect, } from "react";
import { withRouter } from "react-router-dom";
import { Switch, Route } from "react-router";
import { Layout, Menu, Icon } from "antd";
import { connect } from "react-redux";
import moment from 'moment';
import { remote, ipcRenderer } from "electron";
import routes from "./constants/routes";
import App from "./containers/App";
import SettingsPage from "./containers/SettingsPage";
import AccountPage from "./containers/AccountPage";
import GeneratePage from "./containers/GeneratePage";
import ProxyPage from "./containers/ProxyPage";
import BillingPage from "./containers/BillingPage";
import Twitter from "../resources/icons/twitter.svg";
import CloseCross from "../resources/icons/closeCross.svg";
import Minimize from "../resources/icons/minimize.svg";
import { basicURL } from "./utils";
import { SETTINGS } from "./reducers/types";
import styles from "./App.scss";
import packageJSON from '../package.json';

const { Header, Content, Footer } = Layout;

type Props = { history: Object };
const page_title = ["/", "/proxy", "/billing", "/setting", "/generate"];

const { app } = remote;
const isDev = process.env.NODE_ENV !== 'production';

let currentVersion = app.getVersion();
if (isDev) {
  currentVersion = packageJSON.version;;
}

const LocalTime = () => {
  const [time, setTime] = useState(moment().format('hh:mm:ss A'));

  useEffect(() => {
    const id = setTimeout(() => {
      setTime(moment().format('hh:mm:ss A'));
    }, 1000);

    return () => {
      clearTimeout(id);
    }
  });

  return (
    <p>{time}</p>
  );
};

class Routes extends React.Component<Props> {
  items = [
    {
      title: "Accounts",
      icon: "user"
    },
    {
      title: "Proxies",
      icon: "gold"
    },
    {
      title: "Billing",
      icon: "dollar"
    },
    {
      title: "Settings",
      icon: "setting"
    }
  ];

  constructor (props) {
    super(props);

    this.state = {
      collapsed: false,
      selectedIndex: 0
    };
  }

  componentDidMount() {
    this.props.setNavigation("side");
    setTimeout(() => this.props.setNavigation("noside"), 100);
  }

  closeWindow = () => {
    ipcRenderer.send("closeWindow");
  };

  miniWindow = () => {
    ipcRenderer.send("miniWindow");
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  // eslint-disable-next-line no-unused-vars
  onClickNavigation = ({ item, key, keyPath }) => {
    if (this.state.selectedIndex.toString() !== keyPath) {
      const { history } = this.props;
      this.setState({ selectedIndex: keyPath });
      console.log(page_title[keyPath]);
      history.push(page_title[keyPath]);
    }
  };

  render() {
    console.log(this.props.theme);
    return (
      <Layout className={`${this.props.theme}_layout`}>
        <Layout className={styles.layout}>
          <Header
            className={
              this.props.theme === "light" || this.props.navigation === "side"
                ? styles.header_light
                : styles.header
            }
          >
            {this.props.navigation === "noside" && (
              <div className={styles.headerlogo}>
                <div className={styles.headerMetaInfo}>
                  <div className={styles.headerLogoWrapper}>
                    <img style={{ height: "100px" }} src={`${basicURL}/logo.svg`} alt="" />
                  </div>
                  <div className={styles.headerMetaWrapper}>
                    <small>Status</small>
                    <p>
                      <span 
                        style={{
                          backgroundColor: this.props.isConnected ? '#0fdbbc' : '#f16988',
                        }}
                      >
                      </span>
                      {this.props.isConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                  <div className={styles.headerMetaWrapper}>
                    <small>Local Time</small>
                    <LocalTime />
                  </div>
                  <div className={styles.headerMetaWrapper}>
                    <small>Version</small>
                    <p>{`${currentVersion} ${this.props.app.latestVerison === currentVersion ? '(Up to date)' : ''}`}</p>
                  </div>
                </div>
              </div>
            )}
            {this.props.navigation === "side" && (
              <Icon
                className={styles.trigger}
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
                style={{ alignItems: "center", padding: 0 }}
              />
            )}
            {this.props.navigation === "noside" && (
              <Menu
                className={styles.antmenu}
                theme={this.props.theme}
                mode="horizontal"
                selectedKeys={[this.state.selectedIndex.toString()]}
                onClick={this.onClickNavigation}
                forceSubMenuRender={false}
              >
                {this.items.map((item, index) => (
                  <Menu.Item key={index}>
                    <span>{item.title}</span>
                  </Menu.Item>
                ))}
                <Menu.Item key={this.items.length} className="generate-menu-item">
                  <span>Generate</span>
                </Menu.Item>
              </Menu>
            )}
            <span className={styles.windowiconspan}>
              <div className={styles.windowCloseWrapper}>
                <Minimize
                  onClick={this.miniWindow}
                  className={styles.windowicon}
                />
                <CloseCross
                  onClick={this.closeWindow}
                  className={styles.windowicon}
                />
              </div>
            </span>
          </Header>
          <Content
            style={{
              margin: "15px 16px 24px 16px"
            }}
          >
            <App>
              <Switch>
                <Route
                  exact
                  path={routes.AccountPage}
                  component={AccountPage}
                />
                <Route path={routes.ProxyPage} component={ProxyPage} />
                <Route path={routes.BillingPage} component={BillingPage} />
                <Route path={routes.SettingPage} render={() => <SettingsPage socket={this.props.socket} />} />
                <Route path={routes.GeneratePage} component={GeneratePage} />
              </Switch>
            </App>
          </Content>
          <Footer className="altxFooter">
            <div className="footerCol">
              <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/altxaestell">
                <Twitter />
                <span>Twitter</span>
              </a>
            </div>
            <div className="footerCol footerCentered">
              <a target="_blank" rel="noopener noreferrer" href="https://aestell.com/info/terms/">
                Terms of Service
              </a>
              <span>&nbsp; - &nbsp;</span>
              <a target="_blank" rel="noopener noreferrer" href="https://aestell.com/info/privacy/">
                Privacy Policy
              </a>
            </div>
            <div className="footerCol">
              <span>
                &copy; aestell - All Rights Reserved
              </span>
            </div>
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    app: state.app,
    theme: state.settings.theme,
    navigation: state.settings.navigation
  };
}

function mapStateToDispatch(dispatch) {
  return {
    setNavigation: nav => {
      dispatch({ type: SETTINGS.SETNAVIGATION, nav });
    }
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    mapStateToDispatch
  )(Routes)
);
