import React from 'react';
import PropTypes from 'prop-types';

import {
  TYPE_SELECT_FIELD_PROPS,
} from './constants';
import { BytesField } from '../BytesField';
import useSelectField from '../useSelectField';

const UnknownMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="unknown-material-chars-field"
      config={{
        fields: [selectField],
      }}
    />
  );
};

UnknownMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

UnknownMaterialCharsField.configFields = [];

export default UnknownMaterialCharsField;
