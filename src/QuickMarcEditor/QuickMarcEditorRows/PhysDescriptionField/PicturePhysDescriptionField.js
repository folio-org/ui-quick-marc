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
    name: 'Color',
  },
  {
    name: 'Motion picture presentation format',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Sound on medium or separate',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Medium for sound',
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Configuration of playback channels',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Production elements',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Positive/negative aspect',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Generation',
  },
  {
    name: 'Base of film',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Refined categories of color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Kind of color stock or print',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Deterioration stage',
  },
  {
    name: 'Completeness',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Film inspection date',
    type: SUBFIELD_TYPES.STRING,
  },
];

const PicturePhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="picture-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

PicturePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

PicturePhysDescriptionField.configFields = configFields;

export default PicturePhysDescriptionField;
