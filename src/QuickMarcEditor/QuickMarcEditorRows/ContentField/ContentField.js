import React, {
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
} from '@folio/stripes/components';

import { getResizeStyles } from './utils';

export const ContentField = ({
  input,
  id,
  ...props
}) => {
  const ref = useRef();

  const processSubfieldFocus = useCallback(({ target }) => {
    const end = target.value.length;

    target.setSelectionRange(end, end);
  }, []);

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
      data-testid={id}
      onFocus={processSubfieldFocus}
    />
  );
};

ContentField.propTypes = {
  id: PropTypes.string.isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};
