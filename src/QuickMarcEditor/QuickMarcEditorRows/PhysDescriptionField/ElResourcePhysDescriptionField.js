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
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Dimensions',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Sound',
  },
  {
    name: 'Image bit depth',
    type: SUBFIELD_TYPES.STRING,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'File formats',
  },
  {
    name: 'Quality assurance target(s)',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Antecedent/ Source',
  },
  {
    name: 'Level of compression',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Reformatting quality',
  },
];

const ElResourcePhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="el-resource-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

ElResourcePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ElResourcePhysDescriptionField;
