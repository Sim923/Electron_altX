import React from "react";
import { 
  Modal, 
  Checkbox, 
  Row, 
  Col, 
  Input, 
  Form, 
  Icon, 
  Typography, 
  Select, 
  Button 
} from "antd";
import creditCardType from 'credit-card-type';
import country from 'countryjs';
import JigTool from '../utils/jig-tool';
import styles from "./Billing.scss";

const { Option } = Select;
const { Text } = Typography;

const fieldsToNullify = [
  'stateBilling',
  'stateShipping',
  'countryBilling',
  'countryShipping',
  'CardExpirationMonth',
  'CardExpirationYear',
  'CardType',
];
const formsToCallOnChange = ['BILLING', 'SHIPPING'];

class InputGroup extends React.Component {
  inputRef = [];

  constructor(props) {
    super(props);
    this.state = {
      values: []
    };
  }

  resetFields = () => {
    const { form, fieldsList, onChangeField } = this.props;
    let list = [ ...fieldsList ];
    if (list.some((field) => field.name.includes('Card'))) {
      list = list.concat([{ name: 'CardExpirationMonth' }, { name: 'CardExpirationYear' }, { name: 'CardSecurityCode' }]);
    }
    list.forEach(({ name }) => {
      const value = {};
      // value[name] = data ? data[field.name] : "";
      value[name] = "";
      if (fieldsToNullify.includes(name)) {
        value[name] = null;
      }
      form.setFieldsValue(value);
    });
    if (this.props.title === "BILLING") {
      fieldsList.forEach(field => onChangeField(field.name));
    }
  };

  onChangeField = (field, e) => {
    const value = typeof e === 'string' ? e : e.target.value;
    if (formsToCallOnChange.includes(this.props.title)) {
      this.props.onChangeField(field, value);
    }
  };

  onCardChange = (v) => {
    if (creditCardType(v).length === 1) {
      if (creditCardType(v)[0].type.toUpperCase() === "AMERICAN-EXPRESS") {
        this.props.form.setFieldsValue({ CardType: "AMEX"})
        this.onChangeField("CardType", "AMEX")
      }else{
        this.props.form.setFieldsValue({ CardType: creditCardType(v)[0].niceType})
        this.onChangeField("CardType", creditCardType(v)[0].niceType)
      }
    }
  }

  isNumber = (rule, value, cb) => {
    if (Number.isNaN(value)) {
      cb("This field should be number");
    } else {
      cb();
    }
  };

  isVisa = (rule, value, cb) => {
    if (
      value !== "VISA" &&
      value !== "MASTERCARD" &&
      value !== "DISCOVER" &&
      value !== "AMEX"
    ) {
      cb("Please enter one of the following {VISA; MASTERCARD; DISCOVER; AMEX");
    } else {
      cb();
    }
  };

  onCountryChange = (field, v) => {
    const formValue = this.props.form.getFieldsValue();
    formValue[field] = v;
    const stateField = `state${field.substring(7)}`;
    formValue[stateField] = null;
    this.props.form.setFieldsValue(formValue);
    this.props.onChangeField(field, v);
    this.props.onChangeField(stateField, "");
  }

  onStateChange = (field, v) => {
    const formValue = this.props.form.getFieldsValue();
    formValue[field] = v;
    this.props.form.setFieldsValue(formValue);
    this.props.onChangeField(field, v);
  }

  render() {
    const { fieldsList, title, form, disabled, data } = this.props;
    const { getFieldDecorator } = form;
    const allCountries = country.all();
    const countryOptions = allCountries.map((item) => {
      if (item.name) {
        return (
          <Option key={item.name} value={item.name}>{item.name}</Option>
        )
      }
      return null;
    });

    const stateBillingOptions = this.props.form.getFieldsValue().countryBilling ? country.states(this.props.form.getFieldsValue().countryBilling, 'name').map(item => (<Option value={item}>{item}</Option>)) : null;
    const stateShippingOptions = this.props.form.getFieldsValue().countryShipping ? country.states(this.props.form.getFieldsValue().countryShipping, 'name').map(item => (<Option value={item}>{item}</Option>)) : null;
    return (
      <div style={title === "CARD INFO" ? {padding: "20px 0px 0px 0px"} : {padding: "20px 0px 10px 0px"}}>
        <div className={styles.modalTitleWrapper}>
          <h1>{title}</h1>
          {title === "SHIPPING" ? 
            (
              <Form.Item style={{ marginBottom: "0px", flex: 2 }}>
                {getFieldDecorator("ShippingAsBilling", {
                  initialValue: data ? data.ShippingAsBilling : false
                })(
                  <Checkbox onChange={this.props.setBillingtoShipping}>
                    <Text style={{ color: "#8B96BE" }}>
                      Same as billing
                    </Text>
                  </Checkbox>
                )}
              </Form.Item>
            ) : null}
          <a
            className={styles.reload}
            onClick={this.resetFields}
            disabled={disabled}
          >
            <Icon
              type="retweet"
              style={{
                fontSize: "14px"
              }}
            />
          </a>
        </div>
        {fieldsList.map((field) => {
          const selectValidator = (fieldName) => {
            if (fieldName === 'CardNumber') {
              return this.isNumber;
            }
            if (fieldName === 'CardType') {
              return this.isVisa;
            }
            return null;
          };
          if (field.name === "phoneBilling" || field.name === "phoneShipping") {
            return(
              <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
                {getFieldDecorator(field.name, {
                  rules: [
                    {
                      validator: selectValidator(field.name),
                      required: !(field.name.includes("address2") || field.name.includes("address3")),
                      message:
                        field.name === "CardType"
                          ? "Please enter one of the following {VISA; MASTERCARD; DISCOVER; AMEX"
                          : `Please input the ${field.placeholder}!`
                    }
                  ],
                  initialValue: data ? data[field.name] : ""
                })(
                  <Input
                    placeholder={field.placeholder}
                    disabled={disabled}
                    type="number"
                    onChange={e => {
                      if (field.name === "CardNumber") {
                        this.onCardChange(e.target.value)
                      }
                      this.onChangeField(field.name, e)
                    }}
                  />
                )}
              </Form.Item>
            )
          }
          if (field.name === "countryBilling" || field.name === "countryShipping") {
            return (
              <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
                {getFieldDecorator(field.name, {initialValue: data ? data[field.name] : null})
                (
                  <Select
                    showSearch
                    dropdownClassName={`${this.props.theme}_layout_dropdown`}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    optionFilterProp="children"
                    onChange={(v) => this.onCountryChange(field.name, v)}
                    filterOption={(input, option) => {
                      return option.props.children ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : null;
                    }}
                  >
                    <Option value={null}>Select Country</Option>
                    {countryOptions}
                  </Select>
                )}
              </Form.Item>
            )
          }
          if (field.name === "stateBilling") {
            return (
              <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
                {getFieldDecorator(field.name, {initialValue: data ? data[field.name] : null})
                (
                  <Select
                    showSearch
                    dropdownClassName={`${this.props.theme}_layout_dropdown`}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    optionFilterProp="children"
                    onChange={v => this.onStateChange(field.name, v)}
                    filterOption={(input, option) => {
                      return option.props.children ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : null;
                    }}
                  >
                    <Option value={null}>Select State</Option>
                    {stateBillingOptions}
                  </Select>
                )}
              </Form.Item>
            )
          } 
          if (field.name === "stateShipping") {
            return (
              <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
                {getFieldDecorator(field.name, {initialValue: data ? data[field.name] : null})(
                  <Select
                    showSearch
                    dropdownClassName={`${this.props.theme}_layout_dropdown`}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    optionFilterProp="children"
                    onChange={v => this.onStateChange(field.name, v)}
                    filterOption={(input, option) => {
                      return option.props.children ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : null;
                    }}
                  >
                    <Option value={null}>Select State</Option>
                    {stateShippingOptions}
                  </Select>
              )}
              </Form.Item>
            )
          } 
          if (field.name === "CardType") {
            return (
              <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
                {getFieldDecorator(field.name,{initialValue: data ? data[field.name] : null})(
                  <Select
                    showSearch
                    dropdownClassName={`${this.props.theme}_layout_dropdown`}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      return option.props.children ? option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 : null;
                    }}
                  >
                    <Option value={null}>Select Type</Option>
                    <Option value="Visa">Visa</Option>
                    <Option value="Mastercard">Mastercard</Option>
                    <Option value="Maestro">Maestro</Option>
                    <Option value="AMEX">AMEX</Option>
                    <Option value="Discover">Discover</Option>
                    <Option value="Diners Club">Diners Club</Option>
                    <Option value="UnionPay">UnionPay</Option>
                    <Option value="JCB">JCB</Option>
                  </Select>
                )}
              </Form.Item>
            )
          }
          return (
            <Form.Item key={field.name} style={{ marginBottom: "0px" }}>
              {getFieldDecorator(field.name, {
                rules: [
                  {
                    validator: selectValidator(field.name),
                    required: !(field.name.includes("address2") || field.name.includes("address3")),
                    message:
                      field.name === "CardType"
                        ? "Please enter one of the following {VISA; MASTERCARD; DISCOVER; AMEX"
                        : `Please input the ${field.placeholder}!`
                  }
                ],
                initialValue: data ? data[field.name] : ""
              })(
                <Input
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={e => {
                    if (field.name === "CardNumber") {
                      this.onCardChange(e.target.value);
                    }
                    this.onChangeField(field.name, e);
                  }}
                />
              )}
            </Form.Item>
          )
        })}
        {title === "PROFILE" ? (
          <Form.Item style={{ marginBottom: "0px" }}>
            {getFieldDecorator("CheckoutOncePerWebsite", {
              initialValue: data ? data.CheckoutOncePerWebsite : false
            })(
              <Checkbox>
                <Text style={{ color: "#8B96BE" }}>
                  Enable One-time Checkout
                </Text>
              </Checkbox>
            )}
          </Form.Item>
        ) : null}
      </div>
    );
  }
}

class BillingModal extends React.Component {
  billingFieldsList = [
    {
      name: "FirstNameBilling",
      placeholder: "First name"
    },
    {
      name: "LastNameBilling",
      placeholder: "Last name"
    },
    {
      name: "BillingEmail",
      placeholder: "Email address"
    },
    {
      name: "address1Billing",
      placeholder: "Address"
    },
    {
      name: "address2Billing",
      placeholder: "Address2"
    },
    {
      name: "address3Billing",
      placeholder: "Address3"
    },
    {
      name: "zipCodeBilling",
      placeholder: "Postal code"
    },
    {
      name: "cityBilling",
      placeholder: "City"
    },
    {
      name: "stateBilling",
      placeholder: "State"
    },
    {
      name: "countryBilling",
      placeholder: "Country"
    },
    {
      name: "phoneBilling",
      placeholder: "Phone number"
    }
  ];

  shippingFieldsList = [
    {
      name: "FirstNameShipping",
      placeholder: "First name"
    },
    {
      name: "LastNameShipping",
      placeholder: "Last name"
    },
    {
      name: "ShippingEmail",
      placeholder: "Email address"
    },
    {
      name: "address1Shipping",
      placeholder: "Address"
    },
    {
      name: "address2Shipping",
      placeholder: "Address2"
    },
    {
      name: "address3Shipping",
      placeholder: "Address3"
    },
    {
      name: "zipCodeShipping",
      placeholder: "Postal code"
    },
    {
      name: "cityShipping",
      placeholder: "City"
    },
    {
      name: "stateShipping",
      placeholder: "State"
    },
    {
      name: "countryShipping",
      placeholder: "Country"
    },
    {
      name: "phoneShipping",
      placeholder: "Phone number"
    }
  ];

  cardInfoFieldsList = [
    {
      name: "NameOnCard",
      placeholder: "Name on payment card"
    },
    {
      name: "CardType",
      placeholder: "Select card type"
    },
    {
      name: "CardNumber",
      placeholder: "Card number"
    },
  ];

  profileFieldsList = [
    {
      name: "ProfileName",
      placeholder: "Name"
    }
  ];

  constructor(props) {
    super(props);

    const thisYear = new Date().getFullYear();
    this.state = {
      disabled: false,
      thisYear,
      billingEmail: '',
      billingAddress1: '',
      billingAddress2: '',
      shippingEmail: '',
      shippingAddress1: '',
      shippingAddress2: '',
      billingJigSelected: [],
      shippingJigSelected: [],
    };
  }

  onChangeField = (fieldName, value) => {
    if (this.state.disabled) {
      const index = this.billingFieldsList.findIndex(
        field => field.name === fieldName
      );
      if (fieldName !== "CardSecurityCode") {
        this.setShippingAsBilling(index, value);
      }
    } else if (fieldName === 'BillingEmail') {
      this.setState({
        billingEmail: value,
      });
    } else if (fieldName === 'address1Billing') {
      this.setState({
        billingAddress1: value,
      });
    } else if (fieldName === 'address2Billing') {
      this.setState({
        billingAddress2: value,
      });
    } else if (fieldName === 'ShippingEmail') {
      this.setState({
        shippingEmail: value,
      });
    } else if (fieldName === 'address1Shipping') {
      this.setState({
        shippingAddress1: value,
      });
    } else if (fieldName === 'address2Shipping') {
      this.setState({
        shippingAddress2: value,
      });
    }
  };

  setShippingAsBilling = (index, value) => {
    const val = {};
    const { form } = this.props;
    val[this.shippingFieldsList[index].name] = (value || form.getFieldsValue([this.billingFieldsList[index].name])[this.billingFieldsList[index].name]);
    form.setFieldsValue(val);
  };

  setBillingtoShipping = e => {
    if (e.target.checked) {
      this.shippingFieldsList.forEach((field, index) => {
        this.setShippingAsBilling(index);
      });
      this.setState({ disabled: true });
    } else {
      this.setState({ disabled: false });
    }
  };

  toggleJigBilling = (event, fieldName) => {
    if (event.target.checked) {
      this.setState((prevState) => ({
        billingJigSelected: prevState.billingJigSelected.concat(fieldName)
      }));
    } else {
      this.setState((prevState) => ({
        billingJigSelected: prevState.billingJigSelected.filter((field) => field !== fieldName)
      }));
    }
  }

  toggleJigShipping = (event, fieldName) => {
    if (event.target.checked) {
      this.setState((prevState) => ({
        shippingJigSelected: prevState.shippingJigSelected.concat(fieldName)
      }));
    } else {
      this.setState((prevState) => ({
        shippingJigSelected: prevState.shippingJigSelected.filter((field) => field !== fieldName)
      }));
    }
  }

  jigBilling = () => {
    const { form } = this.props;
    if (this.state.billingJigSelected.includes('name')) {
      form.setFieldsValue({ FirstNameBilling: JigTool.generateFirstName () });
      form.setFieldsValue({ LastNameBilling: JigTool.generateLastName() });
    }
    if (this.state.billingJigSelected.includes('email')) {
      const email = this.state.billingEmail || form.getFieldValue('BillingEmail');
      if (!this.state.billingEmail) {
        this.setState({ billingEmail: form.getFieldValue('BillingEmail')});
      }
      if (email) {
        form.setFieldsValue({ BillingEmail: JigTool.jigEmail(email) });
      }
    }
    if (this.state.billingJigSelected.includes('address')) {
      const address1 = this.state.billingAddress1 || form.getFieldValue('address1Billing');
      if (!this.state.billing1Address) {
        this.setState({ billingAddress1: address1 });
      }
      if (address1) {
        form.setFieldsValue({ address1Billing: JigTool.jigAddress1(address1) });
      }
      const address2 = this.state.billingAddress2 || form.getFieldValue('address2Billing');
      if (!this.state.billing2Address) {
        this.setState({ billingAddress2: address2 });
      }
      if (address2) {
        form.setFieldsValue({ address2Billing: JigTool.jigAddress2(address2) });
      }
    }
    if (this.state.billingJigSelected.includes('profile')) {
      const phone = form.getFieldValue('phoneBilling');
      if (phone.length === 10) {
        form.setFieldsValue({ phoneBilling: JigTool.jigPhone(phone) });
      }
    }
  }

  jigShipping = () => {
    const { form } = this.props;
    if (this.state.shippingJigSelected.includes('name')) {
      form.setFieldsValue({ FirstNameShipping: JigTool.generateFirstName () });
      form.setFieldsValue({ LastNameShipping: JigTool.generateLastName() });
    }
    if (this.state.shippingJigSelected.includes('email')) {
      const email = this.state.shippingEmail || form.getFieldValue('ShippingEmail');
      if (!this.state.shippingEmail) {
        this.setState({ shippingEmail: form.getFieldValue('ShippingEmail') });
      }
      if (this.state.shippingEmail) {
        form.setFieldsValue({ ShippingEmail: JigTool.jigEmail(email) });
      }
    }
    if (this.state.shippingJigSelected.includes('address')) {
      const address1 = this.state.shippingAddress1 || form.getFieldValue('address1Shipping');
      if (!this.state.shippinh1Address) {
        this.setState({ shippingAddress1: address1 });
      }
      if (address1) {
        form.setFieldsValue({ address1Shipping: JigTool.jigAddress1(address1) });
      }
      const address2 = this.state.shippingAddress2 || form.getFieldValue('address2Shipping');
      if (!this.state.shipping2Address) {
        this.setState({ shippingAddress2: address2 });
      }
      if (address2) {
        form.setFieldsValue({ address2Shipping: JigTool.jigAddress2(address2) });
      }
    }
    if (this.state.shippingJigSelected.includes('profile')) {
      const phone = form.getFieldValue('phoneShipping');
      if (phone.length === 10) {
        form.setFieldsValue({ phoneShipping: JigTool.jigPhone(phone) });
      }
    }
  }

  render() {
    const { formVisible, onCancel, onSave, form, data } = this.props;
    const { getFieldDecorator } = form;
    const yearOptions = [];
    const monthOptions = [];

    for (let i = 1; i <= 31; i++) {
      const year = this.state.thisYear + i;
      yearOptions.push(<Option key={i} value={year}>{year}</Option>);
    }
    for (let i = 1; i < 13; i++) {
      monthOptions.push(<Option key={i} value={i > 10 ? `0${i}` : i}>{i < 10 ? `0${i}` : i}</Option>);
    }
    return (
      <Modal
        title="New Profile"
        visible={formVisible}
        maskClosable={false}
        onCancel={onCancel}
        onOk={onSave}
        okText="Save"
        width={900}
        centered
        maskStyle={{backgroundColor: this.props.theme === "light" ? "rgba(162,167,185,.8)" : "rgba(7,10,25,.8)"}}
        className={`${this.props.theme}_layout_modal`}
      >
        <Form>
          <Row gutter={30}>
            <Col span={8}>
              <InputGroup
                theme={this.props.theme}
                fieldsList={this.billingFieldsList}
                title="BILLING"
                form={form}
                onChangeField={this.onChangeField}
                data={data}
              />
              <div className="billingJigWrapper">
                <div className="billingJigChecks">
                  <Checkbox onChange={(event) => this.toggleJigBilling(event, 'name')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Name
                    </Text>
                  </Checkbox>
                  <Checkbox onChange={(event) => this.toggleJigBilling(event, 'email')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Email
                    </Text>
                  </Checkbox>
                  <Checkbox onChange={(event) => this.toggleJigBilling(event, 'profile')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Phone
                    </Text>
                  </Checkbox>
                  <Checkbox onChange={(event) => this.toggleJigBilling(event, 'address')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Address
                    </Text>
                  </Checkbox>
                </div>
                <div>
                  <Button onClick={this.jigBilling}>Jig</Button>
                </div>
              </div>
            </Col>
            <Col span={8} style={{backgroundColor: this.props.theme === "dark" ? "#1E2239" : "#E9ECF3"}}>
              <InputGroup
                theme={this.props.theme}
                fieldsList={this.shippingFieldsList}
                setBillingtoShipping={this.setBillingtoShipping}
                title="SHIPPING"
                form={form}
                onChangeField={this.onChangeField}
                disabled={this.state.disabled}
                data={data}
              />
              <div className="billingJigWrapper">
                <div className="billingJigChecks">
                  <Checkbox onChange={(event) => this.toggleJigShipping(event, 'name')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Name
                    </Text>
                  </Checkbox>
                  <Checkbox onChange={(event) => this.toggleJigShipping(event, 'email')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Email
                    </Text>
                  </Checkbox>
                  <Checkbox onChange={(event) => this.toggleJigShipping(event, 'profile')}>
                    <Text style={{ color: "#8B96BE" }}>
                      Phone
                    </Text>
                  </Checkbox>
                  <Checkbox 
                    onChange={(event) => {
                      this.toggleJigShipping(event, 'address');
                      // this.props.setBillingtoShipping(event);
                    }}
                  >
                    <Text style={{ color: "#8B96BE" }}>
                      Address
                    </Text>
                  </Checkbox>
                </div>
                <div>
                  <Button onClick={this.jigShipping}>Jig</Button>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <InputGroup
                theme={this.props.theme}
                fieldsList={this.cardInfoFieldsList}
                title="CARD INFO"
                form={form}
                data={data}
              />
              <div className="billingCardMeta">
                <div className="billingCardMetaCol">
                  <Form.Item key="CardExpirationMonth" style={{ marginBottom: "0px" }}>
                    {getFieldDecorator("CardExpirationMonth", {initialValue: data ? data.CardExpirationMonth : null})(
                      <Select
                        dropdownClassName={`${this.props.theme}_layout_dropdown`}
                        showSearch
                        placeholder="Month"
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          return option.props.children ? option.props.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0 : null;
                        }}
                      >
                        <Option value={null}>Month</Option>
                        {monthOptions}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="billingCardMetaCol">
                  <Form.Item key="CardExpirationYear" style={{ marginBottom: "0px" }}>
                    {getFieldDecorator("CardExpirationYear", {initialValue: data ? data.CardExpirationMonth : null})(
                      <Select
                        dropdownClassName={`${this.props.theme}_layout_dropdown`}
                        showSearch
                        placeholder="Year"
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          return option.props.children ? option.props.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0 : null;
                        }}
                      >
                        <Option value={null}>Year</Option>
                        {yearOptions}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="billingCardMetaCol">
                  <Form.Item key="CardSecurityCode" style={{ marginBottom: "0px" }}>
                    {getFieldDecorator("CardSecurityCode", {
                      initialValue: data ? data.CardSecurityCode : ""
                    })(
                      <Input
                        placeholder="CCV"
                        onChange={e => {
                          this.onChangeField("CardSecurityCode", e)
                        }}
                      />
                    )}
                  </Form.Item>
                </div>
              </div>
              <InputGroup
                theme={this.props.theme}
                fieldsList={this.profileFieldsList}
                title="PROFILE"
                form={form}
                data={data}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({ name: "BillingForm" })(BillingModal);
