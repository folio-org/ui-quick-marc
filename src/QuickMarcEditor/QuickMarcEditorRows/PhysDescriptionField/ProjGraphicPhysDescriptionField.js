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
  ],
};

const ProjGraphicPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ProjGraphicPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

ProjGraphicPhysDescriptionField.displayName = 'ProjGraphicPhysDescriptionField';

export default ProjGraphicPhysDescriptionField;
