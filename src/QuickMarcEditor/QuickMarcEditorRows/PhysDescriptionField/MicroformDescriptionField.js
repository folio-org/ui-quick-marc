import React from 'react';
import PropTypes from 'prop-types';

import {
  CATEGORY_SELECT_FIELD_PROPS,
  STANDARD_PHYS_DESCR_FIELDS,
} from './constants';
import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useSelectField from '../useSelectField';

const configFields = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Positive/negative aspect',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Reduction ratio range/Reduction ratio',
    type: SUBFIELD_TYPES.STRING,
  },
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Emulsion on film',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Generation',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Base of film',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const MicroformDescriptionField = ({ name }) => {
  const selectField = useSelectField(CATEGORY_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="microform-phys-description-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

MicroformDescriptionField.propTypes = {
  name: PropTypes.string.isRequired,
};

MicroformDescriptionField.configFields = configFields;

export default MicroformDescriptionField;
