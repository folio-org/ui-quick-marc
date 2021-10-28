import React from 'react';
import PropTypes from 'prop-types';

import { TYPE_SELECT_FIELD_PROPS } from './constants';
import { BytesField } from '../BytesField';
import useSelectField from '../useSelectField';
import getMaterialCharsFieldConfig from './getMaterialCharsFieldConfig';

const propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const MaterialCharsField = ({ name, type }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="material-chars-field"
      config={{
        fields: [
          selectField,
          ...getMaterialCharsFieldConfig(type),
        ],
      }}
    />
  );
};

MaterialCharsField.propTypes = propTypes;

export { MaterialCharsField };
