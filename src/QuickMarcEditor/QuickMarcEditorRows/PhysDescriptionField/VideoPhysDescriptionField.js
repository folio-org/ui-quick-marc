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
  ],
};

const VideoPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

VideoPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

VideoPhysDescriptionField.displayName = 'VideoPhysDescriptionField';

export default VideoPhysDescriptionField;
