export const setLatestVersion = (version) => (dispatch) => {
  return dispatch({ type: 'SET_LATEST_VERSION', payload: version });
};

export const setMacAddress = (macAddress) => (dispatch) => {
  return dispatch({ type: 'SET_MAC_ADDRESS', payload: macAddress });
};

export const setAuthenticated = (isAuthenticated) => (dispatch) => {
  return dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
};
