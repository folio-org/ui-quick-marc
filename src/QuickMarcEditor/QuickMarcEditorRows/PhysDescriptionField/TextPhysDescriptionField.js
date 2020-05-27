import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

import { STANDARD_PHYS_DESCR_FIELDS } from './constants';

const config = {
  fields: [
    ...STANDARD_PHYS_DESCR_FIELDS,
  ],
};

const TextPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

TextPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

TextPhysDescriptionField.displayName = 'TextPhysDescriptionField';

export default TextPhysDescriptionField;
