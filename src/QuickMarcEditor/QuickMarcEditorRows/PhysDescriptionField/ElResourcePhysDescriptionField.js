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
      name: 'Dimensions',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Sound',
    },
    {
      name: 'Image bit depth',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'File formats',
    },
    {
      name: 'Quality assurance target(s)',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Antecedent/ Source',
    },
    {
      name: 'Level of compression',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Reformatting quality',
    },
  ],
};

const ElResourcePhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ElResourcePhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

ElResourcePhysDescriptionField.displayName = 'ElResourcePhysDescriptionField';

export default ElResourcePhysDescriptionField;
