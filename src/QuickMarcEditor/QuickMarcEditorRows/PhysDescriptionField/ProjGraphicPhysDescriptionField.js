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
    name: 'Base of emulsion',
  },
  {
    name: 'Sound on medium or separate',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.STRING,
    name: 'Medium for sound',
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Secondary support material',
  },
];

const ProjGraphicPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="proj-graphic-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

ProjGraphicPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ProjGraphicPhysDescriptionField;
