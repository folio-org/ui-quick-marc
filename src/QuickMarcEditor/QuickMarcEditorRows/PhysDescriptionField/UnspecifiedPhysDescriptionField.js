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

const UnspecifiedPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

UnspecifiedPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

UnspecifiedPhysDescriptionField.displayName = 'UnspecifiedPhysDescriptionField';

export default UnspecifiedPhysDescriptionField;
