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
import { Link } from 'react-router-dom';
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
import { LinkButton } from './LinkButton';
import { SplitField } from './SplitField';
import {
  hasIndicatorException,
  hasAddException,
  hasMoveException,
} from './utils';
import {
  checkCanBeLinked,
  isFixedFieldRow,
  isMaterialCharsRecord,
  isPhysDescriptionRecord,
  isReadOnly,
  hasDeleteException,
} from '../utils';
import { useAuthorityLinking } from '../../hooks';
import {
  QUICK_MARC_ACTIONS,
  LEADER_TAG,
} from '../constants';
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
    markRecordLinked,
    markRecordUnlinked,
    deleteRecord,
    moveRecord,
    restoreRecord,
  },
  marcType,
  instance,
  linksCount,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const { initialValues } = useFormState();
  const containerRef = useRef(null);
  const indexOfNewRow = useRef(null);
  const newRowRef = useRef(null);
  const rowContentWidth = useRef(null); // for max-width of resizable textareas
  const childCalloutRef = useRef(null);

  const {
    linkAuthority,
    unlinkAuthority,
    linkableBibFields,
  } = useAuthorityLinking();

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

  const setRowContentWidthOnce = (el) => {
    rowContentWidth.current = el?.offsetWidth;
  };

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
    const index = parseInt(target.dataset.index, 10);
    const indexToSwitch = parseInt(target.dataset.indexToSwitch, 10);

    const row = containerRef.current.querySelector(`[data-row="record-row[${index}]"]`);

    if (index > indexToSwitch && !row.previousElementSibling.querySelector('[data-icon="move-up"]')) {
      row.querySelector('[data-icon="move-down"]')?.focus();
    }

    if (index < indexToSwitch && !row.nextElementSibling.querySelector('[data-icon="move-down"]')) {
      row.querySelector('[data-icon="move-up"]')?.focus();
    }

    moveRecord({
      index,
      indexToSwitch,
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

  const handleLinkAuthority = useCallback((authority, marcSource, index) => {
    try {
      const field = linkAuthority(authority, marcSource, fields[index]);

      markRecordLinked({ index, field });

      return true;
    } catch (e) {
      childCalloutRef.current.sendCallout({
        type: 'error',
        message: intl.formatMessage({ id: e.message }),
      });

      return false;
    }
  }, [markRecordLinked, linkAuthority, fields, intl]);

  const handleUnlinkAuthority = useCallback(index => {
    unlinkAuthority(fields[index]);

    markRecordUnlinked({ index });
  }, [markRecordUnlinked, unlinkAuthority, fields]);

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
                  key={recordRow.id}
                  field={recordRow}
                  restoreRow={() => restoreRow(idx)}
                />
              );
            }

            const isLeader = recordRow.tag === LEADER_TAG;
            const isDisabled = isReadOnly(recordRow, action, marcType);
            const withIndicators = !hasIndicatorException(recordRow);
            const withAddRowAction = hasAddException(recordRow, marcType);
            const withDeleteRowAction = hasDeleteException(recordRow, marcType, instance, initialValues, linksCount);
            const withMoveUpRowAction = hasMoveException(recordRow, fields[idx - 1]);
            const withMoveDownRowAction = hasMoveException(recordRow, fields[idx + 1]);

            const isMaterialCharsField = isMaterialCharsRecord(recordRow);
            const isPhysDescriptionField = isPhysDescriptionRecord(recordRow);
            const isFixedField = isFixedFieldRow(recordRow);
            const isLocationField = marcType === MARC_TYPES.HOLDINGS && recordRow.tag === '852';
            const isContentField = !(isLocationField || isFixedField || isMaterialCharsField || isPhysDescriptionField);
            const isMARCFieldProtections = marcType !== MARC_TYPES.HOLDINGS && action === QUICK_MARC_ACTIONS.EDIT;
            const isProtectedField = recordRow.isProtected;
            const isLinkVisible = checkCanBeLinked(stripes, marcType, linkableBibFields, recordRow.tag);

            const canViewAuthorityRecord = stripes.hasPerm('ui-marc-authorities.authority-record.view') && recordRow._isLinked;

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
                        id={`moving-row-move-up-${idx}`}
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
                        id={`moving-row-move-down-${idx}`}
                        text={intl.formatMessage({ id: 'ui-quick-marc.record.moveDownRow' })}
                      >
                        {({ ref, ariaIds }) => (
                          <IconButton
                            ref={ref}
                            name="icon-arrow-down"
                            data-icon="move-down"
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
                        id={`actions-add-field-${idx}`}
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
                        id={`actions-delete-field-${idx}`}
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

                <div
                  className={styles.quickMarcEditorRowContent}
                  ref={isLeader ? setRowContentWidthOnce : null}
                >
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
                      recordRow._isLinked
                        ? (
                          <SplitField
                            name={name}
                            maxWidth={rowContentWidth.current}
                          />
                        )
                        : (
                          <Field
                            dirty={false}
                            aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.subfield' })}
                            name={`${name}.content`}
                            parse={v => v}
                            marginBottom0
                            disabled={isDisabled}
                            id={`content-field-${idx}`}
                            component={ContentField}
                          />
                        )
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
                      handleLinkAuthority={(authority, marcSource) => handleLinkAuthority(authority, marcSource, idx)}
                      handleUnlinkAuthority={() => handleUnlinkAuthority(idx)}
                      isLinked={recordRow._isLinked}
                      tag={recordRow.tag}
                      content={recordRow.content}
                      fieldId={recordRow.id}
                      calloutRef={childCalloutRef}
                    />
                  )}
                  {canViewAuthorityRecord && (
                    <Tooltip
                      id={`view-marc-authority-record-tooltip-${idx}`}
                      text={intl.formatMessage({ id: 'ui-quick-marc.record.viewMarcAuthorityRecord' })}
                    >
                      {({ ref, ariaIds }) => (
                        <Link
                          to={`/marc-authorities/authorities/${recordRow.linkDetails?.authorityId}?authRefType=Authorized&segment=search`}
                          target="_blank"
                          data-testid="view-authority-record-link"
                          tabIndex="-1"
                        >
                          <IconButton
                            icon="eye-open"
                            ref={ref}
                            aria-labelledby={ariaIds.text}
                          />
                        </Link>
                      )}
                    </Tooltip>
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
  instance: PropTypes.object,
  linksCount: PropTypes.number,
  type: PropTypes.string.isRequired,
  subtype: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    isProtected: PropTypes.bool,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    linkDetails: PropTypes.shape({
      authorityId: PropTypes.string.isRequired,
      authorityNaturalId: PropTypes.string.isRequired,
      linkingRuleId: PropTypes.number.isRequired,
    }),
    _isDeleted: PropTypes.bool,
    _isLinked: PropTypes.bool,
    _isAdded: PropTypes.bool,
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
