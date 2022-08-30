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

import { getResizeStyles } from './utils';

const indexOfRegex = (string, regex) => {
  const match = string.match(regex);

  return match ? string.indexOf(match[0]) : -1;
};

const lastIndexOfRegex = (string, regex) => {
  const match = string.match(regex);

  return match ? string.lastIndexOf(match[match.length - 1]) : -1;
};

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

  const keyCommands = [{
    name: 'nextsubfield',
    handler: (e) => {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const valueAfterCursor = input.value.substring(cursorPosition);

      const nextSubfieldIndex = indexOfRegex(valueAfterCursor, /\$\w\s/g);

      if (nextSubfieldIndex === -1) {
        return;
      }

      const newPosition = nextSubfieldIndex + cursorPosition + 3;

      e.target.setSelectionRange(newPosition, newPosition);
    },
  }, {
    name: 'prevsubfield',
    handler: (e) => {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const startOfCurrentSubfieldPosition = lastIndexOfRegex(input.value.substring(0, cursorPosition), /\$\w\s/g);
      const valueBeforeCurrentSubfield = input.value.substring(0, startOfCurrentSubfieldPosition);

      const prevSubfieldIndex = lastIndexOfRegex(valueBeforeCurrentSubfield, /\$\w\s/g);

      if (prevSubfieldIndex === -1) {
        return;
      }

      const newPosition = prevSubfieldIndex + 3;

      e.target.setSelectionRange(newPosition, newPosition);
    },
  }];

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
