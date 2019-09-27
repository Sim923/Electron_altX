import { Map, fromJS } from 'immutable';
 
const defaultState = fromJS({
  isAuthenticated: false,
  latestVersion: '0.0.0',
  macAddress: null,
});

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case 'SET_LATEST_VERSION':
      return state.set('latestVersion', payload);

    case 'SET_MAC_ADDRESS':
      return state.set('macAddress', payload);

    case 'SET_AUTHENTICATED':
      return state.set('isAuthenticated', payload);

    default:
      return state;
  }
};
