import React, {
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
  HasCommand,
} from '@folio/stripes/components';

import {
  getResizeStyles,
  cursorToNextSubfield,
  cursorToPrevSubfield,
} from './utils';
import { KEYBOARD_COMMAND_NAMES } from '../../../common/constants';

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

  const keyCommands = [{
    name: KEYBOARD_COMMAND_NAMES.NEXT_SUBFIELD,
    handler: cursorToNextSubfield,
  }, {
    name: KEYBOARD_COMMAND_NAMES.PREV_SUBFIELD,
    handler: cursorToPrevSubfield,
  }];

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
