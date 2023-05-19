import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      name: 'Geo Subd',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Roman',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Lang',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Kind rec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Cat Rules',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'SH Sys',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Series',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Numb Series',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Main use',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Subj use',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Series use',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Type Subd',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Govt Ag',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'RefEval',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'RecUpd',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Pers Name',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Level Est',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Mod Rec Est',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Source',
      type: SUBFIELD_TYPES.BYTE,
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
