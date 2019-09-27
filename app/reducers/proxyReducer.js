// @flow
import { PROXY } from "./types";

const initialState = {
  proxyList: [],
  changed: false,
  editingKey: -1,
  addedRows: false,
  confirmLoading: false
};

export default function proxyReducer(state = initialState, action) {
  const data = state.proxyList;
  const { key, field, value, row } = action;
  let index;

  switch (action.type) {
    case PROXY.SETEDITINGKEY:
      return { ...state, editingKey: action.editingKey };
    case PROXY.CHANGEFIELD: {
      index = data.findIndex(item => item.key === key);
      if (field.startsWith("validation")) {
        const val_index = parseInt(field[field.length - 1], 10);
        data[index].validation[val_index] = value;
      } else {
        data[index][field] = value;
      }
      return { ...state, proxyList: data, changed: !state.changed };
    }
    case PROXY.CHANGEROW: {
      index = data.findIndex(item => item.key === key);
      data.splice(index, 1, {
        ...data[index],
        ...row
      });
      return { ...state, proxyList: data, changed: !state.changed };
    }
    case PROXY.CHECKVALID_REQUEST:
      return { ...state, addedRows: false, confirmLoading: action.adding };
    case PROXY.CHECKVALID_END: {
      if (action.adding) {
        let newkey = data && data.length > 0 ? data[0].key : -1;
        const newProxies = action.newProxies.reverse();
        newProxies.forEach(proxy => {
          if (data.findIndex(prx => prx.ipaddr === proxy.ipaddr) === -1) {
            newkey += 1;
            const newRow = {
              key: newkey,
              ipaddr: proxy.ipaddr,
              port: proxy.port,
              username: proxy.username || "",
              password: proxy.password || "",
              validation: [true, true],
              edit: true,
              speed: proxy.speed
            };
            data.unshift(newRow);
          }
        });
        return {
          ...state,
          addedRows: true,
          confirmLoading: false,
          proxyList: data
        };
      }

      index = data.findIndex(item => item.key === key);
      if (data[index].validation[0] || index === -1) return state;
      data[index].validation[0] = true;
      data[index].validation[1] = action.valid !== "bad";
      data[index].speed = action.valid;
      return { ...state, proxyList: data, changed: !state.changed };
    }
    case PROXY.CANCEL_CHECK:
      return { ...state, confirmLoading: false };
    case PROXY.CHANGEADDED:
      return { ...state, addedRows: false };
    case PROXY.DELETEROW: {
      index = data.findIndex(item => item.key === key);
      data.splice(index, 1);
      return {
        ...state,
        proxyList: data,
        changed: !state.changed,
        editingKey: -1
      };
    }
    case PROXY.DELETEALL: {
      if (action.badOnly) {
        return {
          ...state,
          proxyList: data.filter(prx => prx.validation[1] === true),
          changed: !state.changed
        };
      }
      return { ...state, proxyList: [], changed: !state.changed };
    }
    default:
      return state;
  }
}
