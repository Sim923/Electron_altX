import React from "react";
import fs from "fs";
import { ipcRenderer, remote } from "electron";
import { Checkbox, Button, Select, Modal, Input, Spin } from "antd";
import * as Sentry from '@sentry/browser';
import EditableFormTable from "./AccountTable";
import styles from "./Account.scss";
import Import from "../../resources/icons/import.svg";
import Export from "../../resources/icons/export.svg";
import PlusSquare from "../../resources/icons/plus-square.svg";

const { Option } = Select;
const ButtonGroup = Button.Group;
const { TextArea } = Input;
const { dialog } = remote;

export default class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addingNow: false,
      newAccounts: [],
      isSelectAll: false,
    };
  }

  componentWillReceiveProps(props) {
    if (props.addedRows && !props.confirmLoading) {
      this.setState({ addingNow: false, newAccounts: "" });
      this.props.changeAddedRows();
    }
  }

  addRows = () => {
    const newaccs = this.state.newAccounts.split("\n");
    const newrows = [];
    newaccs.forEach(acc => {
      const sp_prx = acc.split(":");
      if (
        sp_prx[0] &&
        sp_prx[1] &&
        sp_prx[0]
          .toLowerCase()
          .match(
            // eslint-disable-next-line
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ) &&
        this.props.accounts.findIndex(item => item.email === sp_prx[0]) === -1
      ) {
        newrows.push({
          email: sp_prx[0],
          password: sp_prx[1],
          ipaddr: sp_prx[2],
          port: sp_prx[3],
          username: sp_prx[4],
          prx_password: sp_prx[5]
        });
      }
    });
    this.props.checkValidation(newrows, this.props.proxies);
  };

  addImportedAccounts = accounts => {
    this.props.checkValidation(JSON.parse(accounts), this.props.proxies);
  };

  setAddingNow = addingNow => {
    this.setState({ addingNow });
  };

  addRow = () => {
    this.setState({ addingNow: true });
  };

  importAccounts = () => {
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
          Sentry.captureException(err);
          alert(`An error ocurred reading the file: ${err.message}`);
          return;
        }

        this.addImportedAccounts(data);
      });
    });
  };

  ExportAccounts = () => {
    const options = {
      filters: [
        {
          name: "All",
          extensions: ["json", "csv"]
        }
      ]
    };
    const data = this.props.accounts.map(acc => {
      const { category, email, password, proxy } = acc;
      return { category, email, password, proxy };
    });
    dialog.showSaveDialog(options, filePath => {
      if (filePath === undefined) {
        console.error("You didn't save the file");
        return;
      }

      fs.writeFileSync(filePath, JSON.stringify(data), err => {
        if (err) {
          Sentry.captureException(err);
          alert(`An error ocurred creating the file: ${err.message}`);
        }
      });
    });
  };

  enableAll = () => {
    this.props.accounts.forEach(acc => {
      this.props.changeField(acc.key, "enabled", true);
    });
  };

  disableAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.actions[0]) this.props.changeField(acc.key, "enabled", false);
    });
  };

  startAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.enabled && acc.actions[0]) {
        this.props.changeField(acc.key, "actions-0", false);
        ipcRenderer.send("startTask", acc);
        acc.oneclick = 0;
        acc.actions[1] = true;
      }
    });
  };

  stopAll = () => {
    this.props.accounts.forEach(acc => {
      if (acc.enabled) {
        this.props.changeField(acc.key, "actions-0", true);
        ipcRenderer.send("stopTask", acc);
      }
    });
  };

  deleteAll = () => {
    this.props.deleteAll();
  };

  setCurrentCategory = value => {
    this.props.setCurrentCategory(value);
  };

  selectAll = () => {
    // this.props.setBillingtoShipping();
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory;
      }
      return true;
    })
    .forEach((acc) => {
      this.props.changeField(acc.key, "selected", !this.state.isSelectAll);
    });
    this.setState((prevState) => ({ isSelectAll: !prevState.isSelectAll }));
  }

  enable = () => {
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory && acc.selected === true;
      }
      return acc.selected === true;
    }).forEach((acc) => {
      this.props.changeField(acc.key, 'enabled', true);
    }); 
  }

  disable = () => {
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory && acc.selected === true;
      }
      return acc.selected === true;
    }).forEach((acc) => {
      this.props.changeField(acc.key, 'enabled', false);
    }); 
  }

  start = () => {
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory && acc.selected === true && acc.enabled === true;
      }
      return acc.selected === true && acc.enabled === true;
    }).forEach((acc) => {
      this.props.changeField(acc.key, "actions-0", false);
      ipcRenderer.send("startTask", { 
        ...acc,
        proxy: this.props.proxies.find((p) => `${p.ipaddr}:${p.port}` === acc.proxy),
      });
      acc.oneclick = 0;
      acc.actions[1] = true;
    }); 
  }

  stop = () => {
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory && acc.selected === true && acc.enabled === true;
      }
      return acc.selected === true && acc.enabled === true;
    }).forEach((acc) => {
      this.props.changeField(acc.key, "actions-0", true);
      ipcRenderer.send("stopTask", acc);
    }); 
  }

  delete = () => {
    this.props.accounts.filter((acc) => {
      if (this.props.currentCategory !== 'All') {
        return acc.category === this.props.currentCategory && acc.selected === true;
      }
      return acc.selected === true;
    }).forEach((acc) => {
      this.props.deleteRow(acc.key);
    }); 
  }

  render() {
    console.log("confirmloading", this.props.confirmLoading);
    return (
      <Spin
        spinning={this.props.confirmLoading && !this.state.addingNow}
        tip="Checking Proxy Validation ...."
      >
        <div className="pageHeadFlex">
          <div className="pageHeadRow">
            <div className="pageHeadSpace">
            </div>
            <div className="pageHeadTitle">
              <h1>Accounts</h1>
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
                  onClick={this.importAccounts}
                  className="darkButton"
                >
                  <Import />
                  Import
                </Button>
                <Button
                  onClick={this.ExportAccounts}
                  disabled={this.props.editingKey !== -1}
                  className="darkButton"
                >
                  <Export />
                  Export
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className={styles.controlbuttonarea}>
            <ButtonGroup>
              <div className="accountSelectGroup">
                <Checkbox
                  onChange={this.selectAll}
                  checked={this.state.isSelectAll}
                >
                </Checkbox>
                <Select
                  dropdownClassName={`${this.props.settings.theme}_layout_dropdown`}
                  defaultValue="All"
                  style={{ width: "77px" }}
                  disabled={this.props.editingKey !== -1}
                  onChange={this.setCurrentCategory}
                >
                  {this.props.categories.map((category, index) => (
                    <Option key={index} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </div>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.enable}
                className="darkButton"
              >
                Enable
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.disable}
                className="darkButton"
              >
                Disable
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.start}
                className="darkButton"
              >
                Start
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.stop}
                className="darkButton"
              >
                Stop
              </Button>
              <Button
                disabled={this.props.editingKey !== -1}
                onClick={this.delete}
                className="darkButton"
              >
                Delete
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div>
          <EditableFormTable
            data={
              this.props.currentCategory === "All"
                ? this.props.accounts
                : this.props.accounts.filter(
                    acc => acc.category === this.props.currentCategory
                  )
            }
            theme={this.props.settings.theme}
            changeField={this.props.changeField}
            changeRow={this.props.changeRow}
            deleteRow={this.props.deleteRow}
            editingKey={this.props.editingKey}
            setEditingKey={this.props.setEditingKey}
            addingNow={this.state.addingNow}
            setAddingNow={this.setAddingNow}
            proxies={this.props.proxies}
            startTask={this.props.startTask}
            stopTask={this.props.stopTask}
            selectAll={this.props.selectAll}
          />
        </div>
        <Modal
          className={`${this.props.settings.theme}_layout_modal`}
          maskStyle={{backgroundColor: this.props.settings.theme === "light" ? "rgba(162,167,185,.8)" : "rgba(7,10,25,.8)"}}
          title="Add New Accounts ..."
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
              {this.props.confirmLoading
                ? "Checking Proxy Validation ..."
                : "Save"}
            </Button>
          ]}
        >
          <TextArea
            onChange={e => this.setState({ newAccounts: e.target.value })}
            style={{ height: "300px" }}
            placeholder="Email:Password"
            value={this.state.newAccounts}
          />
        </Modal>
      </Spin>
    );
  }
}
