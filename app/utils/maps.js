import _ from 'lodash';

const Empty = {type:'default', value: ''};
const ProfileName = 'ProfileName'
const ShippingAsBilling = 'ShippingAsBilling'
const FirstNameBilling = 'FirstNameBilling'
const LastNameBilling = 'LastNameBilling'
const Address1Billing = 'address1Billing'
const Address2Billing = 'address2Billing'
const Address3Billing = 'address3Billing'
const CityBilling = 'cityBilling'
const StateBilling = 'stateBilling'
const ZipCodeBilling = 'zipCodeBilling'
const CountryBilling = 'countryBilling'
const PhoneBilling = 'phoneBilling'
const HouseNbBilling = 'houseNbBilling'
const FirstNameShipping = 'FirstNameShipping'
const LastNameShipping = 'LastNameShipping'
const Address1Shipping = 'address1Shipping'
const Address2Shipping = 'address2Shipping'
const Address3Shipping = 'address3Shipping'
const CityShipping = 'cityShipping'
const StateShipping = 'stateShipping'
const ZipCodeShipping = 'zipCodeShipping'
const CountryShipping = 'countryShipping'
const PhoneShipping = 'phoneShipping'
const HouseNbShipping = 'houseNbShipping'
const FriendlyName = 'friendlyName'
const NameOnCard = 'NameOnCard'
const DOB = 'DOB'
const CardType = 'CardType'
const CardNumber = 'CardNumber'
const CardExpirationMonth = 'CardExpirationMonth'
const CardExpirationYear = 'CardExpirationYear'
const CardSecurityCode = 'CardSecurityCode'
const CardFirstName = 'CardFirstName'
const CardLastName = 'CardLastName'
const Email = 'BillingEmail'
const BillingEmail = 'BillingEmail'
const ShippingEmail = 'ShippingEmail'
const PaypalEmail = 'paypalEmail'
const PaypalPassword = 'paypalPassword'
const CheckoutDelaySeconds = 'CheckoutDelaySeconds'
const CheckoutOncePerWebsite = 'CheckoutOncePerWebsite'
const BillingAltFirstName = 'BillingAltFirstName'
const BillingAltLastName = 'BillingAltLastName'
const BillingStateJP = 'BillingStateJP'
const ShippingAltFirstName = 'ShippingAltFirstName'
const ShippingAltLastName = 'ShippingAltLastName'
const ShippingStateJP = 'ShippingStateJP'
const ShippingMethod = 'ShippingMethod'
const MaxCheckouts = 'MaxCheckouts'
const StateShippingShort = 'stateShippingShort'
const CountryShippingShort = 'countryShippingShort'
const StateBillingShort = 'stateBillingShort'
const CountryBillingShort = 'countryBillingShort'

const statesCodeMap = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  Hawai: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Lousiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississipi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};
function findStateByKey(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (statesCodeMap[array[i]] === value) {
            return array[i];
        }
    }
    return value;
}
function simpleRemapInto(row, format) {
  const result = {};
  const { map } = format;
  Object.keys(map).forEach(function(internalField) {
  if (typeof map[internalField] === 'object') {
    switch(map[internalField].type) {
      case 'fullName': {
        const [name, last] = row[internalField].split(' ');
        result[map[internalField].name] = name;
        result[map[internalField].last] = last;
        break;
      }
      case 'handleNumber': {
        result[internalField.value] = row[internalField];
        break;
      }
      case 'handleCvv': {
        result[internalField.value] = row[internalField];
	break;
      }
      case 'preset':
        result[internalField] = row[internalField];
        break;
      case 'toLowerCase':
        result[map[internalField].value] = row[internalField] ? row[internalField].charAt(0).toUpperCase() + row[internalField].substring(1) : '';
	break;
      case 'toString':
        result[map[internalField].value] = row[internalField] ? row[internalField] : '';
        break;
      case 'stateParse':
        result[internalField] = findStateByKey(Object.keys(statesCodeMap, row[internalField]));
	break;
      case 'countryParse':
        result[internalField] = row[map[internalField].value] && row[map[internalField].value] === "USA" ? "United States" : row[map[internalField].value];
        break;
      case 'subset':
        Object.keys(map[internalField].items).forEach(function(internalSubField) {
	  result[map[internalField].items[internalSubField]] = row[internalField] != null && row[internalField][internalSubField] != null ? row[internalField][internalSubField] : '';
	});
	break;
      case 'default':
        break;
      default:
        throw new Error(`${map[internalField].type} not implemented`);

      }
    } else {
      result[map[internalField]] = row[internalField] != null ? row[internalField] : '';
    }
  });
  return result;
}

function simpleRemapFrom(row, format) {
  const result = {};
  const { map } = format;
  Object.keys(map).forEach(function(internalField){
    if (typeof map[internalField] === 'object') {
      switch(map[internalField].type) {
        case 'fullName':
          result[internalField] = `${row[map[internalField].name]} ${row[map[internalField].last]}`;
	  break;
        case 'handleNumber':
          result[internalField] = row[map[internalField].value].length === 1 ? `0${row[map[internalField].value]}` : row[map[internalField].value];
	  break;
	case 'handleCvv':
	  result[internalField] = row[map[internalField].value] === "0" ? "000" : row[map[internalField].value];
	  break;
	case 'preset':
	  result[internalField] = map[internalField].value;
	  break;
	case 'toLowerCase':
	  result[internalField] = row[map[internalField].value].toLowerCase();
	  break;
	case 'toString':
	  result[internalField] = row[map[internalField].value].toString();
	  break;
        case 'stateParse':
	  result[internalField] = statesCodeMap[row[map[internalField].value]] ? statesCodeMap[row[map[internalField].value]] : row[map[internalField].value];
	  break;
	case 'countryParse':
	  result[internalField] = row[map[internalField].value] && row[map[internalField].value] === "United States" ? "USA" : row[map[internalField].value];
	  break;
	case 'subset':
	  result[internalField] = {};
	  Object.keys(map[internalField].items).forEach(function(internalSubField) {
	    result[internalField][internalSubField] = row[map[internalField].items[internalSubField]] != null ? row[map[internalField].items[internalSubField]] : '';
	  });
	  break;
	case 'default':
	  result[internalField] = map[internalField].value;
	  break;
	default:
	  throw new Error(`${map[internalField].type} not implemented`);
      }
    } else if (map[internalField]) {
      result[internalField] = row[map[internalField]] ? row[map[internalField]] : '';
    } else {
      result[internalField] = '';
    }
  });
  return result;
}

export default {
	csv : {
		map: {
		  'Profile Name':ProfileName,
		  'Billing Email Address':Email,
		  'Shipping Email Address':ShippingEmail, // or paypal email
		  'Shipping First Name':FirstNameShipping,
		  'Shipping Last Name':LastNameShipping,
		  'Shipping Country':CountryShipping,
		  'Shipping State':StateShipping,
		  'Shipping Address':Address1Shipping,
		  'Shipping Address Two':Address2Shipping,
		  'Shipping Address Three':Address3Shipping,
		  'Shipping City':CityShipping,
		  'Shipping Postal': ZipCodeShipping,
		  'Shipping Phone': PhoneShipping,
		  'Same Billing':ShippingAsBilling,
		  'Billing First Name':FirstNameBilling,
		  'Billing Last Name':LastNameBilling,
		  'Billing Country':CountryBilling,
		  'Billing State':StateBilling,
		  'Billing Address':Address1Billing,
		  'Billing Address Two':Address2Billing,
		  'Billing Address Three':Address3Billing,
		  'Billing City':CityBilling,
		  'Billing Postal':ZipCodeBilling,
		  'Billing Phone':PhoneBilling,
		  'Card Number':CardNumber,
		  'Card CVV':CardSecurityCode,
		  'Expire Month':CardExpirationMonth,
		  'Expire Year':CardExpirationYear,
		  'Card Type':CardType,
			'Name on Card':NameOnCard
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	adept : {
		map: {
			"profileName": ProfileName,
      "order_billing_name": {type: 'fullName', name: FirstNameBilling, last: LastNameBilling},
      "order_email": Email,
      "order_tel": {type: 'toString', value: PhoneBilling},
      "bo": Address1Billing,
      "oba3": Address2Billing,
      "order_billing_address_3": Address3Billing,
      "order_billing_city": CityBilling,
      "order_billing_zip": ZipCodeBilling,
      "order_billing_state": {type: 'stateParse', value: StateBilling},
      "order_billing_country": CountryBilling,
      "credit_card_type": {type: 'toLowerCase', value: CardType},
      "cnb": {type: 'toString', value: CardNumber},
      "credit_card_month": {type: 'handleNumber', value: CardExpirationMonth},
      "credit_card_year": CardExpirationYear,
      "vval": CardSecurityCode
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	yellow : {
		map: {
      CVV: {type: 'handleCvv', value: CardSecurityCode},
      address: Address1Billing,
      aptSuite: Address2Billing,
      cardNumber: {type: 'toString', value: CardNumber},
      cardType: {type: 'toLowerCase', value: CardType},
      city: CityBilling,
      country: CountryBilling,
      email: Email,
      expiryMonth: {type: 'handleNumber', value: CardExpirationMonth},
      expiryYear: CardExpirationYear,
      firstName: FirstNameBilling,
      jigProfileAddress: {type: 'preset', value: false},
      jigProfileName: {type: 'preset', value: false},
      jigProfilePhoneNumber: {type: 'preset', value: false},
      lastName: LastNameBilling,
      phoneNumber: {type: 'toString', value: PhoneBilling},
      stateProvince: {type: 'stateParse', value: StateBilling},
      zipCode: ZipCodeBilling,
    },
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	feather : {
		map: {
      country: {type: 'countryParse', value: CountryBilling},
      profileNickname: ProfileName,
      city: CityBilling,
      cardType: {type: 'toLowerCase', value: CardType},
      fullName: {type: 'fullName', name: FirstNameBilling, last: LastNameBilling},
      adr3: Address3Billing,
      cardNo: {type: 'toString', value: CardNumber},
      adr2: Address2Billing,
      adr1: Address1Billing,
      cvc: {type: 'handleCvv', value: CardSecurityCode},
      expYr: CardExpirationYear,
      phone: PhoneBilling,
      expMo: {type: 'handleNumber', value: CardExpirationMonth},
      postCode: ZipCodeBilling,
      state: {type: 'stateParse', value: StateBilling},
      email: Email,
      singleBilling: ShippingAsBilling
    },
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom
  },
	ghost : {
		map: {
      Billing: {type: 'subset', items:{
        Address: Address1Billing,
        Apt: Address2Billing,
        City: CityBilling,
        FirstName: FirstNameBilling,
        LastName: LastNameBilling,
        State: {type: 'stateParse', value: StateBilling},
        Zip: ZipCodeBilling,
      }},
      CCNumber: {type: 'toString', value: CardNumber},
      CVV: {type: 'handleCvv', value: CardSecurityCode},
      CardType,
      Country: {type: 'countryParse', value: CountryBilling},
      Email,
      ExpMonth: {type: 'handleNumber', value: CardExpirationMonth},
      ExpYear: CardExpirationYear,
      Name: ProfileName,
      Phone: {type: 'toString', value: PhoneBilling},
      Same: ShippingAsBilling,
      Shipping: {type: 'subset', items: {
        Address: Address1Shipping,
        Apt: Address2Shipping,
        City: CityShipping,
        FirstName: FirstNameShipping,
        LastName: LastNameShipping,
        State: {type: 'stateParse', value: StateShipping},
        Zip: ZipCodeShipping
      }}
    },
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom
	},
	kaiser : {
		map: {
      'Input Ex 2': {type: 'subset', items:{
        'FIST_NAME': FirstNameBilling,
        'LAST_NAME': LastNameBilling,
        'EMAIL': Email,
        'PHONE NUMBER': PhoneBilling,
        'HOUSE NUMBER': Address3Billing,
        'ADDRESS LINE 1': Address2Billing,
        'ADDRESS LINE 2': Address1Billing,
        'STATE': StateBilling,
        'CITY': CityBilling,
        'POSTCODE / ZIP': ZipCodeBilling,
        'COUNTRY': {type: 'countryParse', value: CountryBilling},
        'CARD NUMBER': {type: 'toString', value: CardNumber},
        'EXPIRE MONTH': {type: 'handleNumber', value: CardExpirationMonth},
        'EXPIRE YEAR': CardExpirationYear,
        'CARD CVC': {type: 'handleCvv', value: CardSecurityCode},
      }}
    },
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	ganesh_footlocker : {
		map: {
                  // eslint-disable-next-line
		  'SKU': {type: 'preset', value: '\"\"'},
		  'SIZE': {type: 'preset', value: ''},
		  'FIRST NAME':FirstNameBilling,
		  'LAST NAME':LastNameBilling,
		  'EMAIL': Email,
		  'PHONE NUMBER': PhoneBilling,
		  'ADDRESS LINE 1':Address1Billing,
		  'ADDRESS LINE 2':Address2Billing,
		  'CITY': CityBilling,
      'STATE': StateBilling,
		  'POST CODE / ZIP': ZipCodeBilling,
      'COUNTRY': {type: 'countryParse', value: CountryBilling},
		  'CARD NUMBER': {type: 'toString', value: CardNumber},
		  'EXPIRE MONTH': {type: 'handleNumber', value: CardExpirationMonth},
		  'EXPIRE YEAR': CardExpirationYear,
		  'CARD CVV': {type: 'handleCvv', value: CardSecurityCode},
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	ganesh_offspring : {
		map: {
                  // eslint-disable-next-line
		  'SKU': {type: 'preset', value: '\"\"'},
		  'SIZE': {type: 'preset', value: ''},
		  'FIRST NAME':FirstNameShipping,
		  'LAST NAME':LastNameShipping,
		  'EMAIL': Email,
		  'PHONE NUMBER': PhoneShipping,
		  'ADDRESS LINE 1':Address1Shipping,
		  'ADDRESS LINE 2':Address2Shipping,
		  'CITY':CityShipping,
      'STATE': StateShipping,
		  'POST CODE / ZIP': ZipCodeShipping,
      'COUNTRY': {type: 'countryParse', value: CountryShipping},
		  'CARD NUMBER': {type: 'toString', value: CardNumber},
		  'EXPIRE MONTH': {type: 'handleNumber', value: CardExpirationMonth},
		  'EXPIRE YEAR':CardExpirationYear,
		  'CARD CVV': {type: 'handleCvv', value: CardSecurityCode},
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	ganesh_size : {
		map: {
		  'FIRST NAME':FirstNameShipping,
		  'LAST NAME':LastNameShipping,
		  'EMAIL': Email,
		  'PHONE NUMBER': PhoneShipping,
		  'ADDRESS LINE 1':Address1Shipping,
		  'ADDRESS LINE 2':Address2Shipping,
		  'CITY':CityShipping,
      'STATE': StateShipping,
		  'POST CODE / ZIP': ZipCodeShipping,
      'COUNTRY': {type: 'countryParse', value: CountryShipping},
		  'CARD NUMBER': {type: 'toString', value: CardNumber},
		  'EXPIRE MONTH': {type: 'handleNumber', value: CardExpirationMonth},
		  'EXPIRE YEAR':CardExpirationYear,
		  'CARD CVV': {type: 'handleCvv', value: CardSecurityCode},
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
  splash : {
    map: {
      profileName: ProfileName,
      email: Email,
      billingAddress: {type: 'subset', items:{
        firstName: FirstNameBilling,
        lastName: LastNameBilling,
        addressOne: Address1Billing,
        addressTwo: Address2Billing,
        zip: ZipCodeBilling,
        city: CityBilling,
        state: StateBilling,
        country: CountryBilling,
        phone: PhoneBilling,
      }},
      shippingAddress: {type: 'subset', items:{
        firstName: FirstNameShipping,
        lastName: LastNameShipping,
        addressOne: Address1Shipping,
        addressTwo: Address2Shipping,
        zip: ZipCodeShipping,
        city: CityShipping,
        state: StateShipping,
        country: CountryShipping,
        phone: PhoneShipping,
      }},
      card: {type: 'subset', items:{
        cardHolderName: NameOnCard,
        cardNumber: {type: 'toString', value: CardNumber},
        cardExpiryMonth: {type: 'handleNumber', value: CardExpirationMonth},
        cardExpiryYear: CardExpirationYear,
        cardCVV: {type: 'handleCvv', value: CardSecurityCode},
      }},
      jigAddress: {type: 'preset', value: "false"},
      oneCheckout:  {type: 'preset', value: "TRUE"}
    },
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom
  },
	aiomoji : {
		map: {
		  'Profile Name':ProfileName,
		  'Email Address':Email, // or paypal email
		  'Shipping First Name':FirstNameShipping,
		  'Shipping Last Name':LastNameShipping,
		  'Shipping Country':CountryShipping,
		  'Shipping State':StateShipping,
		  'Shipping Address':Address1Shipping,
		  'Shipping Address Two':Address2Shipping,
		  'Shipping City':CityShipping,
		  'Shipping Postal': ZipCodeShipping,
		  'Shipping Phone': PhoneShipping,
		  'Same Billing':ShippingAsBilling,
		  'Billing First Name':FirstNameBilling,
		  'Billing Last Name':LastNameBilling,
		  'Billing Country':CountryBilling,
		  'Billing State':StateBilling,
		  'Billing Address':Address1Billing,
		  'Billing Address Two':Address2Billing,
		  'Billing City':CityBilling,
		  'Billing Postal':ZipCodeBilling,
		  'Billing Phone':PhoneBilling,
		  'Card Number':CardNumber,
		  'Card CVV':CardSecurityCode,
		  'Expire Month':CardExpirationMonth,
		  'Expire Year':CardExpirationYear,
		  'Card Type':CardType,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'anbaio' : {
		map:  {
			ShippingAsBilling,
		    FirstNameBilling,
		    LastNameBilling,
		    address1Billing : Address1Billing,
		    address2Billing : Address2Billing,
		    cityBilling : CityBilling,
		    stateBilling : StateBilling,
		    zipCodeBilling : ZipCodeBilling,
		    countryBilling : CountryBilling,
		    phoneBilling : PhoneBilling,
		    houseNbBilling : HouseNbBilling,
		    FirstNameShipping,
		    LastNameShipping,
		    address1Shipping : Address1Shipping,
		    address2Shipping : Address2Shipping,
		    cityShipping : CityShipping,
		    stateShipping : StateShipping,
		    zipCodeShipping : ZipCodeShipping,
		    countryShipping : CountryShipping,
		    phoneShipping : PhoneShipping,
		    houseNbShipping : HouseNbShipping,
		    friendlyName : FriendlyName,
		    NameOnCard,
		    DOB,
		    cardType : CardType,
		    CardNumber,
		    CardExpirationMonth,
		    CardExpirationYear,
		    CardSecurityCode,
		    billingEmail : Email,
		    paypalEmail : PaypalEmail,
		    paypalPassword : PaypalPassword,
		    CheckoutDelaySeconds,
		    CheckoutOncePerWebsite,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	defJSON : {
		map:  {
			ProfileName,
			ShippingAsBilling,
	    FirstNameBilling,
	    LastNameBilling,
	    address1Billing: Address1Billing,
	    address2Billing: Address2Billing,
	    address3Billing: Address3Billing,
	    cityBilling : CityBilling,
	    stateBilling : StateBilling,
	    zipCodeBilling : ZipCodeBilling,
	    countryBilling : CountryBilling,
	    phoneBilling : PhoneBilling,
	    houseNbBilling : HouseNbBilling,
	    FirstNameShipping,
	    LastNameShipping,
	    address1Shipping : Address1Shipping,
	    address2Shipping : Address2Shipping,
	    address3Shipping : Address3Shipping,
	    cityShipping : CityShipping,
	    stateShipping : StateShipping,
	    zipCodeShipping : ZipCodeShipping,
	    countryShipping : CountryShipping,
	    phoneShipping : PhoneShipping,
	    houseNbShipping : HouseNbShipping,
	    friendlyName : FriendlyName,
	    NameOnCard,
	    DOB,
	    CardType,
	    CardNumber,
	    CardExpirationMonth,
	    CardExpirationYear,
	    CardSecurityCode,
	    BillingEmail,
	    ShippingEmail,
	    paypalEmail : PaypalEmail,
	    paypalPassword : PaypalPassword,
	    CheckoutDelaySeconds,
	    CheckoutOncePerWebsite,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'balko' : {
		map: {
		    "id": ProfileName,
		    "firstname":FirstNameShipping,
		    "lastname":LastNameShipping,
		    "email":Email,
		    "phone":PhoneBilling,
		    "add1":Address1Shipping,
		    "add2":Address2Shipping,
		    "state":StateShipping,
		    "zip":ZipCodeShipping,
		    "country":CountryShipping,
		    "city":CityShipping,
		    "ccfirst":CardFirstName,
		    "cclast":CardLastName,
		    "cc":CardNumber,
		    "expm":CardExpirationMonth,
		    "expy":CardExpirationYear,
		    "ccv":CardSecurityCode,
		    "oneCheckout": '', // WHATIS
		    "bfirstname":FirstNameBilling,
		    "blastname":LastNameBilling,
		    "badd1":Address1Billing,
		    "badd2":Address2Billing,
		    "bstate":StateBilling,
		    "bzip":ZipCodeBilling,
		    "bcountry":CountryBilling,
		    "bcity":CityBilling
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'bnb' : {
		map: {
			Name : FriendlyName,
			BillingFirstName : FirstNameBilling,
			BillingAltFirstName,
			BillingLastName : LastNameBilling,
			BillingAltLastName,
			BillingAddress1 : Address1Billing,
			BillingAddress2 : Address2Billing,
			BillingAddress3 : Address3Billing,
			BillingZipCode : ZipCodeBilling,
			BillingPhone : PhoneBilling,
			BillingCity : CityBilling,
			BillingState : StateBilling,
			BillingStateJP,
			ShippingFirstName : FirstNameShipping,
			ShippingAltFirstName,
			ShippingLastName : LastNameShipping,
			ShippingAltLastName,
			ShippingAddress1 : Address1Shipping,
			ShippingAddress2 : Address2Shipping,
			ShippingAddress3 : Address3Shipping,
			ShippingZipCode : ZipCodeShipping,
			ShippingPhone : PhoneShipping,
			ShippingCity : CityShipping,
			ShippingState : StateShipping,
			ShippingStateJP,
			ShippingMethod,
			CreditCardType : CardType,
			CreditCardNumber : CardNumber,
			CreditCardExpiryMonth : CardExpirationMonth,
			CreditCardExpiryYear : CardExpirationYear,
			CreditCardCvv : CardSecurityCode,
			ShippingAddressSame : ShippingAsBilling,
			MaxCheckouts,
		},
		intoDefault: simpleRemapInto,
		fromDefault: (row, format) => {
			const result = simpleRemapFrom(row, format);
			result.sizes = ['Random'];
			return result;
		}
	},
	'candypreme' : {
		map: {
		    "addressLine1":Address1Shipping,
		    "addressLine2":Address2Shipping,
		    "billingCVV":CardSecurityCode,
		    "billingCardNumber":CardNumber,
		    "billingCardType":CardType,
		    "billingExpMonth":CardExpirationMonth,
		    "billingExpYear":CardExpirationYear,
		    "billingName":NameOnCard,
		    "city":CityShipping,
		    "country":CountryShipping,
		    "email":Email,
		    "fullName":FriendlyName,
		    "phoneNumber":PhoneShipping,
		    "state":StateShipping,
		    "zipCode":ZipCodeShipping,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'cinnasole' : {
		map: {
			"profile_name":ProfileName,
			"profile[flName]": FriendlyName,
			"profile[email]":Email,
			"profile[phone]":PhoneShipping,
			"profile[address1]":Address1Shipping,
			"profile[address2]":Address2Shipping,
			"profile[zipCode]":ZipCodeShipping,
			"profile[city]":CityShipping,
			"profile[state]":StateShipping,
			"profile[country]":CountryShipping,
			"card[number]":CardNumber,
			"card[month]":CardExpirationMonth,
			"card[year]":CardExpirationYear,
			"card[cvv]":CardSecurityCode,
			"card[type]":CardType,
		},
		unpack: data => data.profiles,
		pack: data => {return {
			  "settings": {
			    "webhook": "",
			    "twocap": ""
			  },
			  "profiles": data
			}
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'cyber' : {
		map: {
		    "name": ProfileName,
		    "email": Email,
		    "phone": PhoneShipping,
		    "taskAmount": {type:'default', value: 1},
		    "singleCheckout": {type:'default', value: false},
		    "billingDifferent": ShippingAsBilling,
		    "favorite": {type:'default', value: false},
		    "card": {type: 'subset', items:{
		          "number": CardNumber,
		          "expiryMonth": CardExpirationMonth,
		          "expiryYear": CardExpirationYear,
		          "cvv": CardSecurityCode
		        }
		    },
		    "delivery": {type: 'subset', items:{
		      "firstName": FirstNameShipping,
		      "lastName":LastNameShipping,
		      "address1":Address1Shipping,
		      "address2":Address2Shipping,
		      "zip": ZipCodeShipping,
		      "city":  CityShipping,
		      "country": CountryShipping,
		      "state": StateShipping,
		    }},
		    "billing": {type: 'subset', items:{
		      "firstName": FirstNameBilling,
		      "lastName": LastNameBilling,
		      "address1": Address1Billing,
		      "address2": Address2Billing,
		      "zip": ZipCodeBilling,
		      "city": CityBilling,
		      "country": CountryBilling,
		      "state": StateBilling,
		    }}
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'dashev3' : {
		map: {
		    "billing":{type: 'subset', items:{
		      "address":Address1Billing,
		      "apt":Address2Billing,
		      "city":CityBilling,
		      "country": CountryBilling,
		      "firstName": FirstNameBilling,
		      "lastName": LastNameBilling,
		      "phoneNumber": PhoneBilling,
		      "state": StateBilling,
		      "zipCode": ZipCodeBilling
		  	  }
		    },
		    "billingMatch": ShippingAsBilling,
		    "card":{type: 'subset', items:{
		      "cvv": CardSecurityCode,
		      "holder": NameOnCard,
		      "month": CardExpirationMonth,
		      "number": CardNumber,
		      "year": CardExpirationYear
		  	  }
		    },
		    "email": Email,
		    "profileName": ProfileName,
		    "shipping":{type: 'subset', items:{
		      "address":Address1Shipping,
		      "apt":Address2Shipping,
		      "city":CityShipping,
		      "country":CountryShipping,
		      "firstName":FirstNameShipping,
		      "lastName":LastNameShipping,
		      "phoneNumber":PhoneShipping,
		      "state":StateShipping,
		      "zipCode":ZipCodeShipping,
		  	  }
		    }
		},
		unpack: data => Object.values(data),
		pack: data => {
			const obj = {};
			data.forEach((item) => {
                          obj[item.profileName] = item;
                        });
			return obj;
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'eveaio' : {
		map: {
			ProfileName,
			BillingFirstName:FirstNameBilling,
			BillingLastName:LastNameBilling,
			BillingAddressLine1:Address1Billing,
			BillingAddressLine2:Address2Billing,
			BillingCity:CityBilling,
			BillingState:StateBilling,
			BillingCountryCode:CountryBilling,
			BillingZip:ZipCodeBilling,
			BillingPhone:PhoneBilling,
			BillingEmail:Email,
			ShippingFirstName:FirstNameShipping,
			ShippingLastName:LastNameShipping,
			ShippingAddressLine1:Address1Shipping,
			ShippingAddressLine2:Address2Shipping,
			ShippingCity:CityShipping,
			ShippingState:StateShipping,
			ShippingCountryCode:CountryShipping,
			ShippingZip:ZipCodeShipping,
			ShippingPhone:PhoneShipping,
			ShippingEmail:Email,
			NameOnCard,
			CreditCardNumber:CardNumber,
			ExpirationMonth:CardExpirationMonth,
			ExpirationYear:CardExpirationYear,
			Cvv:CardSecurityCode,
			CardType,
			OneCheckoutPerWebsite:'',
			SameBillingShipping:ShippingAsBilling,
			BirthDay:'',
			BirthMonth:'',
			BirthYear:''
		},
		unpack: data => data.ArrayOfProfile.Profile,
		pack: data => {return {
				ArrayOfProfile: {
					Profile:  data
				}
			}
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'hastey' : {
		map: {
		    "__profile__name":ProfileName,
		    "address":Address1Shipping,
		    "address_2":Address2Shipping,
		    "cardType":CardType,
		    "cc_cvv":CardSecurityCode,
		    "cc_month":CardExpirationMonth,
		    "cc_year":CardExpirationYear,
		    "cc_number":CardNumber,
		    "city":CityShipping,
		    "country":CountryShipping,
		    "email":Email,
		    "id":'',
		    "name":FriendlyName,
		    "state":StateShipping,
		    "tel":PhoneShipping,
		    "zip":ZipCodeShipping,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'kodai' : {
		map: {
		    "billingAddress": { type: 'subset', items: {
              "address":Address1Billing,
              "apt":Address2Billing,
              "city":CityBilling,
              "firstName": FirstNameBilling,
              "lastName": LastNameBilling,
              "phoneNumber": PhoneBilling,
              "state": StateBilling,
              "zipCode": ZipCodeBilling
			  }
			},
		    "deliveryAddress": { type: 'subset', items: {
              "address":Address1Shipping,
              "apt":Address2Shipping,
              "city":CityShipping,
              "firstName":FirstNameShipping,
              "lastName":LastNameShipping,
              "phoneNumber":PhoneShipping,
              "state":StateShipping,
              "zipCode":ZipCodeShipping,
			  }
			},
		    "miscellaneousInformation": { type: 'subset', items: {
		      "deliverySameAsBilling": ShippingAsBilling
			  }
			},
		    "paymentDetails": { type: 'subset', items: {
		      "cardHolder": NameOnCard,
		      "cardNumber": CardNumber,
		      "cvv": CardSecurityCode,
		      "emailAddress": Email,
		      "expirationDate": '' // Custom
			  }
			},
		    "profileName": ProfileName,
		    "region": CountryShipping
		},
		unpack: data => Object.values(data),
		pack: data => {
			const obj = {};
			data.forEach((item) => {
                          obj[item.profileName] = item;
                        });
			return obj;
		},
		intoDefault: (row, format) => {
		  const result = simpleRemapInto(row, format);
	          const [cardExpirationMonth, cardExpirationYear] = `${_.get(row, 'paymentDetails.expirationDate', '')}/`. split('/');
	          result[CardExpirationMonth] = cardExpirationMonth;
	          result[CardExpirationYear] = cardExpirationYear;
	          return result;
		},
		fromDefault: (row, format) => {
		  const result = simpleRemapFrom(row, format);
                  _.set(result, 'paymentDetails.expirationDate', [_.get(row, 'CardExpirationMonth',''),_.get(row, 'CardExpirationYear','')].join('/'));
	          return result;
		}
	},
	'oculus' : {
		map: {
		    "Id": Empty,
		    "BillingInfo": { type:'subset', items: {
		      "Id": Empty,
		      "AccountId": Empty,
		      "FirstName": FirstNameBilling,
		      "LastName": LastNameBilling,
		      "FullName": '',
		      "Email": Email,
		      "Telephone": PhoneBilling,
		      "Street1": Address1Billing,
		      "Street2": Address2Billing,
		      "Street3": Address3Billing,
		      "Country": '',
		      "CountryJson": '',
		      "State": '',
		      "StateJson": '',
		      "City": CityBilling,
		      "Zip": ZipCodeBilling,
		      "IsBilling": ''
		      }
		    },
		    "ShippingInfo": { type:'subset', items: {
		      "Id": Empty,
		      "AccountId": Empty,
		      "FirstName": FirstNameShipping,
		      "LastName": LastNameShipping,
		      "FullName": '',
		      "Email": Email,
		      "Telephone": PhoneShipping,
		      "Street1": Address1Shipping,
		      "Street2": Address2Shipping,
		      "Street3": Address3Shipping,
		      "Country": '',
		      "CountryJson": '',
		      "State": '',
		      "StateJson": '',
		      "City": CityShipping,
		      "Zip": ZipCodeShipping,
		      "IsBilling": '',
		      }
		    },
		    "UseSameAsBilling": ShippingAsBilling,
		    "CardNumber": CardNumber,
		    "CreditCardName": NameOnCard,
		    "Expire": '',
		    "Cvv": CardSecurityCode,
		    "AccountName": ProfileName,
		    "IsCreditCard": {type:'default', value: true},
		    "PayPalId": PaypalEmail,
		    "PayPalPass": PaypalPassword
		},
		intoDefault: (row, format) => {
		  const result = simpleRemapInto(row, format);
                  const [cardExpirationMonth, cardExpirationYear] = `${_.get(row, 'Expire', '')}/`. split('/');
                  result[CardExpirationMonth] = cardExpirationMonth;
                  result[CardExpirationYear] = cardExpirationYear;
                  result[CountryShipping] = row.ShippingInfo.Country.country_name;
                  result[CountryShippingShort] = row.ShippingInfo.Country.country_abbreviation;
                  result[StateShipping] = row.ShippingInfo.State.province_name;
                  result[StateShippingShort] = row.ShippingInfo.State.province_abbreviation;
                  result[CountryBilling] = row.BillingInfo.Country.country_name;
                  result[CountryBillingShort] = row.BillingInfo.Country.country_abbreviation;
                  result[StateBilling] = row.BillingInfo.State.province_name;
                  result[StateBillingShort] = row.BillingInfo.State.province_abbreviation;
                  return result;
		},
		fromDefault: (row, format) => {
		  const result = simpleRemapFrom(row, format);
                  _.set(result, 'Expire', [_.get(row, 'CardExpirationMonth',''),_.get(row, 'CardExpirationYear','')].join('/'))

                  result.BillingInfo.isBilling = true;
                  result.BillingInfo.FullName = [row.FirstNameBilling, row.LastNameBilling].join(' ');
                  result.BillingInfo.Country = {
                              "country_name": CountryBilling,
                              "country_abbreviation": CountryBillingShort
                  }
                  result.BillingInfo.State = {
                              "province_name": StateBilling,
                              "province_abbreviation": StateBillingShort
                  }
                  result.BillingInfo.CountryJson = JSON.stringify(result.BillingInfo.Country)
                  result.BillingInfo.StateJson = JSON.stringify(result.BillingInfo.State)


                  result.ShippingInfo.isBilling = false;
                  result.BillingInfo.FullName = [row.FirstNameBilling, row.LastNameBilling].join(' ');
                  result.ShippingInfo.Country = {
                              "country_name": CountryShipping,
                              "country_abbreviation": CountryShippingShort
                  }
                  result.ShippingInfo.State = {
                              "province_name": StateShipping,
                              "province_abbreviation": StateShippingShort
                  }
                  result.ShippingInfo.CountryJson = JSON.stringify(result.ShippingInfo.Country)
                  result.ShippingInfo.StateJson = JSON.stringify(result.ShippingInfo.State)
	          return result;
		}
	},
	'pd' : {
		map: {
		    "id": ProfileName,
		    "title": FriendlyName,
		    "email": Email,
		    "limit": {type:'default', value: false},
		    "match": {type:'default', value: true},
		    "billing": { type:'subset', items: {
		      "firstName": FirstNameBilling,
		      "lastName": LastNameBilling,
		      "address1": Address1Billing,
		      "address2": Address2Billing,
		      "city": CityBilling,
		      "state": StateBilling,
		      "zipcode": ZipCodeBilling,
		      "country": CountryBilling,
		      "phone": PhoneBilling,
		    	}
		    },
		    "shipping": { type:'subset', items: {
		      "firstName": FirstNameShipping,
		      "lastName": LastNameShipping,
		      "address1": Address1Shipping,
		      "address2": Address2Shipping,
		      "city": CityShipping,
		      "state": StateShipping,
		      "zipcode": ZipCodeShipping,
		      "country": CountryShipping,
		      "phone": PhoneShipping,
		    	}
		    },
		    "card": { type:'subset', items: {
		      "name": NameOnCard,
		      "number": CardNumber,
		      "expire": '',
		      "code": CardSecurityCode
		    	}
		    }
		},
		intoDefault: (row, format) => {
		  const result = simpleRemapInto(row, format);
	          const[cardExpirationMonth, cardExpirationYear] = `${_.get(row, 'card.expire', '')}/`.split('/');
                  result[CardExpirationMonth] = cardExpirationMonth;
                  result[CardExpirationYear] = cardExpirationYear;
                  return result;
		},
		fromDefault: (row, format) => {
		  const result = simpleRemapFrom(row, format);
                  _.set(result, 'card.expire', [_.get(row, 'CardExpirationMonth',''),_.get(row, 'CardExpirationYear','')].join('/'))
	          return result;
		}
	},
	'phantom' : {
		map: {
		    "Billing": {
		      "Address": Address1Billing,
		      "Apt": Address2Billing,
		      "City": CityBilling,
		      "FirstName": FirstNameBilling,
		      "LastName": LastNameBilling,
		      "State": StateBilling,
		      "Zip": ZipCodeBilling,
		    },
		    "CCNumber": CardNumber,
		    "CVV": CardSecurityCode,
		    "CardType": CardType,
		    "Country": CountryBilling,
		    "Email": Email,
		    "ExpMonth": CardExpirationMonth,
		    "ExpYear": CardExpirationYear,
		    "Name": NameOnCard,
		    "Phone": PhoneBilling,
		    "Same": ShippingAsBilling,
		    "Shipping": {
		      "Address": Address1Shipping,
		      "Apt": Address2Shipping,
		      "City": CityShipping,
		      "FirstName": FirstNameShipping,
		      "LastName": LastNameShipping,
		      "State": StateShipping,
		      "Zip": ZipCodeShipping,
		    }
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'prism' : {
		map: {
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'profiles' : {
		map: {
		  "country":CountryShipping,
		  "profileNickname":ProfileName,
		  "city":CityShipping,
		  "cardType":CardType,
		  "fullName":FriendlyName,
		  "adr1":Address1Shipping,
		  "adr2":Address2Shipping,
		  "adr3":Address3Shipping,
		  "cardNo":CardNumber,
		  "cvc":CardSecurityCode,
		  "expMo":CardExpirationMonth,
		  "expYr":CardExpirationYear,
		  "phone":PhoneShipping,
		  "postCode":ZipCodeShipping,
		  "state":StateShipping,
		  "email":Email,
		  "singleBilling":ShippingAsBilling,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'sneaker_copter' : {
		map: {
			ProfileName,
			CityBilling,
			Address1Shipping,
			Address1Billing,
			StateBilling,
			FirstNameBilling,
			LastNameBilling,
			PhoneBilling,
			ZipCodeBilling,
			CountryBilling,
			CardSecurityCode,
			CardNumber,
			CardExpirationMonth,
			CardExpirationYear,
			Email,
			CountryBillingShort,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'sole_terminator' : {
		map: {
	    	"profilename": ProfileName,
		    "firstname": FirstNameShipping,
		    "lastname": LastNameShipping,
		    "address1":Address1Shipping,
		    "address2":Address2Shipping,
		    "country":CountryShipping,
		    "countrycode":ZipCodeShipping,
		    "state":StateShipping,
		    "statecode":StateShipping,
		    "city":CityShipping,
		    "zip":ZipCodeShipping,
		    "phone":PhoneShipping,
		    "cardholder":NameOnCard,
		    "cardnumber":CardNumber,
		    "cvv":CardSecurityCode,
		    "email":Email,
		    "month":CardExpirationMonth,
		    "year":CardExpirationYear,
		    "billingfirstname":FirstNameBilling,
		    "billinglastname":LastNameBilling,
		    "billingaddress1":Address1Billing,
		    "billingaddress2":Address2Billing,
		    "billingcountry":CountryBilling,
		    "billingcountrycode":CountryBilling,
		    "billingstate":StateBilling,
		    "billingstatecode":ZipCodeBilling,
		    "billingcity":CityBilling,
		    "billingzip":ZipCodeBilling,
		    "billingphone":PhoneBilling,
		    "differentbilling":ShippingAsBilling,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'soleaio' : {
		map: {
		    "ID":'',
		    "ProfileName":ProfileName,
		    "Email":Email,
		    "Phone":PhoneShipping,
		    "ShippingFirstName":FirstNameShipping,
		    "ShippingLastName":LastNameShipping,
		    "ShippingAddress1":Address1Shipping,
		    "ShippingAddress2":Address2Shipping,
		    "ShippingCity":CityShipping,
		    "ShippingZip":ZipCodeShipping,
		    "ShippingCountry":CountryShipping,
		    "ShippingState":StateShipping,
		    "UseBilling":ShippingAsBilling,
		    "BillingFirstName":FirstNameBilling,
		    "BillingLastName":LastNameBilling,
		    "BillingAddress1":Address1Billing,
		    "BillingAddress2":Address2Billing,
		    "BillingCity":CityBilling,
		    "BillingZip":ZipCodeBilling,
		    "BillingCountry":CountryBilling,
		    "BillingState":StateBilling,
		    "CardNumber":CardNumber,
		    "CardName":NameOnCard,
		    "CardCvv":CardSecurityCode,
		    "CardExpiryMonth":CardExpirationMonth,
		    "CardExpiryYear":CardExpirationYear,
		    "CardType":CardType,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'whatbot' : {
		map: {
		    "_id": Empty,
		    "name": ProfileName,
		    "qtEmail": BillingEmail,
		    "qtPassword": Empty,
		    "diffBilling": ShippingAsBilling,
		    "firstName": FirstNameShipping,
		    "lastName": LastNameShipping,
		    "address": Address1Shipping,
		    "address2": Address2Shipping,
		    "city": CityShipping,
		    "state": StateShipping,
		    "country": CountryShipping,
		    "zipCode": ZipCodeShipping,
		    "phone": PhoneShipping,
		    "firstNameB": FirstNameBilling,
		    "lastNameB": LastNameBilling,
		    "addressB": Address1Billing,
		    "address2B": Address2Billing,
		    "cityB": CityBilling,
		    "zipCodeB": ZipCodeBilling,
		    "phoneB": PhoneBilling,
		    "email": Email,
		    "cardNumber": CardNumber,
		    "cardName": NameOnCard,
		    "cardMonth": CardExpirationMonth,
		    "cardYear": CardExpirationYear,
		    "cardCvv": CardSecurityCode,
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'yitan' : {
		map:{
			id: Empty,
		    profile_name: ProfileName,
		    billing_name: LastNameBilling,
		    order_email: Email,
		    order_address: Address1Shipping,
		    order_address_2: Address2Shipping,
		    order_tel: PhoneShipping,
		    order_billing_zip: ZipCodeBilling,
		    order_billing_city: CityBilling,
		    area: CountryShipping,
		    order_billing_state: StateBilling,
		    order_billing_country: CountryBilling,
		    card_type: CardType,
		    cnb: CardNumber,
		    month: CardExpirationMonth,
		    year: CardExpirationYear,
		    vval: CardSecurityCode
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	},
	'NSB' : {
		map: {
		    "shipping": { type:'subset', items: {
		      "firstname": FirstNameShipping,
		      "lastname": LastNameShipping,
		      "country": CountryShipping,
		      "city": CityShipping,
		      "address": Address1Shipping,
		      "address2": Address2Shipping,
		      "state": StateShipping,
		      "zip": ZipCodeShipping,
		      "phone": PhoneShipping,
		      }
		    },
		    "billing": { type:'subset', items: {
		      "firstname": FirstNameBilling,
		      "lastname": LastNameBilling,
		      "country": CountryBilling,
		      "city": CityBilling,
		      "address": Address1Billing,
		      "address2": Address2Billing,
		      "state": StateBilling,
		      "zip": ZipCodeBilling,
		      "phone": PhoneBilling,
		      }
		    },
		    "name": ProfileName,
		    "cc": { type:'subset', items: {
		      "number":  CardNumber,
		      "expiry": '',
		      "cvc": CardSecurityCode,
		      "name": CardSecurityCode
		      }
		    },
		    "email": Email,
		    "checkoutLimit": MaxCheckouts,
		    "billingSame": ShippingAsBilling,
		    "date": ''
		},
		intoDefault: (row, format) => {
		  const result = simpleRemapInto(row, format);
                  const [cardExpirationMonth, cardExpirationYear] = `${_.get(row, 'cc.expiry', '')}/`.split('/');
                  result[CardExpirationMonth] = cardExpirationMonth;
                  result[CardExpirationYear] = cardExpirationYear;
                  return result;
		},
		fromDefault: (row, format) => {
		  const result = simpleRemapFrom(row, format);
                  _.set(result, 'cc.expiry', [_.get(row, 'CardExpirationMonth',''),_.get(row, 'CardExpirationYear','')].join('/'))
                  _.set(result, 'date', Date.now() );
	          return result;
		}
	},
	'TKS' : {
		map: {
	      "Id": Empty,
	      "Name": ProfileName,
	      "Billing": { type:'subset', items: {
	        "Email": Email,
	        "FirstName": FirstNameBilling,
	        "Lastname": LastNameBilling,
	        "AddressLine1": Address1Billing,
	        "AddressLine2": Address2Billing,
	        "Zip": ZipCodeBilling,
	        "City": CityBilling,
	        "CountryCode": CountryBilling,
	        "StateCode": StateBilling,
	        "Phone": PhoneBilling,
	      	}
	      },
	      "Shipping": { type:'subset', items: {
	        "Email": ShippingEmail,
	        "FirstName": FirstNameShipping,
	        "Lastname": LastNameShipping,
	        "AddressLine1": Address1Shipping,
	        "AddressLine2": Address2Shipping,
	        "Zip": ZipCodeShipping,
	        "City": CityShipping,
	        "CountryCode": CountryShipping,
	        "StateCode": StateShipping,
	        "Phone": PhoneShipping,
	      	}
	      },
	      "Payment": { type:'subset', items: {
	        "CardHolder": NameOnCard,
	        "CardNumber": CardNumber,
	        "ExpirationMonth": CardExpirationMonth,
	        "ExpirationYear": CardExpirationYear,
	        "SecurityCode": CardSecurityCode,
	        "CardType": CardType
	      	}
	      },
	      "Options": { type:'subset', items: {
	        "UseBillingForShipping": ShippingAsBilling
	        }
	  	  }
		},
		unpack: data => data.Profiles,
		pack: data => {return {
			  "Profiles": data
			}
		},
		intoDefault: simpleRemapInto,
		fromDefault: simpleRemapFrom,
	}
}
