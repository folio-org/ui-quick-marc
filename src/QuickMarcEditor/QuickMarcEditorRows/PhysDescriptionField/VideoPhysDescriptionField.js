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
    name: 'Videorecording format',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Sound on medium or separate',
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
];

const VideoPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="video-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

VideoPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

VideoPhysDescriptionField.configFields = configFields;

export default VideoPhysDescriptionField;
