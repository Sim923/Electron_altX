// @flow
import { connect } from "react-redux";
import { ACCOUNT } from "../reducers/types";
import Account from "../components/Account";

function mapStateToProps(state) {
  return {
    settings: state.settings,
    accounts: state.accounts.accountList,
    proxies: state.proxies.proxyList,
    changed: state.accounts.changed,
    editingKey: state.accounts.editingKey,
    addedRows: state.accounts.addedRows,
    confirmLoading: state.accounts.confirmLoading,
    categories: state.accounts.categories,
    currentCategory: state.accounts.currentCategory
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeField: (key, field, value) => {
      dispatch({ type: ACCOUNT.CHANGEFIELD, key, field, value });
    },
    changeRow: (key, row) => {
      dispatch({ type: ACCOUNT.CHANGEROW, key, row });
    },
    addRow: () => {
      dispatch({ type: ACCOUNT.ADDROW });
    },
    deleteRow: key => {
      dispatch({ type: ACCOUNT.DELETEROW, key });
    },
    deleteAll: () => {
      dispatch({ type: ACCOUNT.DELETEALL });
    },
    setEditingKey: editingKey => {
      dispatch({ type: ACCOUNT.SETEDITINGKEY, editingKey });
    },
    checkValidation: (accounts, proxies) => {
      dispatch({ type: ACCOUNT.CHECKVALID_REQUEST, accounts, proxies });
    },
    changeAddedRows: () => {
      dispatch({ type: ACCOUNT.CHANGEADDED });
    },
    cancelCheck: () => {
      dispatch({ type: ACCOUNT.CANCEL_CHECK });
    },
    startTask: record => {
      dispatch({ type: ACCOUNT.START_TASK, record });
    },
    stopTask: record => {
      dispatch({ type: ACCOUNT.STOP_TASK, record });
    },
    setCurrentCategory: category => {
      dispatch({ type: ACCOUNT.CHANGECATEGORY, category });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Account);
