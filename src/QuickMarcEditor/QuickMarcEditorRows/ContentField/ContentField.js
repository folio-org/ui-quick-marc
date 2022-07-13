import React, {
  useRef,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  TextArea,
  IconButton,
  Tooltip,
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
  const intl = useIntl();
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
        <Tooltip
          text={intl.formatMessage({ id: 'ui-quick-marc.record.splitSubfields' })}
        >
          {({ ref: tooltipText, ariaIds }) => (
            <IconButton
              icon="source"
              ref={tooltipText}
              aria-labelledby={ariaIds.text}
              className={styles.splitButton}
              onClick={splitField}
            />
          )}
        </Tooltip>
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
