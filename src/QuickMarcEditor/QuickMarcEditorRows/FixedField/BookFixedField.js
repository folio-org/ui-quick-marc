import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { BOOK_CONFIG } from './constants';

const BookFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-book-fixed-field
      name={name}
      config={BOOK_CONFIG}
    />
  );
};

BookFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

BookFixedField.displayName = 'BookFixedField';

export default BookFixedField;
