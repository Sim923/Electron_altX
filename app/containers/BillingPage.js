// @flow
import { connect } from "react-redux";
import { BILLING } from "../reducers/types";
import Billing from "../components/Billing";

function mapStateToProps(state) {
  return {
    billingAccounts: state.billingData.billingAccounts,
    changed: state.billingData.changed,
    settings: state.settings
  };
}

const mapDispatchToProps = (dispatch) => ({
  addAccount: account => {
    dispatch({ type: BILLING.ADDACCOUNT, account });
  },
  deleteAccount: email => {
    dispatch({ type: BILLING.DELETEACCOUNT, email });
  },
  editAccount: (index, account) => {
    dispatch({ type: BILLING.EDITACCOUNT, index, account });
  },
  deleteAll () {
    dispatch({ type: BILLING.DELETE_ALL });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Billing);
