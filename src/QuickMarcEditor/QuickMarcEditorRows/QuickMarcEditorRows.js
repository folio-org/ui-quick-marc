import React, {
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  useFormState,
} from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import isEqual from 'lodash/isEqual';
import defer from 'lodash/defer';

import { Pluggable } from '@folio/stripes/core';
import {
  TextField,
  IconButton,
  InfoPopover,
} from '@folio/stripes/components';

import { ContentField } from './ContentField';
import { IndicatorField } from './IndicatorField';
import { MaterialCharsField } from './MaterialCharsField';
import { PhysDescriptionField } from './PhysDescriptionField';
import { FixedFieldFactory } from './FixedField';
import { LocationField } from './LocationField';
import { DeletedRowPlaceholder } from './DeletedRowPlaceholder';
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
import { QUICK_MARC_ACTIONS } from '../constants';
import {
  MARC_TYPES,
  TAG_FIELD_MAX_LENGTH,
} from '../../common/constants';

import styles from './QuickMarcEditorRows.css';

const QuickMarcEditorRows = ({
  action,
  fields,
  type,
  subtype,
  mutators: {
    addRecord,
    markRecordDeleted,
    deleteRecord,
    moveRecord,
    restoreRecord,
  },
  marcType,
}) => {
  const intl = useIntl();
  const { initialValues } = useFormState();
  const containerRef = useRef(null);
  const indexOfNewRow = useRef(null);
  const newRowRef = useRef(null);

  const isNewRow = useCallback((row) => {
    return !initialValues.records.find(record => record.id === row.id);
  }, [initialValues.records]);

  const addNewRow = useCallback(({ target }) => {
    const index = parseInt(target.dataset.index, 10);

    indexOfNewRow.current = index + 1;
    addRecord({ index });
    defer(() => {
      newRowRef.current.focus();
    });
  }, [addRecord]);

  const deleteRow = useCallback(({ target }) => {
    const index = parseInt(target.dataset.index, 10);
    const recordsLength = parseInt(target.dataset.recordsLength, 10);
    const isLastRowDeleted = index === recordsLength - 1;

    if (isNewRow(fields[index])) {
      deleteRecord({ index });
    } else {
      markRecordDeleted({ index });
    }

    if (!isLastRowDeleted) {
      defer(() => {
        containerRef.current.querySelector(`[name="records[${index + 1}].tag"]`).focus();
      });
    }
  }, [fields, deleteRecord, markRecordDeleted, isNewRow, containerRef]);

  const moveRow = useCallback(({ target }) => {
    moveRecord({
      index: +target.dataset.index,
      indexToSwitch: parseInt(target.dataset.indexToSwitch, 10),
    });
  }, [moveRecord]);

  const restoreRow = useCallback((index) => {
    restoreRecord({ index });
  }, [restoreRecord]);

  const processTagRef = useCallback(ref => {
    if (!ref) return;
    const index = parseInt(ref.dataset.index, 10);

    if (indexOfNewRow.current === index) {
      newRowRef.current = ref;
    }
  }, [indexOfNewRow, newRowRef]);

  return (
    <div
      id="quick-marc-editor-rows"
      data-testid="quick-marc-editor-rows"
      ref={containerRef}
    >
      <FieldArray
        name="records"
        isEqual={isEqual}
      >
        {({ fields: records }) => (
          records.map((name, idx) => {
            const recordRow = fields[idx];

            if (!recordRow) {
              return null;
            }

            if (recordRow._isDeleted) {
              return (
                <DeletedRowPlaceholder
                  field={recordRow}
                  restoreRow={() => restoreRow(idx)}
                />
              );
            }

            const isDisabled = isReadOnly(recordRow, action, marcType);
            const withIndicators = !hasIndicatorException(recordRow);
            const withAddRowAction = hasAddException(recordRow, marcType);
            const withDeleteRowAction = hasDeleteException(recordRow, marcType);
            const withMoveUpRowAction = hasMoveException(recordRow, fields[idx - 1]);
            const withMoveDownRowAction = hasMoveException(recordRow, fields[idx + 1]);

            const isMaterialCharsField = isMaterialCharsRecord(recordRow);
            const isPhysDescriptionField = isPhysDescriptionRecord(recordRow);
            const isFixedField = isFixedFieldRow(recordRow);
            const isLocationField = marcType === MARC_TYPES.HOLDINGS && recordRow.tag === '852';
            const isContentField = !(isLocationField || isFixedField || isMaterialCharsField || isPhysDescriptionField);
            const isMARCFieldProtections = marcType !== MARC_TYPES.HOLDINGS && action === QUICK_MARC_ACTIONS.EDIT;
            const isProtectedField = recordRow.isProtected;

            return (
              <div
                key={recordRow.id}
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

                {
                  isMARCFieldProtections && (
                    <div className={styles.quickMarcEditorRowInfoPopover}>
                      {
                        isProtectedField && (
                          <div data-testid="quick-marc-protected-field-popover">
                            <InfoPopover
                              iconSize="medium"
                              content={intl.formatMessage({ id: 'ui-quick-marc.record.protectedField' })}
                            />
                          </div>
                        )
                      }
                    </div>
                  )
                }

                <div className={styles.quickMarcEditorRowTag}>
                  <Field
                    inputRef={processTagRef}
                    data-index={idx}
                    dirty={false}
                    ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.field' })}
                    name={`${name}.tag`}
                    component={TextField}
                    maxLength={TAG_FIELD_MAX_LENGTH}
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
                        name={`${name}.indicators[0]`}
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
                        name={`${name}.indicators[1]`}
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
                      <MaterialCharsField
                        name={`${name}.content`}
                        type={recordRow.content.Type}
                      />
                    )
                  }

                  {
                    isPhysDescriptionField && (
                      <PhysDescriptionField
                        name={`${name}.content`}
                        type={recordRow.content.Category}
                      />
                    )
                  }

                  {
                    isFixedField && (
                      FixedFieldFactory.getFixedField(
                        `${name}.content`, marcType, type, subtype,
                      )
                    )
                  }

                  {isLocationField && (
                    <LocationField
                      id={`location-field-${idx}`}
                      name={`${name}.content`}
                    />
                  )}

                  {
                    isContentField && (
                      <Field
                        dirty={false}
                        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
                        name={`${name}.content`}
                        marginBottom0
                        disabled={isDisabled}
                        id={`content-field-${idx}`}
                        component={ContentField}
                      />
                    )
                  }
                </div>

                <div className={styles.quickMarcEditorActions}>
                  {
                    !withAddRowAction && (
                      <IconButton
                        className="quickMarcEditorAddField"
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
                        data-records-length={records.length}
                        icon="trash"
                        onClick={deleteRow}
                      />
                    )
                  }
                  <Pluggable
                    type="find-authority"
                  >
                    <FormattedMessage id="ui-quick-marc.noPlugin" />
                  </Pluggable>
                </div>
              </div>
            );
          })
        )}
      </FieldArray>
    </div>
  );
};

QuickMarcEditorRows.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  type: PropTypes.string.isRequired,
  subtype: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    isProtected: PropTypes.bool.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    _isDeleted: PropTypes.bool,
  })),
  mutators: PropTypes.shape({
    addRecord: PropTypes.func.isRequired,
    deleteRecord: PropTypes.func.isRequired,
    markRecordDeleted: PropTypes.func.isRequired,
    moveRecord: PropTypes.func.isRequired,
    restoreRecord: PropTypes.func.isRequired,
  }),
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
};

export default QuickMarcEditorRows;
