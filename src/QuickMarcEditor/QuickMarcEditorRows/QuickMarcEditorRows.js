import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  TextField,
  IconButton,
  ConfirmationModal,
} from '@folio/stripes/components';
import {
  useModalToggle,
} from '@folio/stripes-acq-components';

import { FixedFieldFactory } from './FixedField';
import {
  isReadOnly,
  hasIndicatorException,
  hasAddException,
  hasDeleteException,
} from './utils';
import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({ name, fields, mutators: { addRecord, deleteRecord } }) => {
  const [isRemoveModalOpened, toggleRemoveModal] = useModalToggle();
  const [removeIndex, setRemoveIndex] = useState();

  const addNewRow = useCallback(({ target }) => {
    addRecord({ index: +target.dataset.index });
  }, [addRecord]);

  const showDeleteConfirmation = useCallback(({ target }) => {
    setRemoveIndex(+target.dataset.index);
    toggleRemoveModal();
  }, [setRemoveIndex]);

  const confirmDeletion = useCallback(() => {
    deleteRecord({ index: removeIndex });
    toggleRemoveModal();
  }, [deleteRecord, toggleRemoveModal, removeIndex]);

  return (
    <>
      {
        fields.map((recordRow, idx) => {
          const isDisabled = isReadOnly(recordRow);
          const withIndicators = !hasIndicatorException(recordRow);
          const withAddRowAction = hasAddException(recordRow);
          const withDeleteRowAction = hasDeleteException(recordRow);

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
                  !withAddRowAction && (
                    <IconButton
                      data-test-add-row
                      data-index={idx}
                      icon="plus-sign"
                      onClick={addNewRow}
                    />
                  )
                }
                {
                  !withDeleteRowAction && (
                    <IconButton
                      data-test-remove-row
                      data-index={idx}
                      icon="trash"
                      onClick={showDeleteConfirmation}
                    />
                  )
                }
              </div>
            </div>
          );
        })
      }
      {isRemoveModalOpened && (
        <ConfirmationModal
          id="delete-row-confirmation"
          confirmLabel={<FormattedMessage id="ui-quick-marc.record.delete.confirmLabel" />}
          message={<FormattedMessage id="ui-quick-marc.record.delete.message" />}
          onCancel={toggleRemoveModal}
          onConfirm={confirmDeletion}
          open
        />
      )}
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
    deleteRecord: PropTypes.func.isRequired,
  }),
};

export default QuickMarcEditorRows;
