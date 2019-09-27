// @flow
import { SETTINGS } from "./types";

const initialState = {
  theme: "light",
  navigation: "noside",
  duration: {
    run: {
      min: 45,
      max: 60
    },
    sleep: {
      min: 10,
      max: 20
    }
  },
  maxProfile: 1,
  changed: false,
  gsearch: true,
  youtube: true,
  targets: [
    "https://www.youtube.com/watch?v=xcpJkanHFZk",
    "react",
    "angular",
    "https://www.youtube.com/watch?v=Ke90Tje7VS0",
    "https://www.youtube.com/watch?v=PRQCAL_RMVo",
    "vue",
    "https://www.youtube.com/watch?v=z6hQqgvGI4Y",
    "electron",
    "https://www.youtube.com/watch?v=78tNYZUS-ps"
  ]
};

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case SETTINGS.SETTHEME:
      return { ...state, theme: action.theme };
    case SETTINGS.SETNAVIGATION:
      return { ...state, navigation: action.nav };
    case SETTINGS.SETDURATION: {
      const { duration } = state;
      duration[action.ros][action.which] = action.value;
      return { ...state, duration, changed: !state.changed };
    }
    case SETTINGS.SETMAXPROFILE:
      return { ...state, maxProfile: action.value };
    case SETTINGS.SETCHECK: {
      if (action.which === "gsearch") {
        return { ...state, gsearch: action.value };
      }
      return { ...state, youtube: action.value };
    }
    case SETTINGS.CHANGEALL:
      return {
        ...state,
        duration: action.duration,
        maxProfile: action.maxProfile,
        gsearch: action.gsearch,
        youtube: action.youtube
      };
    case SETTINGS.SETTARGETS:
      return {
        ...state,
        targets: action.targets.split("\n")
      };
    default:
      return state;
  }
}
