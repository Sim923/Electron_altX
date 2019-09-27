// @flow
import { connect } from "react-redux";
import { PROXY } from "../reducers/types";
import Proxy from "../components/Proxy";

function mapStateToProps(state) {
  return {
    settings: state.settings,
    accounts: state.accounts.accountList,
    proxies: state.proxies.proxyList,
    changed: state.proxies.changed,
    editingKey: state.proxies.editingKey,
    addedRows: state.proxies.addedRows,
    confirmLoading: state.proxies.confirmLoading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeField: (key, field, value) => {
      dispatch({ type: PROXY.CHANGEFIELD, key, field, value });
    },
    changeRow: (key, row) => {
      dispatch({ type: PROXY.CHANGEROW, key, row });
    },
    addRow: newProxies => {
      dispatch({ type: PROXY.ADDROW, newProxies });
    },
    deleteRow: key => {
      dispatch({ type: PROXY.DELETEROW, key });
    },
    setEditingKey: editingKey => {
      dispatch({ type: PROXY.SETEDITINGKEY, editingKey });
    },
    checkValidation: (proxies, adding) => {
      dispatch({ type: PROXY.CHECKVALID_REQUEST, proxies, adding });
    },
    changeAddedRows: () => {
      dispatch({ type: PROXY.CHANGEADDED });
    },
    cancelCheck: () => {
      dispatch({ type: PROXY.CANCEL_CHECK });
    },
    deleteAll: badOnly => {
      dispatch({ type: PROXY.DELETEALL, badOnly });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Proxy);
