import React from 'react';
import PropTypes from 'prop-types';

import {
  CATEGORY_SELECT_FIELD_PROPS,
  STANDARD_PHYS_DESCR_FIELDS,
} from './constants';
import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useSelectField from '../useSelectField';

const configFields = [
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
];

const RSImagePhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="rsimage-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

RSImagePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

RSImagePhysDescriptionField.configFields = configFields;

export default RSImagePhysDescriptionField;
