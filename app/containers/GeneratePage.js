import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import lightPicture from '../../resources/generate.png';
import darkPicture from '../../resources/generate_dark.png';

const mapStateToProps = (state) => ({
  settings: state.settings,
});

const propTypes = {
  settings: PropTypes.shape({
    theme: PropTypes.string.isRequired,
  }).isRequired,
}

const GeneratePage = (props) => {
  const getSrc = () => {
    const { settings } = props;
    if (settings.theme === "dark") {
      return darkPicture;
    }
    return lightPicture;
  }

  return (
    <div>
      {
        <img 
          src={getSrc()} 
          alt="generate-theme"
          style={{ width: '100%' }} 
        />
      }
    </div>
  );
};

GeneratePage.propTypes = propTypes;


export default connect(
  mapStateToProps
)(GeneratePage);
