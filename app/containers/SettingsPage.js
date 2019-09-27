// @flow
import { connect } from "react-redux";
import { SETTINGS } from "../reducers/types";
import Settings from "../components/Settings";

function mapStateToProps(state) {
  return {
    app: state.app,
    theme: state.settings.theme,
    navigation: state.settings.navigation,
    duration: state.settings.duration,
    maxProfile: state.settings.maxProfile,
    changed: state.settings.changed,
    gsearch: state.settings.gsearch,
    youtube: state.settings.youtube,
    targets: state.settings.targets
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setTheme: theme => {
      dispatch({ type: SETTINGS.SETTHEME, theme });
    },
    setNavigation: nav => {
      dispatch({ type: SETTINGS.SETNAVIGATION, nav });
    },
    changeDuration: (ros, which, value) => {
      dispatch({
        type: SETTINGS.SETDURATION,
        ros,
        which,
        value
      });
    },
    setMaxProfile: value => {
      dispatch({ type: SETTINGS.SETMAXPROFILE, value });
    },
    setCheck: (which, value) => {
      dispatch({ type: SETTINGS.SETCHECK, which, value });
    },
    changeAll: (duration, maxProfile, gsearch, youtube) => {
      dispatch({
        type: SETTINGS.CHANGEALL,
        duration,
        maxProfile,
        gsearch,
        youtube
      });
    },
    setTargets: targets => {
      dispatch({ type: SETTINGS.SETTARGETS, targets });
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
