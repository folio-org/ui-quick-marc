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

const MusicPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MusicPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

MusicPhysDescriptionField.displayName = 'MusicPhysDescriptionField';

export default MusicPhysDescriptionField;
