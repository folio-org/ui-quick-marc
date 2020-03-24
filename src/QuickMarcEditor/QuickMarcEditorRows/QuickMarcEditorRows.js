import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';

import {
  TextField,
  IconButton,
} from '@folio/stripes/components';

import {
  isReadOnly,
  hasIndicatorException,
  isCannotAddAfterOrDuplicateRow,
} from './utils';
import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({ fields }) => {
  const values = fields.value;

  return (
    <>
      {
        fields.map((field, idx) => {
          const recordRow = values[idx];

          const isDisabled = isReadOnly(recordRow);
          const withIndicators = !hasIndicatorException(recordRow);
          const IsAvalibleToAddAfter = isCannotAddAfterOrDuplicateRow(recordRow);

          return (
            <div
              key={recordRow.id}
              className={styles.quickMarcEditorRow}
              data-testid="quick-marc-editorid"
            >
              <div className={styles.quickMarcEditorRowTag}>
                <Field
                  name={`${field}.tag`}
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
                      name={`${field}.indicators[0]`}
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
                      name={`${field}.indicators[1]`}
                      component={TextField}
                      marginBottom0
                      fullWidth
                      disabled={isDisabled}
                    />
                  )
                }
              </div>
              <div className={styles.quickMarcEditorRowContent}>
                <Field
                  name={`${field}.content`}
                  component={TextField}
                  marginBottom0
                  fullWidth
                  disabled={isDisabled}
                />
              </div>
              <div className={styles.quickMarcEditorActions}>
                {
                  !IsAvalibleToAddAfter &&
                    <IconButton
                      data-test-add-row
                      icon="plus-sign"
                      onClick={() => {
                        fields.insert(idx + 1, {});
                      }}
                    />
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
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    insert: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      indicators: PropTypes.arrayOf(PropTypes.string),
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    })),
  }),
};

export default QuickMarcEditorRows;
