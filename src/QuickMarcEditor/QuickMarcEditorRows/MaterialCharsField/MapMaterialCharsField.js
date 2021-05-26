import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

const configFields = [
  {
    name: 'Relf',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
  },
  {
    name: 'Proj',
    type: SUBFIELD_TYPES.STRING,
    bytes: 2,
  },
  {
    name: 'CrTP',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'SpFm',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
];

const MapMaterialCharsField = ({ name }) => {
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

MapMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapMaterialCharsField.displayName = 'MapMaterialCharsField';

export default MapMaterialCharsField;
