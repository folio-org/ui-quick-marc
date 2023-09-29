import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

const BibliographicFixedField = ({ name, config }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

BibliographicFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

BibliographicFixedField.displayName = 'BibliographicFixedField';

export default BibliographicFixedField;
