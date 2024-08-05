import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { BytesField } from '../BytesField';
import { QuickMarcContext } from '../../../contexts';

const FixedField = ({ fieldId, name, config }) => {
  const { validationErrorsRef } = useContext(QuickMarcContext);

  const errors = validationErrorsRef.current[fieldId];

  return (
    <BytesField
      name={name}
      config={config}
      fieldId={fieldId}
      error={errors}
    />
  );
};

FixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  fieldId: PropTypes.string.isRequired,
};

export default FixedField;
