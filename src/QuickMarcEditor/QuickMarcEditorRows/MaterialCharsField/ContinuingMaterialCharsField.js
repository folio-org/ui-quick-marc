import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

const configFields = [
  {
    name: 'Freq',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Regl',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Orig',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'EntW',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Cont',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'SrTP',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Conf',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Alph',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'S/L',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const ContinuingMaterialCharsField = ({ name }) => {
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      id="continuing-material-chars-field"
      config={{
        fields: [
          ...standardFields,
          ...configFields,
        ],
      }}
    />
  );
};

ContinuingMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ContinuingMaterialCharsField;
