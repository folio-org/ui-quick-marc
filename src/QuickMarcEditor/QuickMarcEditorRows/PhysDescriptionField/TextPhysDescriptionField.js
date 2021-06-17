import React from 'react';
import PropTypes from 'prop-types';

import {
  CATEGORY_SELECT_FIELD_PROPS,
  STANDARD_PHYS_DESCR_FIELDS,
} from './constants';
import {
  BytesField,
} from '../BytesField';
import useSelectField from '../useSelectField';

const configFields = [...STANDARD_PHYS_DESCR_FIELDS];

const TextPhysDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="text-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

TextPhysDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default TextPhysDescriptionField;
