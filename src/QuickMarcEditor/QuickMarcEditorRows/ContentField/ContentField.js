import React, {
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
} from '@folio/stripes/components';

import { getResizeStyles } from './utils';

export const ContentField = ({
  input,
  id,
  onProcessSubfieldRef,
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

  useEffect(() => {
    if (ref.current && onProcessSubfieldRef) {
      onProcessSubfieldRef(ref.current);
    }
  }, [ref]);

  return (
    <TextArea
      {...props}
      input={input}
      inputRef={ref}
      data-testid={id}
    />
  );
};

ContentField.propTypes = {
  id: PropTypes.string.isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
  onProcessSubfieldRef: PropTypes.func,
};
