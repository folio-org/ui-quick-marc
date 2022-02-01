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
import { MaterialCharsField } from './MaterialCharsField';
import { PhysDescriptionField } from './PhysDescriptionField';
import { FixedFieldFactory } from './FixedField';
import { LocationField } from './LocationField';
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
  name,
  fields,
  type,
  subtype,
  setDeletedRecords,
  isLocationLookupNeeded,
  permanentLocation,
  setPermanentLocation,
  isLocationLookupUsed,
  setIsLocationLookupUsed,
  mutators: {
    addRecord,
    deleteRecord,
    moveRecord,
  },
  marcType,
}) => {
  const intl = useIntl();

  const addNewRow = useCallback(({ target }) => {
    addRecord({ index: parseInt(target.dataset.index, 10) });
  }, [addRecord]);

  const deleteRow = useCallback(({ target }) => {
    const index = parseInt(target.dataset.index, 10);

    deleteRecord({ index });
    setDeletedRecords((prevDeletedRecords) => [
      ...prevDeletedRecords,
      {
        index,
        record: fields[index],
      },
    ]);
  }, [deleteRecord, setDeletedRecords, fields]);

  const moveRow = useCallback(({ target }) => {
    moveRecord({
      index: +target.dataset.index,
      indexToSwitch: parseInt(target.dataset.indexToSwitch, 10),
    });
  }, [moveRecord]);

  return (
    <div
      id="quick-marc-editor-rows"
      data-testid="quick-marc-editor-rows"
    >
      {
        fields.map((recordRow, idx) => {
          const isDisabled = isReadOnly(recordRow, action, marcType);
          const withIndicators = !hasIndicatorException(recordRow);
          const withAddRowAction = hasAddException(recordRow, marcType);
          const withDeleteRowAction = hasDeleteException(recordRow, marcType);
          const withMoveUpRowAction = hasMoveException(recordRow, fields[idx - 1]);
          const withMoveDownRowAction = hasMoveException(recordRow, fields[idx + 1]);

          const isMaterialCharsField = isMaterialCharsRecord(recordRow);
          const isPhysDescriptionField = isPhysDescriptionRecord(recordRow);
          const isFixedField = isFixedFieldRow(recordRow);
          const isContentField = !(isFixedField || isMaterialCharsField || isPhysDescriptionField);
          const isLocationField = isLocationLookupNeeded && recordRow.tag === '852';

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
                    <MaterialCharsField
                      name={`${name}[${idx}].content`}
                      type={recordRow.content.Type}
                    />
                  )
                }

                {
                  isPhysDescriptionField && (
                    <PhysDescriptionField
                      name={`${name}[${idx}].content`}
                      type={recordRow.content.Category}
                    />
                  )
                }

                {
                  isFixedField && (
                    FixedFieldFactory.getFixedField(
                      `${name}[${idx}].content`, marcType, type, subtype,
                    )
                  )
                }

                {
                  isContentField && (
                    <>
                      <Field
                        dirty={false}
                        aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
                        name={`${name}[${idx}].content`}
                        marginBottom0
                        disabled={isDisabled}
                        id={`content-field-${idx}`}
                      >
                        {(props) => {
                          return isLocationField ? (
                            <LocationField
                              action={action}
                              fields={fields}
                              isLocationLookupUsed={isLocationLookupUsed}
                              setIsLocationLookupUsed={setIsLocationLookupUsed}
                              permanentLocation={permanentLocation}
                              setPermanentLocation={setPermanentLocation}
                              {...props}
                            />
                          ) : (
                            <ContentField {...props} />
                          );
                        }}
                      </Field>
                    </>
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
    </div>
  );
};

QuickMarcEditorRows.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
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
  isLocationLookupNeeded: PropTypes.bool.isRequired,
  permanentLocation: PropTypes.string.isRequired,
  setPermanentLocation: PropTypes.func.isRequired,
  isLocationLookupUsed: PropTypes.bool.isRequired,
  setIsLocationLookupUsed: PropTypes.func.isRequired,
  mutators: PropTypes.shape({
    addRecord: PropTypes.func.isRequired,
    deleteRecord: PropTypes.func.isRequired,
    moveRecord: PropTypes.func.isRequired,
  }),
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
};

export default QuickMarcEditorRows;
