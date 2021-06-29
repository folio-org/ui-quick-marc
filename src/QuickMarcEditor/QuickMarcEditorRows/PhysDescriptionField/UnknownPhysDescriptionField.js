import React from 'react';
import PropTypes from 'prop-types';

import {
  CATEGORY_SELECT_FIELD_PROPS,
} from './constants';
import {
  BytesField,
} from '../BytesField';
import useSelectField from '../useSelectField';

const UnknownPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="unknown-phys-description-field"
      config={{
        fields: [selectField],
      }}
    />
  );
};

UnknownPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

UnknownPhysDescriptionField.configFields = [];

export default UnknownPhysDescriptionField;
