// @flow
// import shortid from "shortid";
import { BILLING } from "./types";

const initialState = {
  billingAccounts: [],
  changed: true
};

export default function billingReducer(state = initialState, action) {
  switch (action.type) {
    case BILLING.ADDACCOUNT: {
      const { billingAccounts } = state;
      billingAccounts.push(action.account);
      return { ...state, billingAccounts, changed: !state.changed };
    }
    case BILLING.DELETEACCOUNT: {
      const { billingAccounts } = state;
      const index = billingAccounts.findIndex(
        acc => acc.BillingEmail === action.email
      );
      billingAccounts.splice(index, 1);
      return { ...state, billingAccounts, changed: !state.changed };
    }
    case BILLING.EDITACCOUNT: {
      const { billingAccounts } = state;
      billingAccounts[action.index] = action.account;
      return { ...state, billingAccounts, changed: !state.changed };
    }

    case BILLING.DELETE_ALL:
      return handleDeleteAll(state);

    default:
      return state;
  }
}

const handleDeleteAll = (state) => {
  return {
    ...state,
    billingAccounts: [],
  }
};
