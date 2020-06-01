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

const KitPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

KitPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

KitPhysDescriptionField.displayName = 'KitPhysDescriptionField';

export default KitPhysDescriptionField;
