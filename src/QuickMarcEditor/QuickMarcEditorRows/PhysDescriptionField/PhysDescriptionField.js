import React from 'react';
import PropTypes from 'prop-types';

import { CATEGORY_SELECT_FIELD_PROPS } from './constants';
import { BytesField } from '../BytesField';
import useSelectField from '../useSelectField';
import getPhysDescriptionFieldConfig from './getPhysDescriptionFieldConfig';

const propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const PhysDescriptionField = ({ name, type }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

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
    />
  );
};

PhysDescriptionField.propTypes = propTypes;

export { PhysDescriptionField };
