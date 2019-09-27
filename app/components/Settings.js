import React from "react";
import {
  // Row,
  // Col,
  Icon,
  // Tooltip,
  Switch,
  Button,
  Modal,
  notification
} from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import TextArea from "antd/lib/input/TextArea";
import { remote, ipcRenderer } from "electron";
import InputMinus from "../../resources/icons/inputMinus.svg";
import InputPlus from "../../resources/icons/inputPlus.svg";
import SleepDuration from "../../resources/icons/sleepDuration.svg";
import RunDuration from "../../resources/icons/runDuration.svg";
import MaxProfiles from "../../resources/icons/maxProfiles.svg";
import VersionInfo from "../../resources/icons/versionInfo.svg";
import LicenseKey from "../../resources/icons/licenseKey.svg";
import VersionCheck from "../../resources/icons/versionCheck.svg";
import GoogleSearch from "../../resources/icons/googleSearch.svg";
import SelectedTheme from "../../resources/icons/selectedTheme.svg";
import Youtube from "../../resources/icons/youtube.svg";
import ThemeIcon from "../../resources/icons/theme.svg";
import packageJSON from '../../package.json';
import styles from "./Settings.scss";

const { app } = remote;
const isProd = process.env === 'production';

let currentVersion = app.getVersion();
if (!isProd) {
  currentVersion = packageJSON.version;
}

class DurationArea extends React.Component {
  render() {
    return (
      <div className={styles.duration}>
        <div className={styles.labelWrapper}>
          {this.props.type === "run" ? (<RunDuration className="settingsIconBlue" />) : (<SleepDuration className="settingsIconRed" />)}
          <p className={styles.runlabel}>
            {`${this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1)} Duration Min/Max`}
          </p>
        </div>
        <span className="settingsActionsWrapper settingsActionsRight">
          <div className="settingsInputWrapper">
            <div className="settingsInputArrow">
              <InputMinus 
                onClick={() => {
                  if(this.props.min > 0) { 
                    this.props.change(this.props.type, "min", this.props.min - 1) 
                  }
                }}
              />
            </div>
            <div className="settingsInput">
              <input 
                type="number" 
                value={this.props.min} 
                onChange={(v) => {
                  this.props.change(this.props.type, "min", v.target.value);
                }} 
                min={0} 
                max={this.props.max}
              />
            </div>
            <div className="settingsInputArrow">
              <InputPlus 
                onClick={() => {
                  if(this.props.min < this.props.max) { 
                    this.props.change(this.props.type, "min", this.props.min + 1);
                  }
                }}
              />
            </div>
          </div>
          <h4 style={{ color: "#96A2C9", fontWeight: "700" }}> - </h4>
          <div className="settingsInputWrapper">
            <div className="settingsInputArrow">
              <InputMinus 
                onClick={() => {
                  if(this.props.max !== this.props.min) { 
                    this.props.change(this.props.type, "max", this.props.max - 1);
                  }
                }}
              />
            </div>
            <div className="settingsInput">
              <input 
                type="number" 
                value={this.props.max} 
                onChange={(v) => {
                  this.props.change(this.props.type, "max", v.target.value);
                }} 
                min={this.props.min}
              />
            </div>
            <div className="settingsInputArrow">
              <InputPlus 
                onClick={() => {
                  this.props.change(this.props.type, "max", this.props.max + 1);
                }}
              />
            </div>
          </div>
          <h4 style={{ color: "#96A2C9" }}>mins</h4>
        </span>
      </div>
    );
  }
}

/* class CustomCheckBox extends React.Component {
  static defaultProps = {
    checked: false
  };
  setCheck = () => {
    if (this.props.theme) {
      if (this.props.theme == "dark") this.props.setCheck("theme", "dark");
      else this.props.setCheck("theme", "light");
    } else {
      if (this.props.navigation == "side")
        this.props.setCheck("navigation", "side");
      else this.props.setCheck("navigation", "noside");
    }
  };
  render() {
    return (
      <Tooltip
        placement="topLeft"
        title={
          this.props.theme
            ? `${this.props.theme.charAt(0).toUpperCase() +
                this.props.theme.slice(1)} Mode`
            : this.props.navigation == "side"
            ? "Side Menu Layout"
            : "Top Menu Layout"
        }
      >
        <Row
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid grey",
            cursor: "pointer"
          }}
          onClick={this.setCheck}
        >
          {this.props.navigation != "noside" ? (
            <Col
              span={6}
              style={{
                backgroundColor: "black",
                height: "100%"
              }}
            />
          ) : null}
          <Col
            span={this.props.navigation == "noside" ? 24 : 18}
            style={{ height: "100%" }}
          >
            <div
              style={{
                width: "100%",
                height: "20%",
                background: "black"
              }}
            />
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                height: "80%"
              }}
            >
              {this.props.checked ? (
                <Icon
                  type="check"
                  style={{
                    margin:
                      this.props.navigation == "noside" ? "8px 14px" : "8px"
                  }}
                />
              ) : null}
            </div>
          </Col>
        </Row>
      </Tooltip>
    );
  }
} */

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: {
        run: {
          min: 0,
          max: 0
        },
        sleep: {
          min: 0,
          max: 0
        }
      },
      maxProfile: 0,
      gsearch: true,
      youtube: true,
      bTargetDlg: false
    };
  }

  componentDidMount() {
    this.loadFrom();
    this.apiKey = ipcRenderer.sendSync("getApiKey");
  }

  showTargetDlg = show => {
    this.newTarget = this.props.targets;
    this.setState({ bTargetDlg: show });
  };

  loadFrom = () => {
    // console.log("loadfrom ...");
    const duration = {
      run: {
        min: this.props.duration.run.min,
        max: this.props.duration.run.max
      },
      sleep: {
        min: this.props.duration.sleep.min,
        max: this.props.duration.sleep.max
      }
    };
    this.setState({
      duration,
      maxProfile: this.props.maxProfile,
      gsearch: this.props.gsearch,
      youtube: this.props.youtube
    });
  };

  saveTo = () => {
    const { duration, maxProfile, gsearch, youtube } = this.state;
    if (duration.run.min > duration.run.max) {
      notification.error({
        placement: "bottomRight",
        duration: 3,
        message: "Error",
        description: "Input the profile running duration correctly"
      });
      return;
    }
    if (duration.sleep.min > duration.sleep.max) {
      notification.error({
        placement: "bottomRight",
        duration: 3,
        message: "Error",
        description: "Input the profile sleep duration correctly"
      });
      return;
    }
    this.props.changeAll(duration, maxProfile, gsearch, youtube);
    ipcRenderer.send("changeSetting", {
      duration,
      maxProfile,
      gsearch,
      youtube
    });
    notification.success({
      placement: "bottomRight",
      duration: 3,
      message: "Success",
      description: "Setting changed successfully"
    });
  };

  setCheck = (which, mode) => {
    if (which === "theme") {
      this.props.setTheme(mode);
    } else {
      this.props.setNavigation(mode);
    }
  };

  changeDuration = (type, which, value) => {
    const { duration } = this.state;
    duration[type][which] = value;
    console.log("dur", duration);
    this.setState({ duration });
  };

  setMaxProfile = value => {
    this.setState({ maxProfile: value.target.value });
  };

  setTarget = (type, value) => {
    if (type === "gsearch") {
      this.setState({ gsearch: value });
    } else {
      this.setState({ youtube: value });
    }
  };

  changeTarget = () => {
    this.props.setTargets(this.newTarget);
    this.setState({ bTargetDlg: false });
  };

  resetLicense = () => {
    this.props.socket.send(JSON.stringify({
      event: 'keyReset',
      data: {
        key: this.apiKey,
        macAddress: this.props.app.get('macAddress'),
      }
    }));
  }

  render() {
    return (
      <div>
        <div className="pageHeadFlex">
          <div className="pageHeadRow">
            <div className="pageHeadSpace">
            </div>
            <div className="pageHeadTitle">
              <h1>Settings</h1>
            </div>
          </div>
        </div>
        <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
          <h4 style={{marginTop: "10px"}}>Style Settings:</h4>
          <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
            <div className={styles.settingsColumn}>
              <div className={styles.settingsRowCentered}>
                <ThemeIcon className="settingsIconGreen" />
                <h3>Theme</h3>
              </div>
            </div>
            <div className={styles.settingsRowRight}>
              <span className={this.props.theme === "light" ? "lightThemeSelector selectedThemeSelector" : "lightThemeSelector"} onClick={() => this.props.setTheme("light")}><SelectedTheme /></span>
              <span className={this.props.theme === "dark" ? "darkThemeSelector selectedThemeSelector" : "darkThemeSelector"} onClick={() => this.props.setTheme("dark")}><SelectedTheme /></span>
            </div>
          </div>
        </div>
        <div className={styles.settingsRow}>
          <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
            <h4>Application Information:</h4>
            <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
              <div className={styles.settingsColumn}>
                <div className={styles.settingsRowCentered}>
                  <VersionInfo className="settingsIconPurple" />
                  <h3>{`Version ${currentVersion}`}</h3>
                </div>
              </div>
              <div className={styles.settingsRowRight}>
                {this.props.app.get('latestVersion') === currentVersion ? 
                  (
                    <p>
                      <VersionCheck />
                      {this.props.app.get('latestVersion')}
                    </p>
                  ) : 
                    <p></p>}
                <Button className="darkButton">
                  Check for updates
                </Button>
              </div>
            </div>
          </div>
          <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
            <h4>License Information:</h4>
            <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
              <div className={styles.settingsColumn}>
                <div className={styles.settingsRowCentered}>
                  <LicenseKey className="settingsIconPurple" />
                  <h3>{this.apiKey ? this.apiKey : "Loading..."}</h3>
                </div>
              </div>
              <div className={styles.settingsRowRight}>
                <Button onClick={this.resetLicense} className="darkButton">
                  Reset License
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.settingsColumn} settingsColumnWrapper`} style={{paddingLeft: "0px"}}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsColumn}>
              <h4>Task Settings:</h4>
              <h5>Duration</h5>
            </div>
            <div className={styles.settingsColumn}>
              <h5>Targets</h5>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
              <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
                <DurationArea
                  type="run"
                  min={this.state.duration.run.min}
                  max={this.state.duration.run.max}
                  change={this.changeDuration}
                />
              </div>
            </div>
            <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
              <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
                <div className={styles.settingsColumn}>
                  <div className={styles.settingsRowCentered}>
                    <GoogleSearch className="settingsIconBlue" />
                    <p className={styles.label}>Google Search</p>
                  </div>
                </div>
                <div>
                  <Switch
                    checked={this.state.gsearch}
                    onChange={checked => this.setTarget("gsearch", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
              <div className={styles.settingsLightRow}>
                <DurationArea
                  type="sleep"
                  min={this.state.duration.sleep.min}
                  max={this.state.duration.sleep.max}
                  change={this.changeDuration}
                />
              </div>
            </div>
            <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
              <div className={styles.settingsLightRow}>
                <div className={styles.settingsColumn}>
                  <div className={styles.settingsRowCentered}>
                    <Youtube className="settingsIconRed" />
                    <p className={styles.label}>Youtube</p>
                  </div>
                </div>
                <div>
                  <Switch
                    checked={this.state.youtube}
                    onChange={checked => this.setTarget("youtube", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={`${styles.settingsColumn} settingsColumnWrapper`}>
              <div className={`${styles.settingsDarkRow} settingsColloredRow`}>
                <div className={styles.duration}>
                  <div className={styles.labelWrapper}>
                    <MaxProfiles className="settingsIconOrange" />
                    <p className={styles.runlabel}>Max Running Profiles</p>
                  </div>
                  <div className="settingsActionsWrapper">
                    <div className="settingsInputWrapper">
                      <div className="settingsInputArrow">
                        <InputMinus 
                          onClick={() => {
                            if (this.state.maxProfile > 1) { 
                              this.setState((prevState) => ({ maxProfile: prevState.maxProfile - 1})); 
                            }
                          }}
                        />
                      </div>
                      <div className="settingsInput">
                        <input type="number" value={this.state.maxProfile} onChange={this.setMaxProfile} min={1} />
                      </div>
                      <div className="settingsInputArrow">
                        <InputPlus 
                          onClick={() => {
                            this.setState((prevState) => ({ maxProfile: prevState.maxProfile + 1 }));
                          }}
                        />
                      </div>
                    </div>
                    <h4 style={{ color: "#96A2C9" }}>Profile(s)</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.settingsColumn} style={{alignItems: "flex-end"}}>
              <ButtonGroup className={styles.settingsFooterRow}>
                <Button className="blueButton" onClick={this.saveTo}>
                  <Icon type="check" />
                  Apply
                </Button>
                <Button className="darkButton" onClick={this.loadFrom}>
                  <Icon type="close" />
                  Cancel
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <Modal
          title="Change your targets ..."
          visible={this.state.bTargetDlg}
          onOk={this.changeTarget}
          onCancel={() => this.showTargetDlg(false)}
          confirmLoading={this.props.confirmLoading}
          maskClosable={false}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.showTargetDlg(false);
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.changeTarget}>
              Apply
            </Button>
          ]}
        >
          <TextArea
            onChange={(e) => {
              this.newTarget = e.target.value;
            }}
            style={{ height: "350px" }}
            defaultValue={this.props.targets.join("\n")}
          />
        </Modal>
      </div>
    );
  }
}
