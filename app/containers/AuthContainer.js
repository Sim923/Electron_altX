import React from "react";
import Websocket from "ws";
import { connect } from 'react-redux';
import { remote, ipcRenderer } from "electron";
import { Input, Icon, Col, Row, Typography, notification } from "antd";
import macaddress from "macaddress";
import { Button } from "antd/lib/radio";
import styles from "./AuthContainer.scss";
import CheckCircle from "../../resources/icons/check-circle.svg";
import CloseCross from "../../resources/icons/closeCross.svg";
import RemindIcon from "../../resources/icons/remindIcon.svg";
import UpdateIcon from "../../resources/icons/updateArrow.svg";
import { socketUrl, basicURL } from "../utils";
import packageJSON from '../../package.json';
import { 
  setLatestVersion, 
  setMacAddress,
  setAuthenticated,
} from '../reduxActions/app';

const { app } = remote;
const { Text } = Typography;
const isProd = process.env.NODE_ENV === 'production';

let currentVersion = app.getVersion();
if (!isProd) {
  currentVersion = packageJSON.version;
}

let keepAliveId;
let connectId;
let lastPongAt;
const pingTimeout = 60 * 60 * 1000;

class AuthContainer extends React.Component {
  apiKey = "";

  notif = true;

  isUserActive = false;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      isConnected: false,
    };
  }

  componentDidMount() {
    this.apiKey = ipcRenderer.sendSync("getApiKey");
    this.connect();
    window.onerror = (err) => {
      ipcRenderer.send('windowError', err);
    }
  }

  componentWillUnmount () {
    clearInterval(keepAliveId);
    clearTimeout(connectId);
  }

  connect = () => {
    this.socket = new Websocket(socketUrl);
    this.socket.onopen = () => {
      this.setState({ isConnected: true });
      lastPongAt = new Date;
      console.log("connected");
      if (this.isUserActive === false && this.apiKey && this.apiKey.length > 0) {
        console.log("apiKey", this.apiKey);
        this.notif = false;
        this.activateUser();
        this.isUserActive = true;
      }
      keepAliveId = setInterval(
        () => this.socket.send(JSON.stringify({ event: "keepAlive" })),
        9000
      );
    };
    this.socket.onclose = () => {
      this.setState({ isConnected: false });
      clearInterval(keepAliveId);
      keepAliveId = null;
      connectId = setTimeout(() => {
        this.socket = null;
        this.connect();
      }, 9000);
    };
    this.socket.onerror = (err) => {
      console.error(err);
    };
    this.socket.onmessage = evt => {
      const evtData = JSON.parse(evt.data);
      const { event, data } = evtData;
      console.log("new message", event, data);
      switch (event) {
        case "keyCheckResult": {
          console.log("checked key ....", data);
          if (data.code === 0) {
            ipcRenderer.send("activated", { apiKey: this.apiKey });
            this.props.setAuthenticated(true);
            this.setState({ loading: false });
            this.notOvertestNotification(); 
          } else {
            notification.open({
              placement: "bottomRight",
              duration: 3,
              message: "Error",
              description: data.message
            });
            this.setState({ loading: false });
          }
          break;
        }
        case "latestVersionResult": {
          const { version:latestVersion, link } = data;
          this.props.setLatestVersion(latestVersion);
          if (Object.keys(data).length > 0 && latestVersion !== currentVersion) {
            this.newVersionNotification(latestVersion, link);
          }
          break;
        }
        case "newVersion": {
          if (this.props.app.get('isAuthenticated') === false) return;
          const { version, link } = data;
          this.newVersionNotification(version, link);
          break;
        }
        case "keepAlive": {
          if (this.state.isConnected && Date.now() - lastPongAt > pingTimeout) {
            this.setState({ isConnected: false });
          } else if (this.state.isConnected === false && Date.now() - lastPongAt < pingTimeout) {
            this.setState({ isConnected: true });
          }
          lastPongAt = new Date;
          break;
        }
        case "keyReset": {
          if (data.message !== 'Request Data is not valid e.g. mac address is empty') {
            ipcRenderer.send('resetApiKey');
            this.props.setAuthenticated(false);
          }
          break;
        }
        default:
          console.error(`unrecognized answer recieved: ${event} ${data}`);
      }
    };

  }

  notOvertestNotification = () => {
    const key = 'doNotOverTest';
    notification.open({
      placement: 'bottomRight',
      message: '',
      duration: 0,
      key,
      className: `${this.props.theme} _notificationWrapper notificationWrapper warningNotif`,
      description: 
      (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img width="25" src={`${basicURL}/alert-circle-orange-512.png`} alt="warn" />
          <div style={{ marginLeft: 10 }}>
            <div>Do not overtest your accounts!</div>
            <div>Please test only once every four (4) days!</div>
          </div>
          <div className="notificationActions">
            <div className="ant-btn darkButton" onClick={() => notification.close(key)}>Close</div>
          </div>
        </div>
      ),
    });
  }

  // eslint-disable-next-line
  newVersionNotification = (version, link) => {
    const key = `open${Date.now()}`;
    notification.open({
      placement: "bottomRight",
      message: "New version is available",
      duration: 0,
      key,
      className: `${this.props.theme}_notificationWrapper notificationWrapper`,
      description: (
        <div className="notificationActions">
          <div className="ant-btn blueButton">
            <UpdateIcon /> 
            Update
          </div>
          <div 
            className="ant-btn darkButton" 
            onClick={() => notification.close(key)}
          >
            <RemindIcon /> 
            Remind me Later
          </div>
        </div>
      )
    });
  };

  closeWindow = () => {
    ipcRenderer.send("closeWindow");
  };

  activateUser = () => {
    if (this.socket.readyState === 0) {
      notification.open({
        placement: "bottomRight",
        duration: 3,
        message: "Error",
        description: "Network Error"
      });
      this.setState({ loading: false });
      return;
    }

    this.setState({ loading: true });
    macaddress.one((err, mac) => {
      this.props.setMacAddress(mac);
      console.log("keycheck", {
        event: "keyCheck",
        data: { macAddress: mac, key: this.apiKey }
      });
      this.socket.send(
        JSON.stringify({
          event: "keyCheck",
          data: { macAddress: mac, key: this.apiKey }
        })
      );
    });
  };

  setApiKey = e => {
    this.apiKey = e.target.value;
  };

  render() {
    const { loading } = this.state;
    const prop = { socket: this.socket, isConnected: this.state.isConnected };
    return this.props.app.get('isAuthenticated') ? (
      React.Children.map(this.props.children, child =>
        React.cloneElement(child, { ...prop })
      )
    ) : (
      <div className={`${styles.authcontainer} ${this.props.theme}_authContainer`}>
        <Row type="flex" className={styles.header}>
          <Col span={7}>
          </Col>
          <Col span={13}>
            <Text
              style={{
                color: "white",
                fontSize: "14px"
              }}
            >
              Authenticate Your License
            </Text>
          </Col>
          <Col span={4}>
            <div className={styles.windowCloseWrapper}>
              <CloseCross
                onClick={this.closeWindow}
                className={styles.windowicon}
              />
            </div>
          </Col>
        </Row>
        <Row className={styles.sider_row} type="flex">
          <Col span={7} className={styles.sider}>
            <img style={{ height: "100px" }} src={`${basicURL}/logo.svg`} alt="" />
          </Col>
          <Col span={17}>
            <div className="body">
              <Input
                defaultValue={this.apiKey}
                placeholder="Enter your key"
                onChange={this.setApiKey}
              />
            </div>
            <div className={styles.footer}>
              <Button
                style={{
                  alignSelf: "center",
                  background: !loading ? "#2DBAEC" : "#F16988",
                  border: "none",
                  color: "white"
                }}
                onClick={() => {
                  this.notif = true;
                  this.activateUser();
                }}
              >
                {loading ? (
                  <div>
                    <Icon type="loading" style={{ marginRight: "15px" }} />
                    <Text strong style={{ color: "white" }}>
                      Verifying...
                    </Text>
                  </div>
                ) : (
                  <div className={styles.activateButton}>
                    <CheckCircle />
                    <Text style={{ color: "white", fontSize: "12px"}}>
                      Activate
                    </Text>
                  </div>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
});

const mapDispatchToProps = (dispatch) => ({
  setLatestVersion (version) {
    return dispatch(setLatestVersion(version));
  },
  setMacAddress (macAddress) {
    return dispatch(setMacAddress(macAddress));
  },
  setAuthenticated (isAuthenticated) {
    return dispatch(setAuthenticated(isAuthenticated));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthContainer);
