import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  TextField,
  IconButton,
} from '@folio/stripes/components';

import { FixedFieldFactory } from '../FixedField';

import styles from './FixedRow.css';

const FixedRow = ({ recordRow, idx, name }) => {
  const [isFieldCollapsed, collapseField] = useState(true);

  const toggleFixedRow = useCallback(() => {
    collapseField(!isFieldCollapsed);
  }, [isFieldCollapsed]);

  return (
    <>
      <div className={styles.fixedFieldCollapseRowAction}>
        <FormattedMessage id="ui-quick-marc.record.collapseRow">
          {ariaLabel => (
            <IconButton
              title={ariaLabel}
              ariaLabel={ariaLabel}
              data-test-collapse-row
              icon={`caret-${isFieldCollapsed ? 'down' : 'up'}`}
              onClick={toggleFixedRow}
            />
          )}
        </FormattedMessage>
      </div>
      <div className={styles.fixedFieldRowTag}>
        <FormattedMessage id="ui-quick-marc.record.field">
          {ariaLabel => (
            <Field
              ariaLabel={ariaLabel}
              name={`${name}[${idx}].tag`}
              component={TextField}
              marginBottom0
              fullWidth
              disabled={!idx}
            />
          )}
        </FormattedMessage>
      </div>
      <div className={styles.fixedFieldRowContent}>
        {
          FixedFieldFactory.getFixedField(
            `${name}[${idx}].content`, recordRow.content.Type, recordRow.content.BLvl, isFieldCollapsed,
          )
        }
      </div>
    </>
  );
};

FixedRow.propTypes = {
  name: PropTypes.string.isRequired,
  recordRow: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
};

export default FixedRow;
