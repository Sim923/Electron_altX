import React from "react";
import { Table, Input, Popconfirm, Form, Icon, Spin } from "antd";
import "antd/dist/antd.css";
import styles from "./Proxy.scss";
import Empty from "../../resources/icons/empty.svg";

const EditableContext = React.createContext();
const InputPassword = Input.Password;

class EditableCell extends React.Component {
  getInput = () => {
    switch (this.props.dataIndex) {
      case "password":
        return <InputPassword style={{ width: "100%" }} />;
      case "port":
        return <Input style={{ width: 150 }} />;
      case "ipaddr":
        return <Input style={{ width: "100%" }} />;
      default:
        return <Input style={{ width: "100%" }} />;
    }
  };

  renderCell = form => {
    const { getFieldDecorator } = form;
    const {
      editing,
      dataIndex,
      title,
      record,
      index,
      children,
      ...restProps
    } = this.props;
 
    const setRules = (dIndex) => {
      if (dIndex === 'ipaddr') {
        return {
          required: true,
          pattern: /^([0-9]+).([0-9]+).([0-9]+).([0-9]+)$/,
          message: `Please Input ${title}!`
        };
      }
      if (dIndex === 'port') {
        return {
          required: true,
          pattern: /^\d+$/,
          message: `Please Input ${title}!`
        };
      }
      return {};
    }

    return (
      <td {...restProps} key={index}>
        {editing ? (
          <Form.Item style={{ margin: 0, padding: "0px 10px 0px 0px" }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                setRules(dataIndex),
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class EditableTable extends React.Component {
  columns = [
    {
      title: "IP Address",
      dataIndex: "ipaddr",
      align: "left",
      key: "ipaddr",
      width: "15%",
      editable: true
    },
    {
      title: "Port Number",
      dataIndex: "port",
      width: "15%",
      key: "port",
      editable: true
    },
    {
      title: "Username",
      dataIndex: "username",
      width: "20%",
      key: "username",
      editable: true
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      align: "left",
      width: "15%",
      editable: true,
      render: (text, record) =>
        record.username ? (
          <InputPassword disabled style={{ width: "100px" }} value={text} />
        ) : null
    },
    {
      title: "Status",
      dataIndex: "validation",
      key: "validation",
      align: "center",
      width: "15%",
      render: (actions, record) => (
        <div>
          <a
            disabled={this.props.editingKey === record.key}
            onClick={() => {
              this.props.changeField(record.key, "validation-0", !actions[0]);
              this.props.checkValidation([record], false);
            }}
          >
            {actions[0] ? (
              <Icon type="play-circle" className={styles.play} />
            ) : (
              <Icon type="pause-circle" className={styles.play} />
            )}
          </a>
          <span style={{ marginLeft: "10px" }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {!actions[0] ? (
              <Spin />
            ) : actions[1] ? (
              <Icon
                type="check-circle"
                style={{ color: "#2DBAEC", fontSize: "16px" }}
              />
            ) : (
              <Icon
                type="close-circle"
                style={{ color: "#F16988", fontSize: "16px" }}
              />
            )}
          </span>
        </div>
      )
    },
    {
      title: "Speed",
      dataIndex: "speed",
      width: "10%",
      key: "speed",
      align: "center",
      sorter (a, b) {
        return b.speed - a.speed;
      },
      defaultSortOrder: 'descend',
      render(speed) {
        if (speed !== "bad") {
          return (
            <span>{speed}MS</span>
          );
        }
        return (
          <span></span>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "edit",
      align: "center",
      key: "edit",
      render: (value, record) => (
        <div>
          {this.isEditing(record) ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    // TODO fix this eval
                    // eslint-disable-next-line
                    href="javascript:;"
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    <Icon type="save" className={styles.saveicon} />
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                overlayClassName={`${this.props.theme}_layout_popover`}
                title="Sure to cancel?"
                onConfirm={() => this.cancel(record.key)}
              >
                <a>
                  <Icon type="close" className={styles.closeicon} />
                </a>
              </Popconfirm>
            </span>
          ) : (
            <a
              disabled={this.props.editingKey !== -1 || !record.validation[0]}
              onClick={() => this.edit(record.key)}
            >
              <Icon type="edit" className={styles.editicon} />
            </a>
          )}
          {
            <Popconfirm
              overlayClassName={`${this.props.theme}_layout_popover`}
              title="Sure to delete?"
              onConfirm={() => this.props.deleteRow(record.key)}
            >
              <a
                disabled={
                  (this.props.editingKey !== -1 &&
                    record.key !== this.props.editingKey) ||
                  !record.validation[0]
                }
              >
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

  isEditing = record => record.key === this.props.editingKey;

  cancel = () => {
    this.props.setEditingKey(-1);
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.setEditingKey(-1);
      this.props.changeRow(key, row);
    });
  }

  edit(key) {
    this.props.setEditingKey(key);
  }

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });
    const locale = {
      emptyText: (
        <div className="emptyTable">
          <Empty />
          <p>No Data</p>
        </div>
      )
    };
    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          className="proxy-table"
          locale={locale}
          components={components}
          dataSource={this.props.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          scroll={{ y: this.state.height - 330 }}
        />
      </EditableContext.Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);
export default EditableFormTable;
