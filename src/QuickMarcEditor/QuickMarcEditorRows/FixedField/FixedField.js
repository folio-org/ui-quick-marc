import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const FixedField = ({ name, config, content }) => {
  const intl = useIntl();
  const { fields } = config;

  const getLabel = (allowedValue) => {
    if (!allowedValue) {
      return '';
    }

    const key = 'ui-quick-marc.record.fixedField';

    const label = intl.formatMessage({ id: `${key}.${allowedValue.name}` });

    return `${allowedValue.code} - ${label}`;
  };

  const fieldsSelect = fields.map((field) => {
    if ((field.type === SUBFIELD_TYPES.SELECT) || (field.type === SUBFIELD_TYPES.SELECTS)) {
      const value = content[field.name];

      return {
        ...field,
        options: field.allowedValues.map(allowedValue => ({ label: getLabel(allowedValue), value: allowedValue.code })),
        value,
      };
    }

    return field;
  });

  config.fields = fieldsSelect;

  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

FixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  content: PropTypes.object,
};

export default FixedField;
