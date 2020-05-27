import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

import { STANDARD_PHYS_DESCR_FIELDS } from './constants';

const config = {
  fields: [
    STANDARD_PHYS_DESCR_FIELDS[0],
  ],
};

const UnknownPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

UnknownPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

UnknownPhysDescriptionField.displayName = 'UnknownPhysDescriptionField';

export default UnknownPhysDescriptionField;
