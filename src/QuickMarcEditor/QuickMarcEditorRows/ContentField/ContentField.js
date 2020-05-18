import React, {
  useRef,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
} from '@folio/stripes/components';

import { getResizeStyles } from './utils';

export const ContentField = ({
  input,
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

  return (
    <TextArea
      {...props}
      input={input}
      inputRef={ref}
      data-testid="content-field"
    />
  );
};

ContentField.propTypes = {
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};
