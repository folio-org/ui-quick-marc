import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { SCORE_CONFIG } from './constants';

const ScoreFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-score-fixed-field
      name={name}
      config={SCORE_CONFIG}
    />
  );
};

ScoreFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ScoreFixedField.displayName = 'ScoreFixedField';

export default ScoreFixedField;
