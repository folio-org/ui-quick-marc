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
    name: 'Physical medium',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Type of reproduction',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const GlobePhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="globe-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

GlobePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default GlobePhysDescriptionField;
