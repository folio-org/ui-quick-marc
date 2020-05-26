import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Audn',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      name: 'File',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'GPub',
    },
  ],
};

const ComputerFileMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ComputerFileMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

ComputerFileMaterialCharsField.displayName = 'ComputerFileMaterialCharsField';

export default ComputerFileMaterialCharsField;
