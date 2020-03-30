import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';

import {
  TextField,
} from '@folio/stripes/components';

import { FixedFieldFactory } from './FixedField';
import {
  isReadOnly,
  hasIndicatorException,
} from './utils';
import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({ name, fields }) => {
  return (
    <>
      {
        fields.map((recordRow, idx) => {
          const isDisabled = isReadOnly(recordRow);
          const withIndicators = !hasIndicatorException(recordRow);

          return (
            <div
              key={recordRow.id}
              className={styles.quickMarcEditorRow}
              data-test-quick-marc-editor-row
              data-testid="quick-marc-editorid"
            >
              <div className={styles.quickMarcEditorRowTag}>
                <Field
                  name={`${name}[${idx}].tag`}
                  component={TextField}
                  marginBottom0
                  fullWidth
                  disabled={isDisabled}
                />
              </div>
              <div className={styles.quickMarcEditorRowIndicator}>
                {
                  withIndicators && (
                    <Field
                      name={`${name}[${idx}].indicators[0]`}
                      component={TextField}
                      marginBottom0
                      fullWidth
                      disabled={isDisabled}
                    />
                  )
                }
              </div>
              <div className={styles.quickMarcEditorRowIndicator}>
                {
                  withIndicators && (
                    <Field
                      name={`${name}[${idx}].indicators[1]`}
                      component={TextField}
                      marginBottom0
                      fullWidth
                      disabled={isDisabled}
                    />
                  )
                }
              </div>
              <div className={styles.quickMarcEditorRowContent}>
                {
                  recordRow.tag === '008'
                    ? FixedFieldFactory.getFixedField(
                      `${name}[${idx}].content`, recordRow.content.Type, recordRow.content.BLvl,
                    )
                    : (
                      <Field
                        name={`${name}[${idx}].content`}
                        component={TextField}
                        marginBottom0
                        fullWidth
                        disabled={isDisabled}
                      />
                    )
                }
              </div>
            </div>
          );
        })
      }
    </>
  );
};

QuickMarcEditorRows.propTypes = {
  name: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  })),
};

export default QuickMarcEditorRows;
