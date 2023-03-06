import React, {
  useRef,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
  HasCommand,
} from '@folio/stripes/components';

import { useSubfieldNavigation } from '../../../hooks';
import {
  getResizeStyles,
} from './utils';

export const ContentField = ({
  input,
  id,
  ...props
}) => {
  const ref = useRef();

  const {
    keyCommands,
    processSubfieldFocus,
  } = useSubfieldNavigation();

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
    <HasCommand commands={keyCommands}>
      <TextArea
        {...props}
        input={input}
        inputRef={ref}
        data-testid={id}
        onFocus={processSubfieldFocus}
      />
    </HasCommand>
  );
};

ContentField.propTypes = {
  id: PropTypes.string.isRequired,
  input: PropTypes.shape({
    value: PropTypes.string,
  }),
};
