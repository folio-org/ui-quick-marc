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
      name: 'Positive/negative aspect',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Dimensions',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Reduction ratio range/Reduction ratio',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Color',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Emulsion on film',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Generation',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Base of film',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const MicroformDescriptionField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MicroformDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

MicroformDescriptionField.displayName = 'MicroformDescriptionField';

export default MicroformDescriptionField;
