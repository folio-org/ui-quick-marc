import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

const configFields = [
  {
    name: 'Audn',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'File',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const ComputerFileMaterialCharsField = ({ name }) => {
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      config={{
        fields: [
          ...standardFields,
          ...configFields,
        ],
      }}
    />
  );
};

ComputerFileMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

ComputerFileMaterialCharsField.displayName = 'ComputerFileMaterialCharsField';

export default ComputerFileMaterialCharsField;
