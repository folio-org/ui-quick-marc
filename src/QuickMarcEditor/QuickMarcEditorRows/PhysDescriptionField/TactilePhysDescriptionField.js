import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

import { STANDARD_PHYS_DESCR_FIELDS } from './constants';

const config = {
  fields: [
    ...STANDARD_PHYS_DESCR_FIELDS,
    {
      name: 'Class of braille writing',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Level of contraction',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Braille music format',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Special physical characteristics',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const TactilePhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

TactilePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

TactilePhysDescriptionField.displayName = 'TactilePhysDescriptionField';

export default TactilePhysDescriptionField;
