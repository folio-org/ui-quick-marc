import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { BytesField } from '../BytesField';
import useSelectField from '../useSelectField';
import { QuickMarcContext } from '../../../contexts';
import getPhysDescriptionFieldConfig from './getPhysDescriptionFieldConfig';
import { CATEGORY_SELECT_FIELD_PROPS } from './constants';

const propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  fieldId: PropTypes.string.isRequired,
};

const PhysDescriptionField = ({ name, type, fieldId }) => {
  const { validationErrorsRef } = useContext(QuickMarcContext);
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  const errors = validationErrorsRef.current[fieldId];

  return (
    <BytesField
      name={name}
      id="phys-description-field"
      config={{
        fields: [
          selectField,
          ...getPhysDescriptionFieldConfig(type),
        ],
      }}
      error={errors}
    />
  );
};

PhysDescriptionField.propTypes = propTypes;

export { PhysDescriptionField };
