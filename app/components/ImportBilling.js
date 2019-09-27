import React from "react";
import fs from "fs";
import { ipcRenderer, remote } from "electron";
import { Modal, Button, Icon, Select, Row, Col } from "antd";
import { billingFileFormats, basicURL } from "../utils";

const { dialog } = remote;
const { Option } = Select;

class ImportBillingModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileType: null
    };
  }

  setFileType = name => {
    const index = billingFileFormats.findIndex(fmt => fmt.name === name);
    this.setState({ fileType: billingFileFormats[index].format });
  };

  importFile = () => {
    dialog.showOpenDialog(filePath => {
      if (filePath === undefined) {
        console.error("No file selected");
        return;
      }

      const index = filePath[0].lastIndexOf("/");
      const tPath = filePath[0].slice(0, index);
      const [ name ] = `__${filePath[0].slice(index + 1, filePath[0].length)}`.split('.');

      ipcRenderer.sendSync("convertProfile", {
        src_path: filePath[0],
        dst_path: `${tPath}/${name}`,
        src_format: this.state.fileType,
        dst_format: "defJSON"
      });

      setTimeout(
        () =>
          fs.readFile(`${tPath}/${name}.json`, "utf-8", (err, data) => {
            if (err) {
              alert(`An error ocurred reading the file: ${err.message}`);
              return;
            }
            this.props.addImportedAccounts(JSON.parse(data));
            fs.unlink(`${tPath}/${name}`, (unlinkErr) => {
              console.error(unlinkErr);
            });
          }),
        500
      );
    });
  };

  render() {
    const { fileType } = this.state;
    const { importVisible, onCancel } = this.props;
    return (
      <Modal
        title="Import File"
        className="EIBilling"
        wrapClassName={`${this.props.theme}_layout_modal`}
        maskStyle={{backgroundColor: this.props.theme === "light" ? "rgba(162,167,185,.8)" : "rgba(7,10,25,.8)"}}
        centered
        width={400}
        visible={importVisible}
        okText="Save"
        onCancel={onCancel}
        footer={[
          <Button type="primary" key="back" disabled={fileType === null} onClick={this.importFile}>
            Import
          </Button>
        ]}
      >
        <Row className="eiModalContentRow" type="flex">
          <Col span={7} className="eiModalSider">
            <img style={{ height: "100px" }} src={`${basicURL}/logo.svg`} alt="" />
          </Col>
          <Col span={17}>
            <div>
              <div className="fileTypeSelect">
                <Icon type="file" style={{ fontSize: "14px" }} />
                <Select
                  dropdownClassName={`${this.props.theme}_layout_dropdown`}
                  placeholder="SELECT FILE TYPE"
                  onChange={this.setFileType}
                  style={{
                    width: "345px"
                  }}
                >
                  {billingFileFormats.map((format, index) => (
                    <Option value={format.name} key={index}>
                      {format.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ImportBillingModal;
