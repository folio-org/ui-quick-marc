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
      type: SUBFIELD_TYPES.BYTE,
      name: 'Altitude of sensor',
    },
    {
      name: 'Attitude of sensor',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Cloud cover',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Platform construction type',
    },
    {
      name: 'Platform use category',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Sensor type',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'Data type',
    },
  ],
};

const RSImagePhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

RSImagePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

RSImagePhysDescriptionField.displayName = 'RSImagePhysDescriptionField';

export default RSImagePhysDescriptionField;
