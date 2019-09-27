import React from "react";
import fs from "fs";
import { Button, Input, } from "antd";
import { ipcRenderer } from "electron";
import BillingTable from "./BillingTable";
import styles from "./Billing.scss";
import BillingModal from "./BillingModal";
import ImportBillingModal from "./ImportBilling";
import ExportBillingModal from "./ExportBilling";
import Import from "../../resources/icons/import.svg";
import Export from "../../resources/icons/export.svg";
import PlusSquare from "../../resources/icons/plus-square.svg";

const { Search } = Input;
const ButtonGroup = Button.Group;

export default class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formVisible: false,
      editingRow: -1,
      importVisible: false,
      exportVisible: false
    };
  }

  importAccounts = () => {
    this.setState({ importVisible: true });
  };

  exportAccounts = () => {
    this.setState({ exportVisible: true });
  };

  cancelForm = () => {
    const { form } = this.formRef.props;
    form.resetFields();
    this.setFormVisible(false);
  };

  saveForm = () => {
    const { editingRow } = this.state;
    const { form } = this.formRef.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      console.log("Received values of form: ", values);
      if (editingRow === -1) {
        this.props.addAccount(values);
      } else {
        this.props.editAccount(editingRow, values);
      }
      form.resetFields();
      this.setFormVisible(false);
    });
  };

  addImportedAccounts = accounts => {
    accounts.forEach(acc => {console.log(acc);this.props.addAccount(acc)});
    this.setState({ importVisible: false });
  };

  addAccount = () => {
    this.setState({ formVisible: true, editingRow: -1 });
  };

  setFormVisible = visible => {
    this.setState({ formVisible: visible });
  };

  editAccount = email => {
    const { billingAccounts } = this.props;
    const index = billingAccounts.findIndex(acc => acc.BillingEmail === email);
    console.log(email, index);
    this.setState({ formVisible: true, editingRow: index });
  };

  cancelImportModal = () => {
    this.setState({ importVisible: false });
  };

  cancelExportModal = () => {
    this.setState({ exportVisible: false });
  };

  exportAccountsByFileType = (filePath, format) => {
    const index = filePath.lastIndexOf("/");
    const tPath = filePath.slice(0, index);
    let name = filePath.slice(index + 1, filePath.length);
    name = `__${name}`;
    console.log(format, this.props.billingAccounts);
    fs.writeFileSync(
      `${tPath}/${name}`,
      JSON.stringify(this.props.billingAccounts),
      err => {
        if (err) {
          alert(`An error ocurred creating the file: ${err.message}`);
        }
      }
    );

    try {
      ipcRenderer.sendSync("convertProfile", {
        src_path: `${tPath}/${name}`,
        dst_path: filePath,
        src_format: "defJSON",
        dst_format: format
      });
      fs.unlink(`${tPath}/${name}`, () => {});
    } catch (e) {
      console.log("eror", e);
    }
    this.setState({ exportVisible: false });
  };

  render() {
    const {
      formVisible,
      editingRow,
      importVisible,
      exportVisible
    } = this.state;
    const { billingAccounts, deleteAccount } = this.props;
    return (
      <div>
        <div className="pageHeadFlex">
          <div className="pageHeadRow">
            <div className="pageHeadSpace">
            </div>
            <div className="pageHeadTitle">
              <h1>Billing</h1>
            </div>
            <div>
              <ButtonGroup>
                <Button className="blueButton" onClick={() => this.addAccount()}>
                  <PlusSquare />
                  New
                </Button>
                <Button onClick={this.importAccounts} className="darkButton">
                  <Import />
                  Import
                </Button>
                <Button
                  onClick={this.exportAccounts}
                  className="darkButton"
                >
                  <Export />
                  Export
                </Button>
              </ButtonGroup>
            </div>
          </div>
          <div className={`${styles.controlbuttonarea} controlButtonArea`}>
            <Search style={{ width: 250 }} placeholder="Search ..." />
            <Button className="darkButton">
              Search
            </Button>
            <ButtonGroup className={styles.actionbuttons}>
              <Button
                disabled={false}
                onClick={this.props.deleteAll}
                className="darkButton"
              >
                Delete All
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div>
          <BillingTable
            theme={this.props.settings.theme}
            data={billingAccounts}
            deleteRow={deleteAccount}
            editRow={this.editAccount}
          />
        </div>
        <BillingModal
          wrappedComponentRef={(ref) => {
            this.formRef = ref;
          }}
          formVisible={formVisible}
          onCancel={this.cancelForm}
          onSave={this.saveForm}
          theme={this.props.settings.theme}
          data={editingRow >= 0 ? billingAccounts[editingRow] : null}
        />
        <ImportBillingModal
          importVisible={importVisible}
          addImportedAccounts={this.addImportedAccounts}
          theme={this.props.settings.theme}
          onCancel={this.cancelImportModal}
        />
        <ExportBillingModal
          exportVisible={exportVisible}
          onCancel={this.cancelExportModal}
          exportAccounts={this.exportAccountsByFileType}
          theme={this.props.settings.theme}
        />
      </div>
    );
  }
}
