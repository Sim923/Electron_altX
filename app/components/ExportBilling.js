import React from "react";
import { Modal, Button, Icon, Select, Row, Col, } from "antd";
import { remote } from "electron";
import { billingFileFormats, basicURL } from "../utils";

const { dialog } = remote;
const { Option } = Select;

class ExportBillingModal extends React.Component {
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

  exportFile = () => {
    dialog.showSaveDialog(filePath => {
      if (filePath === undefined) {
        console.log("You didn't save the file");
        return;
      }
      this.props.exportAccounts(filePath, this.state.fileType);
    });
  };

  render() {
    const { fileType } = this.state;
    const { exportVisible, onCancel } = this.props;
    return (
      <Modal
        title="Export File"
        className={`EIBilling ${this.props.theme}_layout_modal`}
        maskStyle={{backgroundColor: this.props.theme === "light" ? "rgba(162,167,185,.8)" : "rgba(7,10,25,.8)"}}
        centered
        width={400}
        visible={exportVisible}
        okText="Save"
        onSave={this.exportFile}
        onCancel={onCancel}
        footer={[
          <Button type="primary" disabled={fileType === null} key="back" onClick={this.exportFile}>
            Export
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
                    width: "345px",
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

export default ExportBillingModal;
