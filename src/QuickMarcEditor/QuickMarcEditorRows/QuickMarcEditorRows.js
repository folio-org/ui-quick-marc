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
import { useIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';
import defer from 'lodash/defer';

import { useStripes } from '@folio/stripes/core';
import {
  TextField,
  Tooltip,
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
import { useAuthorityLinking } from '../../hooks';
import {
  QUICK_MARC_ACTIONS,
  TAGS_FOR_DISPLAYING_LINKS,
} from '../constants';
import {
  MARC_TYPES,
  TAG_FIELD_MAX_LENGTH,
} from '../../common/constants';

import styles from './QuickMarcEditorRows.css';
import { LinkButton } from './LinkButton/LinkButton';

const QuickMarcEditorRows = ({
  action,
  fields,
  type,
  subtype,
  mutators: {
    addRecord,
    markRecordDeleted,
    markRecordLinked,
    markRecordUnlinked,
    deleteRecord,
    moveRecord,
    restoreRecord,
  },
  marcType,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const { initialValues } = useFormState();
  const containerRef = useRef(null);
  const indexOfNewRow = useRef(null);
  const newRowRef = useRef(null);

  const { linkAuthority } = useAuthorityLinking();

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

  const getNextFocusableElement = (row) => {
    const prevRow = row.previousElementSibling;
    const nextRow = row.nextElementSibling;

    if (nextRow) {
      return nextRow.querySelector('[data-icon="delete-row"]') ||
        nextRow.querySelector('[data-icon="move-up"]');
    }

    return prevRow.querySelector('[data-icon="delete-row"]') ||
      prevRow.querySelector('[data-icon="move-up"]');
  };

  const deleteRow = useCallback(({ target }) => {
    const index = parseInt(target.dataset.index, 10);

    const row = containerRef.current.querySelector(`[data-row="record-row[${index}]"]`);
    const nextFocusableElement = getNextFocusableElement(row);

    if (isNewRow(fields[index])) {
      deleteRecord({ index });
    } else {
      markRecordDeleted({ index });
    }

    defer(() => {
      nextFocusableElement?.focus();
    });
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

  const handleLinkAuthority = useCallback((authority, index) => {
    const field = linkAuthority(authority, fields[index]);

    markRecordLinked({ index, field });
  }, [markRecordLinked, linkAuthority, fields]);

  const handleUnlinkAuthority = useCallback(index => {
    markRecordUnlinked({ index });
  }, [markRecordUnlinked]);

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
            const isLinkVisible = stripes.hasPerm('ui-quick-marc.quick-marc-authority-records.linkUnlink') &&
              marcType === MARC_TYPES.BIB &&
              (action === QUICK_MARC_ACTIONS.EDIT || action === QUICK_MARC_ACTIONS.DUPLICATE) &&
              TAGS_FOR_DISPLAYING_LINKS.has(recordRow.tag);

            return (
              <div
                key={recordRow.id}
                className={styles.quickMarcEditorRow}
                data-testid="quick-marc-editorid"
                data-row={`record-row[${idx}]`}
              >
                <div className={styles.quickMarcEditorMovingRow}>
                  {
                    !withMoveUpRowAction && (
                      <Tooltip
                        id="moving-row-move-up"
                        text={intl.formatMessage({ id: 'ui-quick-marc.record.moveUpRow' })}
                      >
                        {({ ref, ariaIds }) => (
                          <IconButton
                            ref={ref}
                            data-icon="move-up"
                            aria-labelledby={ariaIds.text}
                            data-test-move-up-row
                            data-index={idx}
                            data-index-to-switch={idx - 1}
                            icon="arrow-up"
                            onClick={moveRow}
                          />
                        )}
                      </Tooltip>
                    )
                  }
                  {
                    !withMoveDownRowAction && (
                      <Tooltip
                        id="moving-row-move-down"
                        text={intl.formatMessage({ id: 'ui-quick-marc.record.moveDownRow' })}
                      >
                        {({ ref, ariaIds }) => (
                          <IconButton
                            ref={ref}
                            name="icon-arrow-down"
                            aria-labelledby={ariaIds.text}
                            data-test-move-down-row
                            data-index={idx}
                            data-index-to-switch={idx + 1}
                            icon="arrow-down"
                            onClick={moveRow}
                          />
                        )}
                      </Tooltip>
                    )
                  }
                </div>

                <div className={styles.quickMarcEditorActions}>
                  {
                    !withAddRowAction && (
                      <Tooltip
                        id="actions-add-field"
                        text={intl.formatMessage({ id: 'ui-quick-marc.record.addField' })}
                      >
                        {({ ref, ariaIds }) => (
                          <IconButton
                            ref={ref}
                            aria-labelledby={ariaIds.text}
                            className="quickMarcEditorAddField"
                            data-test-add-row
                            data-index={idx}
                            icon="plus-sign"
                            onClick={addNewRow}
                          />
                        )}
                      </Tooltip>
                    )
                  }
                  {
                    !withDeleteRowAction && (
                      <Tooltip
                        id="actions-delete-field"
                        text={intl.formatMessage({ id: 'ui-quick-marc.record.deleteField' })}
                      >
                        {({ ref, ariaIds }) => (
                          <IconButton
                            ref={ref}
                            aria-labelledby={ariaIds.text}
                            data-icon="delete-row"
                            data-testid={`data-test-remove-row-${idx}`}
                            data-index={idx}
                            icon="trash"
                            onClick={deleteRow}
                          />
                        )}
                      </Tooltip>
                    )
                  }
                </div>

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

                <div className={styles.quickMarcEditorRightSide}>
                  {isMARCFieldProtections && isProtectedField && (
                    <span data-testid="quick-marc-protected-field-popover">
                      <InfoPopover
                        iconSize="medium"
                        content={intl.formatMessage({ id: 'ui-quick-marc.record.protectedField' })}
                      />
                    </span>
                  )}
                  {isLinkVisible && (
                    <LinkButton
                      handleLinkAuthority={(authority) => handleLinkAuthority(authority, idx)}
                      handleUnlinkAuthority={() => handleUnlinkAuthority(idx)}
                      isLinked={recordRow._isLinked}
                    />
                  )}
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
    _isLinked: PropTypes.bool,
  })),
  mutators: PropTypes.shape({
    addRecord: PropTypes.func.isRequired,
    deleteRecord: PropTypes.func.isRequired,
    markRecordDeleted: PropTypes.func.isRequired,
    markRecordLinked: PropTypes.func.isRequired,
    markRecordUnlinked: PropTypes.func.isRequired,
    moveRecord: PropTypes.func.isRequired,
    restoreRecord: PropTypes.func.isRequired,
  }),
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
};

export default QuickMarcEditorRows;
