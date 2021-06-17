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
    name: 'Speed',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Configuration of playback channels',
  },
  {
    name: 'Groove width/ groove pitch',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Tape width',
  },
  {
    name: 'Tape configuration',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Kind of disc, cylinder, or tape',
  },
  {
    name: 'Kind of material',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Kind of cutting',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Special playback characteristics',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Capture and storage technique',
  },
];

const SoundPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="sound-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

SoundPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default SoundPhysDescriptionField;
