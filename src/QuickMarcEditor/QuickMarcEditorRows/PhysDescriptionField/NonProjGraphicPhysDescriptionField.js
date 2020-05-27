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
      name: 'Primary support material',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Secondary support material',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const NonProjGraphicPhysDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

NonProjGraphicPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

NonProjGraphicPhysDescriptionField.displayName = 'NonProjGraphicPhysDescriptionField';

export default NonProjGraphicPhysDescriptionField;
