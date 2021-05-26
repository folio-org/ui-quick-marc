import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

const configFields = [
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const MixedMaterialCharsField = ({ name }) => {
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

MixedMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

MixedMaterialCharsField.displayName = 'MixedMaterialCharsField';

export default MixedMaterialCharsField;
