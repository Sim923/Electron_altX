import React from "react";
import { Table, Popconfirm, Icon } from "antd";
import "antd/dist/antd.css";
import styles from "./Account.scss";
import Empty from "../../resources/icons/empty.svg";

class BillingTable extends React.Component {
  columns = [
    {
      title: "Profile Name",
      dataIndex: "ProfileName",
      key: "ProfileName",
      align: "left",
      width: 130
    },
    {
      title: "Full Name",
      dataIndex: "FirstNameBilling",
      key: "FirstNameBilling",
      width: 150,
      render: (firstName, record) => `${firstName} ${record.LastNameBilling}`
    },
    {
      title: "Card Info",
      dataIndex: "CardNumber",
      key: "CardNumber",
      width: 200,
      render: (card_number, record) => (
        <div>
          {record.CardType ? `${record.CardType} - ${card_number.substring(0, 4)}` : card_number.substring(0,4)}
          {record.CardExpirationMonth && record.CardExpirationYear ? ` - ${record.CardExpirationMonth}/${record.CardExpirationYear}` : null}
        </div>
      ),
    },
    {
      title: "Billing Address",
      dataIndex: "address1Billing",
      key: "address1Billing",
      render: (billing_address, record) => {
        let addr = billing_address;
        if (record.address2Billing) {
          addr += `, ${record.address2Billing}`;
          if (record.address3Billing) {
            addr += `, ${record.address3Billing}`;
          }
        }
        return addr;
      },
      width: "35%"
    },
    {
      title: "Email",
      dataIndex: "BillingEmail",
      key: "BillingEmail",
    },
    {
      title: "Actions",
      width: 100,
      dataIndex: "edit",
      key: "edit",
      align: "right",
      render: (value, record) => (
        <div>
          <a onClick={() => this.props.editRow(record.BillingEmail)}>
            <Icon type="edit" className={styles.editicon} />
          </a>
          {
            <Popconfirm
              overlayClassName={`${this.props.theme}_layout_popover`}
              title="Sure to delete?"
              onConfirm={() => this.props.deleteRow(record.BillingEmail)}
            >
              <a>
                <Icon type="delete" className={styles.deleteicon} />
              </a>
            </Popconfirm>
          }
        </div>
      )
    }
  ];

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  edit(key) {
    this.props.setEditingKey(key);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight - 20 });
  }

  render() {
    const locale = {
      emptyText: (
        <div className="emptyTable">
          <Empty />
          <p>No Data</p>
        </div>
      )
    };

    return (
      <div>
        <Table
          locale={locale}
          dataSource={this.props.data}
          columns={this.columns}
          pagination={false}
          className="billingTable"
          scroll={{ y: this.state.height - 330 }}
          rowKey="BillingEmail"
        />
      </div>
    );
  }
}

export default BillingTable;
