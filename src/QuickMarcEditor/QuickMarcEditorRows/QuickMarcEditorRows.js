import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';

import {
  TextField,
  IconButton,
} from '@folio/stripes/components';

import { FixedFieldFactory } from './FixedField';
import {
  isReadOnly,
  hasIndicatorException,
  hasAddException,
} from './utils';
import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({ name, fields, mutators: { addRecord } }) => {
  const addNewRow = useCallback(({ target }) => {
    addRecord({ index: +target.dataset.index });
  }, [addRecord]);

  return (
    <>
      {
        fields.map((recordRow, idx) => {
          const isDisabled = isReadOnly(recordRow);
          const withIndicators = !hasIndicatorException(recordRow);
          const withAddRowAction = hasAddException(recordRow);

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
                  disabled={isDisabled || !idx}
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
              <div className={styles.quickMarcEditorActions}>
                {
                  !withAddRowAction &&
                    <IconButton
                      data-test-add-row
                      data-index={idx}
                      icon="plus-sign"
                      onClick={addNewRow}
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
  name: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  })),
  mutators: PropTypes.shape({
    addRecord: PropTypes.func.isRequired,
  }),
};

export default QuickMarcEditorRows;
