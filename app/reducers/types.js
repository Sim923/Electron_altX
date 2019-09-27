const createActionTypes = (base, actions = []) =>
  actions.reduce((acc, type) => {
    acc[type] = `${base}_${type}`;

    return acc;
  }, {});

export const ACCOUNT = createActionTypes("ACCOUNT", [
  "CHANGEFIELD",
  "CHANGEROW",
  "ADDROW",
  "DELETEROW",
  "SETEDITINGKEY",
  "CHECKVALID_REQUEST",
  "CHECKVALID_END",
  "CHANGEADDED",
  "CANCEL_CHECK",
  "START_TASK",
  "STOP_TASK",
  "CHANGECATEGORY",
  "CHANGEONECLICK",
  "DELETEALL"
]);

export const PROXY = createActionTypes("PROXY", [
  "CHANGEFIELD",
  "CHANGEROW",
  "ADDROW",
  "DELETEROW",
  "SETEDITINGKEY",
  "CHECKVALID_REQUEST",
  "CHECKVALID_END",
  "CHANGEADDED",
  "CANCEL_CHECK",
  "DELETEALL"
]);

export const SETTINGS = createActionTypes("SETTINGS", [
  "SETTHEME",
  "SETNAVIGATION",
  "SETDURATION",
  "SETMAXPROFILE",
  "SETCHECK",
  "CHANGEALL",
  "SETTARGETS"
]);

export const BILLING = createActionTypes("BILLINGS", [
  "ADDACCOUNT",
  "DELETEACCOUNT",
  "EDITACCOUNT",
  "DELETE_ALL"
]);

export default {
  ACCOUNT,
  PROXY,
  SETTINGS,
  BILLING
};
