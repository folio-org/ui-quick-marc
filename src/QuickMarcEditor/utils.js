import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';

import {
  isLastRecord,
  isFixedFieldRow,
  isMaterialCharsRecord,
  isPhysDescriptionRecord,
} from './QuickMarcEditorRows/utils';
import {
  LEADER_TAG,
  FIELD_TAGS_TO_REMOVE,
  FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS,
  QUICK_MARC_ACTIONS,
  LEADER_EDITABLE_BYTES,
  CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
  CREATE_MARC_RECORD_DEFAULT_FIELD_TAGS,
  HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
  CORRESPONDING_HEADING_TYPE_TAGS,
  LEADER_VALUES_FOR_POSITION,
  LEADER_DOCUMENTATION_LINKS,
} from './constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import getMaterialCharsFieldConfig from './QuickMarcEditorRows/MaterialCharsField/getMaterialCharsFieldConfig';
import getPhysDescriptionFieldConfig from './QuickMarcEditorRows/PhysDescriptionField/getPhysDescriptionFieldConfig';
import { FixedFieldFactory } from './QuickMarcEditorRows/FixedField';
import {
  MARC_TYPES,
  ERROR_TYPES,
} from '../common/constants';

export const parseHttpError = async (httpError) => {
  const contentType = httpError?.headers?.get('content-type');
  let jsonError = {};

  try {
    if (contentType === 'text/plain') {
      jsonError.message = await httpError.text();
    } else {
      jsonError = await httpError.json();
    }

    jsonError.errorType = ERROR_TYPES.OTHER;

    // Optimistic locking error is currently returned as a plain text
    // https://issues.folio.org/browse/UIIN-1872?focusedCommentId=125438&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-125438
    if (jsonError.message.match(/optimistic locking/i)) {
      jsonError.errorType = ERROR_TYPES.OPTIMISTIC_LOCKING;
    }

    return jsonError;
  } catch (err) {
    return httpError;
  }
};

export const dehydrateMarcRecordResponse = marcRecordResponse => ({
  ...marcRecordResponse,
  fields: undefined,
  records: [
    {
      tag: LEADER_TAG,
      content: marcRecordResponse.leader,
      id: LEADER_TAG,
    },
    ...marcRecordResponse.fields.map(record => ({
      ...record,
      id: uuidv4(),
    })),
  ],
});

const getCreateMarcRecordDefaultFields = (instanceRecord) => {
  return CREATE_MARC_RECORD_DEFAULT_FIELD_TAGS.map(tag => {
    const field = {
      tag,
      id: uuidv4(),
    };

    if (tag === '004') {
      field.content = instanceRecord.hrid;
    }

    if (tag === '008') {
      field.content = HOLDINGS_FIXED_FIELD_DEFAULT_VALUES;
    }

    if (tag === '852') {
      field.indicators = ['\\', '\\'];
    }

    if (tag === '999') {
      field.indicators = ['f', 'f'];
    }

    return field;
  });
};

export const getCreateMarcRecordResponse = (instanceResponse) => {
  const instanceId = instanceResponse.id;

  return {
    externalId: instanceId,
    leader: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
        id: LEADER_TAG,
      },
      ...getCreateMarcRecordDefaultFields(instanceResponse),
    ],
    parsedRecordDtoId: instanceId,
  };
};

const fieldMatchesDescription = (field, descriptionArray) => {
  let match = false;

  descriptionArray.forEach(description => {
    if (field.tag !== description.tag) {
      match = match || false;

      return;
    }

    if (field.indicators && description.indicators) {
      match = match || (field.indicators[0] === description.indicators[0]
        && field.indicators[1] === description.indicators[1]);

      return;
    }

    match = match || true;
  });

  return match;
};

const getEmptyContent = (field) => {
  if (field.tag === '035' || field.tag === '019') {
    return '$a';
  }

  return '';
};

const removeMarcRecordFieldContentForDuplication = marcRecord => {
  return {
    ...marcRecord,
    records: marcRecord.records.map((field) => (fieldMatchesDescription(field, FIELD_TAGS_TO_REMOVE)
      ? {
        ...field,
        content: getEmptyContent(field),
      }
      : field
    )),
  };
};

export const formatMarcRecordByQuickMarcAction = (marcRecord, action) => {
  if (action === QUICK_MARC_ACTIONS.DUPLICATE) {
    return {
      ...removeMarcRecordFieldContentForDuplication(marcRecord),
      updateInfo: {
        recordState: RECORD_STATUS_NEW,
      },
    };
  }

  if (action === QUICK_MARC_ACTIONS.CREATE) {
    return {
      ...marcRecord,
      relatedRecordVersion: 1,
      marcFormat: MARC_TYPES.HOLDINGS.toUpperCase(),
      suppressDiscovery: false,
      updateInfo: {
        recordState: RECORD_STATUS_NEW,
      },
    };
  }

  return marcRecord;
};

export const addInternalFieldProperties = (marcRecord) => {
  return {
    ...marcRecord,
    records: marcRecord.records.map(record => ({
      ...record,
      _isDeleted: false,
    })),
  };
};

export const hydrateMarcRecord = marcRecord => ({
  ...marcRecord,
  leader: marcRecord.records[0].content,
  fields: marcRecord.records.slice(1).map(record => ({
    tag: record.tag,
    content: record.content,
    indicators: record.indicators,
  })),
  records: undefined,
});

export const addNewRecord = (index, state) => {
  const records = [...state.formState.values.records];
  const newIndex = index + 1;
  const emptyRow = {
    id: uuidv4(),
    tag: '',
    content: '$a ',
    indicators: ['\\', '\\'],
  };

  records.splice(newIndex, 0, emptyRow);

  return records;
};

const getInvalidLeaderPositions = (leader, marcType) => {
  const failedPositions = Object.keys(LEADER_VALUES_FOR_POSITION[marcType]).map(position => {
    if (!LEADER_VALUES_FOR_POSITION[marcType][position].includes(leader[position])) {
      return position;
    }

    return null;
  }).filter(result => !!result);

  return failedPositions;
};

const joinFailedPositions = (failedPositions) => {
  const formattedFailedPositions = failedPositions.map(position => `Leader 0${position}`);

  const last = formattedFailedPositions.pop();
  const joinedPositions = formattedFailedPositions.length > 0
    ? formattedFailedPositions.join(', ') + ' and ' + last
    : last;

  return joinedPositions;
};

const validateLeaderPositions = (leader, marcType) => {
  const failedPositions = getInvalidLeaderPositions(leader, marcType);
  const joinedPositions = joinFailedPositions(failedPositions);

  if (failedPositions.length) {
    return (
      <FormattedMessage
        id="ui-quick-marc.record.error.leader.invalidPositionValue"
        values={{
          positions: joinedPositions,
          link: (
            <Link
              to={{
                pathname: LEADER_DOCUMENTATION_LINKS[marcType],
              }}
              target="_blank"
            >
              {LEADER_DOCUMENTATION_LINKS[marcType]}
            </Link>
          ),
        }}
      />
    );
  }

  return undefined;
};

export const validateLeader = (prevLeader = '', leader = '', marcType = MARC_TYPES.BIB) => {
  const cutEditableBytes = (str) => (
    LEADER_EDITABLE_BYTES[marcType].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (leader.length !== 24) {
    return <FormattedMessage id="ui-quick-marc.record.error.leader.length" />;
  }

  if (cutEditableBytes(prevLeader) !== cutEditableBytes(leader)) {
    return <FormattedMessage id={`ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}`} />;
  }

  const leaderValidationError = validateLeaderPositions(leader, marcType);

  if (leaderValidationError) {
    return leaderValidationError;
  }

  return undefined;
};

export const getLocationValue = (value) => {
  const matches = value?.match(/\$b\s+([^$\s]+\/?)+/) || [];

  return matches[0] || '';
};

export const validateLocationSubfield = (field, locations) => {
  const [, locationValue] = getLocationValue(field.content)?.split(' ');

  return !!locations.find(location => location.code === locationValue);
};

export const validateRecordTag = marcRecords => {
  if (marcRecords.some(({ tag }) => !tag || tag.length !== 3)) {
    return <FormattedMessage id="ui-quick-marc.record.error.tag.length" />;
  }

  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  if (marcRecordsWithoutLDR.some(({ tag }) => !tag.match(/\d{3}/))) {
    return <FormattedMessage id="ui-quick-marc.record.error.tag.nonDigits" />;
  }

  return undefined;
};

export const checkIsInitialRecord = (initialMarcRecord, marcRecordId) => {
  const initialMarcRecordIds = new Set(initialMarcRecord.map(record => record.id));

  return initialMarcRecordIds.has(marcRecordId);
};

export const checkControlFieldLength = (formValues) => {
  const marcRecords = formValues.records || [];
  const controlFieldRecords = marcRecords.filter(({ tag }) => tag === '001');

  if (controlFieldRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.controlField.multiple" />;
  }

  return undefined;
};

export const validateSubfield = (marcRecords, initialMarcRecords) => {
  const marcRecordsWithSubfields = marcRecords.filter(marcRecord => marcRecord.indicators);
  const isEmptySubfield = marcRecordsWithSubfields.some(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(initialMarcRecords, marcRecord.id);
  });

  if (isEmptySubfield) {
    return <FormattedMessage id="ui-quick-marc.record.error.subfield" />;
  }

  return undefined;
};

export const validateRecordMismatch = marcRecords => {
  const leader = marcRecords[0]?.content || '';
  const fixedField = marcRecords.find(isFixedFieldRow);

  if (
    leader[17] !== fixedField?.content?.ELvl
    || leader[18] !== fixedField?.content?.Desc
  ) {
    return <FormattedMessage id="ui-quick-marc.record.error.leader.fixedFieldMismatch" />;
  }

  return undefined;
};

const validateMarcBibRecord = (marcRecords) => {
  const leaderMismatchError = validateRecordMismatch(marcRecords);

  if (leaderMismatchError) {
    return leaderMismatchError;
  }

  const titleRecords = marcRecords.filter(({ tag }) => tag === '245');

  if (titleRecords.length === 0) {
    return <FormattedMessage id="ui-quick-marc.record.error.title.empty" />;
  }

  if (titleRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.title.multiple" />;
  }

  return undefined;
};

const validateMarcHoldingsRecord = (marcRecords, locations) => {
  const instanceHridRecords = marcRecords.filter(({ tag }) => tag === '004');

  if (instanceHridRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.instanceHrid.multiple" />;
  }

  const locationRecords = marcRecords.filter(({ tag }) => tag === '852');

  if (!locationRecords.length) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.empty" />;
  }

  if (locationRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.multiple" />;
  }

  if (!validateLocationSubfield(marcRecords.find(({ tag }) => tag === '852'), locations)) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.invalid" />;
  }

  return undefined;
};

const validateMarcAuthorityRecord = (marcRecords) => {
  const correspondingHeadingTypeTags = new Set(CORRESPONDING_HEADING_TYPE_TAGS);

  const headingRecords = marcRecords.filter(recordRow => correspondingHeadingTypeTags.has(recordRow.tag));

  if (!headingRecords.length) {
    return <FormattedMessage id="ui-quick-marc.record.error.heading.empty" />;
  }

  if (headingRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.heading.multiple" />;
  }

  return undefined;
};

export const validateMarcRecord = (marcRecord, initialValues, marcType = MARC_TYPES.BIB, locations = []) => {
  const marcRecords = marcRecord.records || [];
  const initialMarcRecords = initialValues.records;
  const recordLeader = marcRecords[0];

  const leaderError = validateLeader(marcRecord?.leader, recordLeader?.content, marcType);

  if (leaderError) {
    return leaderError;
  }

  let validationResult;

  if (marcType === MARC_TYPES.BIB) {
    validationResult = validateMarcBibRecord(marcRecords);
  } else if (marcType === MARC_TYPES.HOLDINGS) {
    validationResult = validateMarcHoldingsRecord(marcRecords, locations);
  } else if (marcType === MARC_TYPES.AUTHORITY) {
    validationResult = validateMarcAuthorityRecord(marcRecords);
  }

  if (validationResult) {
    return validationResult;
  }

  const tagError = validateRecordTag(marcRecords);

  if (tagError) {
    return tagError;
  }

  const subfieldError = validateSubfield(marcRecords, initialMarcRecords);

  if (subfieldError) {
    return subfieldError;
  }

  return undefined;
};

export const deleteRecordByIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records.splice(index, 1);

  return records;
};

export const markDeletedRecordByIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...records[index],
    _isDeleted: true,
  };

  return records;
};

export const reorderRecords = (index, indexToSwitch, state) => {
  const records = [...state.formState.values.records];

  [records[index], records[indexToSwitch]] = [records[indexToSwitch], records[index]];

  return records;
};

export const restoreRecordAtIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...records[index],
    _isDeleted: false,
  };

  return records;
};

export const removeDeletedRecords = (formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.filter(record => !record._isDeleted),
  };
};

export const removeFieldsForDuplicate = (formValues) => {
  const { records } = formValues;

  const filteredRecords = records.filter(recordRow => {
    const idFields = [{ tag: '001' }, { tag: '005' }];

    if (isLastRecord(recordRow) || fieldMatchesDescription(recordRow, idFields)) {
      return false;
    }

    if (!recordRow.content) {
      return false;
    }

    return true;
  });

  return {
    ...omit(formValues, 'updateInfo'),
    records: filteredRecords,
  };
};

const checkIsEmptyContent = (field) => {
  if (typeof field.content === 'string') {
    return compact(field.content.split(' ')).every(content => /^\$[a-z0-9]?$/.test(content));
  }

  return false;
};

export const autopopulateIndicators = (formValues) => {
  const { records } = formValues;

  const recordsWithIndicators = records.reduce((acc, field) => {
    if (!field.indicators || field.indicators?.every(value => !!value)) {
      return [...acc, field];
    }

    const autopopulatedIndicators = field.indicators.map(indicator => indicator || '\\');

    return [...acc, {
      ...field,
      indicators: autopopulatedIndicators,
    }];
  }, []);

  return {
    ...formValues,
    records: recordsWithIndicators,
  };
};

export const autopopulateSubfieldSection = (formValues, initialValues, marcType = MARC_TYPES.BIB) => {
  const { records } = formValues;
  const { records: initialMarcRecords } = initialValues;

  const recordsWithSubfields = records.reduce((acc, field) => {
    if (!field.content && field.indicators && field.indicators.every(value => !value)) {
      return acc;
    }

    if (!field.content && !checkIsInitialRecord(initialMarcRecords, field.id)) {
      return acc;
    }

    if (checkIsEmptyContent(field)) {
      return acc;
    }

    if (fieldMatchesDescription(field, FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS[marcType])) {
      return [...acc, field];
    }

    const fieldContentWithoutLeadingSpaces = field.content.trimStart();

    const contentHasSubfield = /^\$[a-z0-9]*/.test(fieldContentWithoutLeadingSpaces);

    return [...acc, {
      ...field,
      content: contentHasSubfield
        ? fieldContentWithoutLeadingSpaces
        : `$a ${fieldContentWithoutLeadingSpaces}`,
    }];
  }, []);

  return {
    ...formValues,
    records: recordsWithSubfields,
  };
};

export const cleanBytesFields = (formValues, initialValues, marcType) => {
  const { records } = formValues;

  const cleanedRecords = records.map((field) => {
    if (isString(field.content)) {
      return field;
    }

    let fieldConfigByType;

    if (isMaterialCharsRecord(field)) {
      fieldConfigByType = getMaterialCharsFieldConfig(field.content.Type);
    }

    if (isPhysDescriptionRecord(field)) {
      fieldConfigByType = getPhysDescriptionFieldConfig(field.content.Category);
    }

    if (isFixedFieldRow(field)) {
      fieldConfigByType = FixedFieldFactory
        .getFixedFieldByType(marcType, field.content.Type, initialValues?.leader[7]).configFields;
    }

    const content = Object.entries(field.content).reduce((acc, [key, value]) => {
      if (isString(value)) {
        return {
          ...acc,
          [key]: value,
        };
      }

      if (isNumber(value)) {
        return {
          ...acc,
          [key]: `${value}`,
        };
      }

      const fieldConfig = fieldConfigByType.find(({ name }) => (name === key));

      if (fieldConfig) {
        const updatedValue = value.map(item => item || '\\');

        updatedValue.length = fieldConfig.bytes;

        return {
          ...acc,
          [key]: updatedValue,
        };
      }

      return acc;
    }, {});

    return {
      ...field,
      content,
    };
  });

  return {
    ...formValues,
    records: cleanedRecords,
  };
};

export const getCorrespondingMarcTag = (records) => {
  const correspondingHeadingTypeTags = new Set(CORRESPONDING_HEADING_TYPE_TAGS);

  return records.find(recordRow => correspondingHeadingTypeTags.has(recordRow.tag)).tag;
};

export const getContentSubfieldValue = (content) => {
  return content.split(/\$/).reduce((acc, str) => {
    if (!str) {
      return acc;
    }

    return {
      ...acc,
      [`$${str[0]}`]: str.substring(2),
    };
  }, {});
};
