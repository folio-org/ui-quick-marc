import React, {
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import {
  useIntl,
} from 'react-intl';

import {
  TextField,
  IconButton,
} from '@folio/stripes/components';

import { ContentField } from './ContentField';

import { IndicatorField } from './IndicatorField';
import { MaterialCharsFieldFactory } from './MaterialCharsField';
import { PhysDescriptionFieldFactory } from './PhysDescriptionField';
import { FixedFieldFactory } from './FixedField';
import {
  isReadOnly,
  hasIndicatorException,
  hasAddException,
  hasDeleteException,
  hasMoveException,

  isMaterialCharsRecord,
  isPhysDescriptionRecord,
  isFixedFieldRow,
} from './utils';

import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({
  name,
  fields,
  type,
  subtype,
  setDeletedRecords,
  mutators: {
    addRecord,
    deleteRecord,
    moveRecord,
  },
}) => {
  const intl = useIntl();

  const addNewRow = useCallback(({ target }) => {
    addRecord({ index: +target.dataset.index });
  }, [addRecord]);

  const deleteRow = useCallback(({ target }) => {
    deleteRecord({ index: +target.dataset.index });
    setDeletedRecords(prevDeletedItems => prevDeletedItems + 1);
  }, [deleteRecord, setDeletedRecords]);

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

          const isMaterialCharsField = isMaterialCharsRecord(recordRow);
          const isPhysDescriptionField = isPhysDescriptionRecord(recordRow);
          const isFixedField = isFixedFieldRow(recordRow);
          const isContentField = !(isFixedField || isMaterialCharsField || isPhysDescriptionField);

          return (
            <div
              key={idx}
              className={styles.quickMarcEditorRow}
              data-testid="quick-marc-editorid"
            >
              <div className={styles.quickMarcEditorMovingRow}>
                {
                  !withMoveUpRowAction && (
                    <IconButton
                      title={intl.formatMessage({ id: 'ui-quick-marc.record.moveUpRow' })}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.moveUpRow' })}
                      data-test-move-up-row
                      data-index={idx}
                      data-index-to-switch={idx - 1}
                      icon="arrow-up"
                      onClick={moveRow}
                    />
                  )
                }
                {
                  !withMoveDownRowAction && (
                    <IconButton
                      title={intl.formatMessage({ id: 'ui-quick-marc.record.moveDownRow' })}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.moveDownRow' })}
                      data-test-move-down-row
                      data-index={idx}
                      data-index-to-switch={idx + 1}
                      icon="arrow-down"
                      onClick={moveRow}
                    />
                  )
                }
              </div>

              <div className={styles.quickMarcEditorRowTag}>
                <Field
                  dirty={false}
                  ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.field' })}
                  name={`${name}[${idx}].tag`}
                  component={TextField}
                  maxLength={3}
                  marginBottom0
                  fullWidth
                  disabled={isDisabled || !idx}
                  hasClearIcon={false}
                />
              </div>

              <div className={styles.quickMarcEditorRowIndicator}>
                {
                  withIndicators && (
                    <Field
                      dirty={false}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.indicator' })}
                      name={`${name}[${idx}].indicators[0]`}
                      component={IndicatorField}
                      marginBottom0
                      fullWidth
                      disabled={isDisabled}
                      hasClearIcon={false}
                    />
                  )
                }
              </div>

              <div className={styles.quickMarcEditorRowIndicator}>
                {
                  withIndicators && (
                    <Field
                      dirty={false}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.indicator' })}
                      name={`${name}[${idx}].indicators[1]`}
                      component={IndicatorField}
                      marginBottom0
                      fullWidth
                      disabled={isDisabled}
                      hasClearIcon={false}
                    />
                  )
                }
              </div>

              <div className={styles.quickMarcEditorRowContent}>
                {
                  isMaterialCharsField && (
                    MaterialCharsFieldFactory.getMaterialCharsFieldField(
                      `${name}[${idx}].content`, type, subtype,
                    )
                  )
                }

                {
                  isPhysDescriptionField && (
                    PhysDescriptionFieldFactory.getPhysDescriptionField(
                      `${name}[${idx}].content`, recordRow.content.Category,
                    )
                  )
                }

                {
                  isFixedField && (
                    FixedFieldFactory.getFixedField(
                      `${name}[${idx}].content`, type, subtype,
                    )
                  )
                }

                {
                  isContentField && (
                    <Field
                      dirty={false}
                      aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
                      name={`${name}[${idx}].content`}
                      component={ContentField}
                      marginBottom0
                      disabled={isDisabled}
                    />
                  )
                }
              </div>

              <div className={styles.quickMarcEditorActions}>
                {
                  !withAddRowAction && (
                    <IconButton
                      title={intl.formatMessage({ id: 'ui-quick-marc.record.addField' })}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.addField' })}
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
                      title={intl.formatMessage({ id: 'ui-quick-marc.record.deleteField' })}
                      ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.deleteField' })}
                      data-testid={`data-test-remove-row-${idx}`}
                      data-index={idx}
                      icon="trash"
                      onClick={deleteRow}
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
  type: PropTypes.string.isRequired,
  subtype: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  })),
  setDeletedRecords: PropTypes.func.isRequired,
  mutators: PropTypes.shape({
    addRecord: PropTypes.func.isRequired,
    deleteRecord: PropTypes.func.isRequired,
    moveRecord: PropTypes.func.isRequired,
  }),
};

export default QuickMarcEditorRows;
