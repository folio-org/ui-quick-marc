import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { COMPUTER_CONFIG } from './constants';

const ComputerFileFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-computer-file-fixed-field
      name={name}
      config={COMPUTER_CONFIG}
    />
  );
};

ComputerFileFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ComputerFileFixedField.displayName = 'ComputerFileFixedField';

export default ComputerFileFixedField;
