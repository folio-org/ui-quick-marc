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
    name: 'Primary support material',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Secondary support material',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const NonProjGraphicPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="non-proj-graphic-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

NonProjGraphicPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

NonProjGraphicPhysDescriptionField.configFields = configFields;

export default NonProjGraphicPhysDescriptionField;
