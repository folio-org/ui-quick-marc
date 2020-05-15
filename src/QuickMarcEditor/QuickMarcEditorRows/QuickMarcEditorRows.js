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

import { FixedRow } from './FixedRow';
import {
  isReadOnly,
  hasIndicatorException,
  hasAddException,
  hasDeleteException,
  hasMoveException,
  isFixedFieldsRow,
} from './utils';
import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({
  name,
  fields,
  mutators: {
    addRecord,
    deleteRecord,
    moveRecord,
  },
}) => {
  const [isRemoveModalOpened, toggleRemoveModal] = useModalToggle();
  const [removeIndex, setRemoveIndex] = useState();

  const addNewRow = useCallback(({ target }) => {
    addRecord({ index: +target.dataset.index });
  }, [addRecord]);

  const showDeleteConfirmation = useCallback(({ target }) => {
    setRemoveIndex(+target.dataset.index);
    toggleRemoveModal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRemoveIndex]);

  const confirmDeletion = useCallback(() => {
    deleteRecord({ index: removeIndex });
    toggleRemoveModal();
  }, [deleteRecord, toggleRemoveModal, removeIndex]);

  const moveRow = useCallback(({ target }) => {
    moveRecord({
      index: +target.dataset.index,
      indexToSwitch: +target.dataset.indexToSwitch,
    });
  }, [moveRecord]);

  return (
    <>
      {
        fields.map((recordRow, idx) => {
          const isDisabled = isReadOnly(recordRow);
          const withIndicators = !hasIndicatorException(recordRow);
          const withAddRowAction = hasAddException(recordRow);
          const withDeleteRowAction = hasDeleteException(recordRow);
          const withMoveUpRowAction = hasMoveException(recordRow, fields[idx - 1]);
          const withMoveDownRowAction = hasMoveException(recordRow, fields[idx + 1]);
          const isFixedRow = isFixedFieldsRow(recordRow);

          return (
            <div
              key={idx}
              className={styles.quickMarcEditorRow}
              data-test-quick-marc-editor-row
              data-testid="quick-marc-editorid"
            >
              {isFixedRow
                ?
                  <FixedRow
                    recordRow={recordRow}
                    name={name}
                    idx={idx}
                  />
                : (
                  <>
                    <div className={styles.quickMarcEditorMovingRow}>
                      {
                        !withMoveUpRowAction && (
                          <FormattedMessage id="ui-quick-marc.record.moveUpRow">
                            {ariaLabel => (
                              <IconButton
                                title={ariaLabel}
                                ariaLabel={ariaLabel}
                                data-test-move-up-row
                                data-index={idx}
                                data-index-to-switch={idx - 1}
                                icon="arrow-up"
                                onClick={moveRow}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                      {
                        !withMoveDownRowAction && (
                          <FormattedMessage id="ui-quick-marc.record.moveDownRow">
                            {ariaLabel => (
                              <IconButton
                                title={ariaLabel}
                                ariaLabel={ariaLabel}
                                data-test-move-down-row
                                data-index={idx}
                                data-index-to-switch={idx + 1}
                                icon="arrow-down"
                                onClick={moveRow}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                    </div>
                    <div className={styles.quickMarcEditorRowTag}>
                      <FormattedMessage id="ui-quick-marc.record.field">
                        {ariaLabel => (
                          <Field
                            ariaLabel={ariaLabel}
                            name={`${name}[${idx}].tag`}
                            component={TextField}
                            marginBottom0
                            fullWidth
                            disabled={isDisabled || !idx}
                          />
                        )}
                      </FormattedMessage>
                    </div>
                    <div className={styles.quickMarcEditorRowIndicator}>
                      {
                        withIndicators && (
                          <FormattedMessage id="ui-quick-marc.record.indicator">
                            {ariaLabel => (
                              <Field
                                ariaLabel={ariaLabel}
                                name={`${name}[${idx}].indicators[0]`}
                                component={TextField}
                                marginBottom0
                                fullWidth
                                disabled={isDisabled}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                    </div>
                    <div className={styles.quickMarcEditorRowIndicator}>
                      {
                        withIndicators && (
                          <FormattedMessage id="ui-quick-marc.record.indicator">
                            {ariaLabel => (
                              <Field
                                ariaLabel={ariaLabel}
                                name={`${name}[${idx}].indicators[1]`}
                                component={TextField}
                                marginBottom0
                                fullWidth
                                disabled={isDisabled}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                    </div>
                    <div className={styles.quickMarcEditorRowContent}>
                      <FormattedMessage id="ui-quick-marc.record.subfield">
                        {ariaLabel => (
                          <Field
                            ariaLabel={ariaLabel}
                            name={`${name}[${idx}].content`}
                            component={TextField}
                            marginBottom0
                            fullWidth
                            disabled={isDisabled}
                          />
                        )}
                      </FormattedMessage>
                    </div>
                    <div className={styles.quickMarcEditorActions}>
                      {
                        !withAddRowAction && (
                          <FormattedMessage id="ui-quick-marc.record.addField">
                            {ariaLabel => (
                              <IconButton
                                title={ariaLabel}
                                ariaLabel={ariaLabel}
                                data-test-add-row
                                data-index={idx}
                                icon="plus-sign"
                                onClick={addNewRow}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                      {
                        !withDeleteRowAction && (
                          <FormattedMessage id="ui-quick-marc.record.deleteField">
                            {ariaLabel => (
                              <IconButton
                                title={ariaLabel}
                                ariaLabel={ariaLabel}
                                data-test-remove-row
                                data-index={idx}
                                icon="trash"
                                onClick={showDeleteConfirmation}
                              />
                            )}
                          </FormattedMessage>
                        )
                      }
                    </div>
                  </>
                )}
            </div>
          );
        })
      }
      {isRemoveModalOpened && (
        <ConfirmationModal
          id="delete-row-confirmation"
          confirmLabel={<FormattedMessage id="ui-quick-marc.record.delete.confirmLabel" />}
          heading={<FormattedMessage id="ui-quick-marc.record.delete.title" />}
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
    moveRecord: PropTypes.func.isRequired,
  }),
};

export default QuickMarcEditorRows;
