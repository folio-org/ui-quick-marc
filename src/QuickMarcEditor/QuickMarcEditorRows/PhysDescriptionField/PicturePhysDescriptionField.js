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
  ],
};

const PicturePhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

PicturePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

PicturePhysDescriptionField.displayName = 'PicturePhysDescriptionField';

export default PicturePhysDescriptionField;
