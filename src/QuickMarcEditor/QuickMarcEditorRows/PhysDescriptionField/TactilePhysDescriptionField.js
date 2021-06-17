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
];

const TactilePhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="tactile-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

TactilePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default TactilePhysDescriptionField;
