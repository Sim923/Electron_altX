import React from "react";
import { ipcRenderer } from "electron";
import { ScaleLoader } from "react-spinners";
import {
  Table,
  Input,
  Popconfirm,
  Form,
  Checkbox,
  Icon,
  Select,
  Spin
} from "antd";
import "antd/dist/antd.css";
import styles from "./Account.scss";
import Empty from "../../resources/icons/empty.svg";

const { Option } = Select;

class ProxySelect extends React.Component {
  render() {
    return (
      <Select
        dropdownClassName={`${this.props.theme}_layout_dropdown`}
        defaultValue={this.props.value}
        className={styles.combo}
        disabled={this.props.editingKey !== this.props.key}
        onChange={(value) => {
          this.props.form.setFieldsValue({
            proxy: value
          })
        }}
      >
        <Option value="None">None</Option>
        {this.props.proxies.map((proxy, index) => {
          let prx = `${proxy.ipaddr}:${proxy.port}`;
          if (proxy.username && proxy.username !== "") {
            prx = `${proxy.username}:${proxy.password}@${prx}`;
          }
          return (
            <Option key={index} value={prx}>
              {prx}
            </Option>
          );
        })}
      </Select>
    );
  }
}

const EditableContext = React.createContext();
const InputPassword = Input.Password;

class EditableCell extends React.Component {
  getInput = form => {
    switch (this.props.dataIndex) {
      case "category":
        return <Input style={{ width: "70px" }} />;
      case "password":
        return <InputPassword style={{ width: "100px" }} />;
      case "email":
        return <Input style={{ width: "165px" }} />;
      case "proxy":
        return (
          <ProxySelect
            theme={this.props.theme}
            key={this.props.record.key}
            value={this.props.record.proxy}
            form={form}
            proxies={this.props.proxies}
          />
        );
      default:
        return <Input style={{ width: "100px" }} />;
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
      if (['email', 'recovery'].includes(dIndex)) {
        return {
          required: dIndex === "email",
          type: "email",
          message: `Please Input Valid Email!`
        }
      }
      if (dIndex === 'proxy') {
        return {
          required: true,
          message: `Please Select ${title}`,
        };
      }
      return {
        required: true,
      };
    };
    return (
      <td {...restProps} key={index}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                setRules(dataIndex),
              ],
              initialValue: record[dataIndex]
            })(this.getInput(form))}
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
      title: "",
      dataIndex: "selected",
      key: "selected",
      align: "center",
      width: 40,
      render: (selected, record) => (
        <Checkbox
          disabled={this.props.editingKey > -1}
          // onClick={(event) => console.log('check', record.key, this.props.editingKey)}
          onChange={() => {
            this.props.changeField(record.key, 'selected', !selected)
          }}
          checked={selected}
        />
      )
    },
    {
      title: "Category",
      dataIndex: "category",
      width: "10%",
      key: "category",
      align: "left",
      editable: true
    },
    {
      title: "Email",
      width: "13%",
      dataIndex: "email",
      key: "email",
      editable: true
    },
    {
      title: "Password",
      width: "10%",
      dataIndex: "password",
      key: "password",
      editable: true,
      render: (text) => (
        <InputPassword
          disabled
          style={{ width: "100px", marginRight: "0px" }}
          className="tableInput"
          value={text}
        />
      )
    },
    {
      title: "Recovery",
      width: 175,
      dataIndex: "recovery",
      key: "recovery",
      editable: true,
      render: (text) => (
        <InputPassword
          disabled
          style={{ width: "100px", marginRight: "0px" }}
          className="tableInput"
          value={text}
        />
      )
    },
    {
      title: "Proxy",
      width: 240,
      dataIndex: "proxy",
      key: "proxy",
      align: "left",
      editable: true
    },
    {
      title: "Action Log",
      width: 75,
      dataIndex: "actionlog",
      key: "actionlog"
    },
    {
      title: "One-Click",
      dataIndex: "oneclick",
      width: 120,
      key: "oneclick",
      align: "center",
      render: (oneclick, record) => {
        const selectIconToShow = () => {
          if (oneclick === 1) {
            return (<Spin size="small" />); 
          }
          if (oneclick === 0) {
            return (<Icon type="experiment" style={{ color: '#266184' }} />);
          }
          return (<Icon type="check" style={{ color: '#266184' }} />);
        }
        return (
          <div>
            <a
              disabled={!record.enabled || !record.actions[0] || oneclick === 1} 
              onClick={() => {
                this.props.changeField(record.key, "oneclick", 1);
                ipcRenderer.send("startOneClick", { 
                  ...record,
                  proxy: this.props.proxies.find((p) => {
                    const proxyAddress = `${p.ipaddr}:${p.port}`;
                    return proxyAddress === record.proxy;
                  }),
                });
                // eslint-disable-next-line
                record.oneclick = 1;
                // eslint-disable-next-line
                record.actions[1] = true;
              }}
            >
              {selectIconToShow()}
            </a>
          </div>
        )
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "left",
      width: 180,
      render: (actions, record) => (
        <div className="tableActions">
          <a
            disabled={this.props.editingKey === record.key || !record.enabled || record.oneclick === 1} 
            onClick={() => {
              this.props.changeField(record.key, "actions-0", !actions[0]);
              if (!actions[0]) {
                ipcRenderer.send("startTask", { 
                  ...record,
                  proxy: this.props.proxies.find((p) => `${p.ipaddr}:${p.port}` === record.proxy),
                });
                // eslint-disable-next-line
                record.oneclick = 0;
                // eslint-disable-next-line
                record.actions[1] = true;
              } else {
                ipcRenderer.send("stopTask", record);
              }
            }}
          >
            {actions[0] ? (
              <Icon type="play-circle" className={styles.play} />
            ) : (
              <Icon type="pause-circle" className={styles.play} />
            )}
          </a>
          <a
            disabled={
              this.props.editingKey === record.key ||
              !record.enabled || (record.oneclick === 1) ||
              record.actions[0] ||
              record.actionlog === "Scheduling"
            }
            onClick={() => {
              this.props.changeField(record.key, "actions-1", !actions[1]);
              if (!actions[1]) {
                ipcRenderer.send("hideTask", record);
              } else {
                ipcRenderer.send("showTask", record);
              }
            }}
          >
            {actions[1] ? (
              <Icon type="eye" className={styles.eyeball} />
            ) : (
              <Icon type="eye-invisible" className={styles.eyeball} />
            )}
          </a>
          {this.isEditing(record) ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    href="#"
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 20 }}
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
                {this.props.addingNow ? null : (
                  <a>
                    <Icon type="close" className={styles.closeicon} />
                  </a>
                )}
              </Popconfirm>
            </span>
          ) : (
            <a
              disabled={this.props.editingKey !== -1 || !record.actions[0] || record.oneclick === 1}
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
              <a disabled={this.props.editingKey !== -1 || !record.actions[0] || record.oneclick === 1}>
                <Icon type="delete" className={styles.deleteicon} />
              </a>
            </Popconfirm>
          }
          <div className={styles.lastColAccounts}>
            {(record.actionlog === "Marinating" ||
              record.actionlog === "Logging in") && (
              <ScaleLoader color="#1890ff" height={18} width={3} />
            )}
          </div>
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "enabled",
      key: "enabled",
      align: "center",
      render: (enabled, record) => (
        <div style={{display: "flex", justifyContent: "center"}}>
          {
            this.props.editingKey !== record.key ? (
              <span className={enabled ? "statusCircle connected" : "statusCircle"}></span>
            ) : (
              <Checkbox
                disabled={this.props.editingKey !== record.key}
                onChange={() => {
                  this.props.changeField(record.key, "enabled", !enabled);
                }}
                checked={enabled}
              />
            )
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

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.setEditingKey(-1);
      this.props.setAddingNow(false);
      this.props.changeRow(key, row);
    });
  }

  edit(key) {
    this.props.setEditingKey(key);
  }

  updateWindowDimensions() {
    // const divisions = [12, 9, 7, 9, 6, 4, 11, 11, 11, 8, 12];
    // for (let i = 0; i < 11; i += 1) {
    //   this.columns[i].width = (window.innerWidth - 150) / divisions[i];
    // }
    this.setState({ width: window.innerWidth, height: window.innerHeight });
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
          proxies: this.props.proxies,
          theme: this.props.theme,
          editing: this.isEditing(record)
        })
      };
    });

    if (this.ref) console.log(this.ref.getBoundingClientRect());
    const locale = {
      emptyText: (
        <div className="emptyTable">
          <Empty />
          <p>No Data</p>
        </div>
      )
    };

    const updatedDataSource = this.props.data.map((item) => {
      const updatedItem = { ...item };
      if (updatedItem.proxy) {
        updatedItem.proxy = updatedItem.proxy.split('@').pop();
      }
      return updatedItem;
    });

    return (
      <div>
        <EditableContext.Provider
          value={this.props.form}
          style={{ fontSize: "8px" }}
        >
          <Table
            bordered
            locale={locale}
            components={components}
            dataSource={updatedDataSource}
            columns={columns}
            rowClassName="editable-row"
            pagination={false}
            scroll={{ y: this.state.height - 330 }}
            rowKey="email"
          />
        </EditableContext.Provider>
      </div>
    );
  }
}

export default Form.create()(EditableTable);
