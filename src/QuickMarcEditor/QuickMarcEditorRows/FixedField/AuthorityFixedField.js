import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

const AuthorityFixedField = ({ name, config }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

AuthorityFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

AuthorityFixedField.displayName = 'AuthorityFixedField';

export default AuthorityFixedField;
