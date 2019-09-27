import React from "react";
import fs from "fs";
import { Button, Modal, Input, Spin, Typography, Icon, } from "antd";
import { ipcRenderer, remote } from "electron";
import EditableFormTable from "./ProxyTable";
import styles from "./Proxy.scss";
import Import from "../../resources/icons/import.svg";
import Export from "../../resources/icons/export.svg";
import PlusSquare from "../../resources/icons/plus-square.svg";

const ButtonGroup = Button.Group;
const { TextArea } = Input;

const { dialog } = remote;

const { Text } = Typography;

export default class Proxy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addingNow: false,
      newProxies: ""
    };
  }

  componentWillReceiveProps(props) {
    if (props.addedRows && !props.confirmLoading) {
      this.setState({ addingNow: false, newProxies: "" });
      this.props.changeAddedRows();
    }
  }

  setAddingNow = addingNow => {
    this.setState({ addingNow });
  };

  addRows = () => {
    const newprxs = this.state.newProxies.split("\n");
    const newrows = [];
    newprxs.forEach(prx => {
      const sp_prx = prx.split(":");
      if (
        sp_prx[0] &&
        sp_prx[1] &&
        sp_prx[0].match(/^([0-9]+).([0-9]+).([0-9]+).([0-9]+)$/) &&
        sp_prx[1].match(/^\d+$/)
      ) {
        newrows.push({
          ipaddr: sp_prx[0],
          port: sp_prx[1],
          username: sp_prx[2],
          password: sp_prx[3]
        });
      }
    });
    this.props.checkValidation(newrows, true);
  };

  addRow = () => {
    this.setState({ addingNow: true });
  };

  testAll = () => {
    this.props.proxies.forEach(prx => {
      this.props.changeField(prx.key, "validation-0", !prx.validation[0]);
    });
    this.props.checkValidation(this.props.proxies, false);
  };

  deleteAll = () => {
    this.props.deleteAll();
  };

  deleteBad = () => {
    this.props.deleteAll(true);
  };

  importProxies = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    dialog.showOpenDialog(options, filePath => {
      console.log(filePath);
      if (filePath === undefined) {
        console.error("No file selected");
        return;
      }

      fs.readFile(filePath[0], "utf-8", (err, data) => {
        if (err) {
          alert(`An error ocurred reading the file: ${err.message}`);
          return;
        }

        this.addImportedProxies(data);
      });
    });
  };

  addImportedProxies = proxies => {
    this.props.checkValidation(JSON.parse(proxies), true);
  };

  exportProxies = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    const data = this.props.proxies
      .filter(prx => prx.validation[1] === true)
      .map(prx => {
        const { ipaddr, port, username, password } = prx;
        return { ipaddr, port, username, password };
      });
    dialog.showSaveDialog(options, filePath => {
      if (filePath === undefined) {
        console.log("You didn't save the file");
        return;
      }

      fs.writeFileSync(filePath, JSON.stringify(data), err => {
        if (err) {
          alert(`An error ocurred creating the file: ${err.message}`);
        }
      });
    });
  };

  setTestUrl = e => {
    console.log("url", e.target.value);
    ipcRenderer.send("setTestUrl", { url: e.target.value });
  };

  render() {
    return (
      <Spin
        spinning={this.props.confirmLoading && !this.state.addingNow}
        tip="Checking Proxy Validation ...."
      >
        <div className="pageHeadFlex">
          <div className="pageHeadRow">
            <div className="pageHeadSpace"></div>
            <div className="pageHeadTitle">
              <h1>Proxies</h1>
            </div>
            <div>
              <ButtonGroup>
                <Button
                  className="blueButton"
                  onClick={this.addRow}
                  disabled={this.props.editingKey !== -1}
                >
                  <PlusSquare />
                  New
                </Button>
                <Button
                  disabled={this.props.editingKey !== -1}
                  onClick={this.importProxies}
                  className="darkButton"
                >
                  <Import />
                  Import
                </Button>
                <Button
                  disabled={this.props.editingKey !== -1}
                  onClick={this.exportProxies}
                  className="darkButton"
                >
                  <Export />
                  Export Tested
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className={`${styles.controlbuttonarea} controlButtonArea`}>
            <Text style={{color: "white"}}>Test URL:</Text>
            <Input
              defaultValue="https://kith.com"
              style={{ 
                width: "250px", 
                marginLeft: "20px", 
                marginRight: "15px",
                backgroundColor: '#2dbaec',
                color: '#fff',
                fontWeight: 600,
              }}
              onChange={this.setTestUrl}
            />
            <Icon type="edit" style={{ color: '#fff', position: 'relative', left: '-40px' }} />
            <ButtonGroup className={styles.actionbuttons}>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.testAll}
                className="darkButton"
              >
                Test All
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.deleteAll}
                className="darkButton"
              >
                Delete All
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.deleteBad}
                className="darkButton"
              >
                Delete Bad
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div style={{ height: "100%" }}>
          <EditableFormTable
            data={this.props.proxies}
            theme={this.props.settings.theme}
            changeField={this.props.changeField}
            changeRow={this.props.changeRow}
            deleteRow={this.props.deleteRow}
            editingKey={this.props.editingKey}
            setEditingKey={this.props.setEditingKey}
            checkValidation={this.props.checkValidation}
          />
        </div>
        <Modal
          maskStyle={{backgroundColor: this.props.settings.theme === "light" ? "rgba(162,167,185,.8)" : "rgba(7,10,25,.8)"}}
          className={`${this.props.settings.theme}_layout_modal`}
          title="Add new proxies ..."
          visible={this.state.addingNow}
          onOk={this.addRows}
          onCancel={() => this.setAddingNow(false)}
          confirmLoading={this.props.confirmLoading}
          maskClosable={false}
          footer={[
            <Button
              key="back"
              onClick={() => {
                this.setAddingNow(false);
                this.props.cancelCheck();
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={this.props.confirmLoading}
              onClick={this.addRows}
            >
              {this.props.confirmLoading ? "Checking Validation ..." : "Save"}
            </Button>
          ]}
        >
          <TextArea
            onChange={e => this.setState({ newProxies: e.target.value })}
            style={{ height: "300px" }}
            placeholder="IP:Port(:Username:Password)"
            value={this.state.newProxies}
          />
        </Modal>
      </Spin>
    );
  }
}
