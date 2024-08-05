import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { TYPE_SELECT_FIELD_PROPS } from './constants';
import { BytesField } from '../BytesField';
import useSelectField from '../useSelectField';
import getMaterialCharsFieldConfig from './getMaterialCharsFieldConfig';
import { QuickMarcContext } from '../../../contexts';

const propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  fieldId: PropTypes.string.isRequired,
};

const MaterialCharsField = ({ fieldId, name, type }) => {
  const { validationErrorsRef } = useContext(QuickMarcContext);
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  const errors = validationErrorsRef.current[fieldId];

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
      error={errors}
    />
  );
};

MaterialCharsField.propTypes = propTypes;

export { MaterialCharsField };
