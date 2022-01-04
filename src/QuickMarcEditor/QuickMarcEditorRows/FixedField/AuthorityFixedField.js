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
      name: 'Geo Subd',
    },
    {
      name: 'Roman',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Lang',
    },
    {
      name: 'Kind rec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Cat Rules',
    },
    {
      name: 'SH Sys',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Series',
    },
    {
      name: 'Numb Series',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Main use',
    },
    {
      name: 'Subj use',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Series use',
    },
    {
      name: 'Type Subd',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Govt Ag',
    },
    {
      name: 'RefEval',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'RecUpd',
    },
    {
      name: 'Pers Name',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Level Est',
    },
    {
      name: 'Mod Rec Est',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Source',
    },
  ],
};

const AuthorityFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

AuthorityFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

AuthorityFixedField.displayName = 'AuthorityFixedField';
AuthorityFixedField.configFields = config.fields;

export default AuthorityFixedField;
