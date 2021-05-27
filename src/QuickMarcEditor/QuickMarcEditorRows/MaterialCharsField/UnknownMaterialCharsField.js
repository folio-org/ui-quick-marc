import React from 'react';
import PropTypes from 'prop-types';

import { BytesField } from '../BytesField';
import useStandardFields from './useStandardFields';

const UnknownMaterialCharsField = ({ name }) => {
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      id="unknown-material-chars-field"
      config={{
        fields: standardFields,
      }}
    />
  );
};

UnknownMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default UnknownMaterialCharsField;
