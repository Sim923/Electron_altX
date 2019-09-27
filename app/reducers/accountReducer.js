// @flow
import { ACCOUNT } from "./types";

const initialState = {
  accountList: [],
  changed: false,
  editingKey: -1,
  addedRows: false,
  confirmLoading: false,
  categories: ["All", "None"],
  currentCategory: "All"
};

export default function accountReducer(state = initialState, action) {
  const data = state.accountList;
  const { key, field, value, row } = action;
  let index;
  const { categories } = state;
  switch (action.type) {
    case ACCOUNT.CHANGECATEGORY:
      return { ...state, currentCategory: action.category };
    case ACCOUNT.SETEDITINGKEY:
      return { ...state, editingKey: action.editingKey };
    case ACCOUNT.CHANGEFIELD: {
      if (action.email)
        index = data.findIndex(item => item.email === action.email);
      else index = data.findIndex(item => item.key === key);

      if (field.startsWith("actions")) {
        data[index].actions[parseInt(field[field.length - 1], 10)] = value;
      } else {
        data[index][field] = value;
      }
      return {
        ...state,
        accountList: data,
        changed: !state.changed
      };
    }
    case ACCOUNT.CHANGEONECLICK: {
      index = data.findIndex(item => item.email === action.email);
      data[index].oneclick += parseFloat(action.value);
      // console.log("change oneclick", data[index].oneclick);
      return {
        ...state,
        accountList: data,
        changed: !state.changed
      };
    }
    case ACCOUNT.CHANGEROW: {
      index = data.findIndex(item => item.key === key);
      data.splice(index, 1, {
        ...data[index],
        ...row
      });
      if (categories.indexOf(row.category) === -1)
        categories.push(row.category);
      return {
        ...state,
        accountList: data,
        changed: !state.changed,
        categories
      };
    }
    case ACCOUNT.DELETEROW: {
      index = data.findIndex(item => item.key === key);
      data.splice(index, 1);
      return {
        ...state,
        accountList: data,
        changed: !state.changed,
        editingKey: -1,
        addingNow: -1
      };
    }
    case ACCOUNT.DELETEALL:
      return { ...state, accountList: [], changed: !state.changed };
    case ACCOUNT.CHECKVALID_REQUEST:
      // console.log("234234234");
      return {
        ...state,
        addedRows: false,
        confirmLoading: true,
        changed: !state.changed
      };
    case ACCOUNT.CHECKVALID_END: {
      let newkey = data && data.length > 0 ? data[0].key : -1;
      const newAccounts = action.newAccounts.reverse();
      // console.log("newaccs", newAccounts);
      newAccounts.forEach(account => {
        if (data.findIndex(acc => acc.email === account.email) === -1) {
          newkey += 1;
          const newRow = {
            key: newkey,
            email: account.email,
            password: account.password,
            recovery: account.recovery ? account.recovery : "",
            proxy: account.proxy,
            category: account.category ? account.category : "None",
            actionlog: "",
            enabled: account.enabled ? account.enabled : true,
            oneclick: account.oneclick ? account.oneclick : 0.0,
            actions: [true, true],
            edit: true
          };
          if (account.category && categories.indexOf(account.category) === -1) {
            categories.push(account.category);
          }
          data.unshift(newRow);
        }
      });
      return {
        ...state,
        addedRows: true,
        confirmLoading: false,
        accountList: data,
        categories
      };
    }
    case ACCOUNT.CANCEL_CHECK:
      return { ...state, confirmLoading: false };
    case ACCOUNT.CHANGEADDED:
      return { ...state, addedRows: false };
    default:
      return state;
  }
}
