import React, {
  useRef,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
  IconButton,
} from '@folio/stripes/components';

import { getResizeStyles } from './utils';

import styles from './ContentField.css';
import { getContentSubfieldValue } from '../../utils';

export const ContentField = ({
  input,
  id,
  splitField,
  ...props
}) => {
  const ref = useRef();

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = '0';

      const resizeStyles = getResizeStyles(ref.current);

      Object.keys(resizeStyles).forEach(property => {
        ref.current.style[property] = resizeStyles[property];
      });
    }
  }, [ref, input.value]);

  const showSplitButton = Object.keys(getContentSubfieldValue(input.value)).length > 1;

  return (
    <div className={styles.contentFieldContainer}>
      <TextArea
        {...props}
        input={input}
        inputRef={ref}
        data-testid={id}
      />
      {showSplitButton && (
        <IconButton
          icon="source"
          className={styles.splitButton}
          onClick={splitField}
        />
      )}
    </div>
  );
};

ContentField.propTypes = {
  id: PropTypes.string.isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};
