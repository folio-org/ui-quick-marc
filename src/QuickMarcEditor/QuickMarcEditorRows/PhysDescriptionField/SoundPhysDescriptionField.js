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
  ],
};

const SoundPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

SoundPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundPhysDescriptionField.displayName = 'SoundPhysDescriptionField';

export default SoundPhysDescriptionField;
