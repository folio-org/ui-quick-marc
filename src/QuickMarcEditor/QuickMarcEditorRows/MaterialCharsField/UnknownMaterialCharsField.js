import React from 'react';
import PropTypes from 'prop-types';

import { BytesField } from '../BytesField';
import useStandardFields from './useStandardFields';

const UnknownMaterialCharsField = ({ name }) => {
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      config={{
        fields: standardFields,
      }}
    />
  );
};

UnknownMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

UnknownMaterialCharsField.displayName = 'UnknownMaterialCharsField';

export default UnknownMaterialCharsField;
