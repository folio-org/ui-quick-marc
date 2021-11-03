import React from 'react';
import uuid from 'uuid';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import { FormattedMessage } from 'react-intl';

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
} from './constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import getMaterialCharsFieldConfig from './QuickMarcEditorRows/MaterialCharsField/getMaterialCharsFieldConfig';
import getPhysDescriptionFieldConfig from './QuickMarcEditorRows/PhysDescriptionField/getPhysDescriptionFieldConfig';
import { FixedFieldFactory } from './QuickMarcEditorRows/FixedField';
import { MARC_TYPES } from '../common/constants';

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
      id: uuid(),
    })),
  ],
});

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

  return marcRecord;
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
    id: uuid(),
    tag: '',
    content: '$a ',
    indicators: ['\\', '\\'],
  };

  records.splice(newIndex, 0, emptyRow);

  return records;
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

  if (marcType === MARC_TYPES.BIB) {
    if (!['a', 'c', 'd', 'n', 'p'].includes(leader[5])) {
      return (
        <FormattedMessage id="ui-quick-marc.record.error.bib.leader.invalid005PositionValue" />
      );
    }
  }

  if (marcType === MARC_TYPES.HOLDINGS) {
    if (!['c', 'd', 'n'].includes(leader[5])) {
      return (
        <FormattedMessage
          id="ui-quick-marc.record.error.leader.invalidPositionValue"
          values={{ position: 5 }}
        />
      );
    }

    if (!['u', 'v', 'x', 'y'].includes(leader[6])) {
      return (
        <FormattedMessage
          id="ui-quick-marc.record.error.leader.invalidPositionValue"
          values={{ position: 6 }}
        />
      );
    }

    if (!['1', '2', '3', '4', '5', 'm', 'u', 'z'].includes(leader[17])) {
      return (
        <FormattedMessage
          id="ui-quick-marc.record.error.leader.invalidPositionValue"
          values={{ position: 17 }}
        />
      );
    }
  }

  return undefined;
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

const validateMarcHoldingsRecord = (marcRecords) => {
  const locationRecords = marcRecords.filter(({ tag }) => tag === '852');

  if (locationRecords.length === 0) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.empty" />;
  }

  return undefined;
};

export const validateMarcRecord = (marcRecord, initialValues, marcType = MARC_TYPES.BIB) => {
  const marcRecords = marcRecord.records || [];
  const initialMarcRecords = initialValues.records;
  const recordLeader = marcRecords[0];

  const leaderError = validateLeader(marcRecord?.leader, recordLeader?.content, marcType);

  if (leaderError) {
    return leaderError;
  }

  let validationResult = null;

  if (marcType === MARC_TYPES.BIB) {
    validationResult = validateMarcBibRecord(marcRecords);
  }

  if (marcType === MARC_TYPES.HOLDINGS) {
    validationResult = validateMarcHoldingsRecord(marcRecords);
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

export const reorderRecords = (index, indexToSwitch, state) => {
  const records = [...state.formState.values.records];

  [records[index], records[indexToSwitch]] = [records[indexToSwitch], records[index]];

  return records;
};

export const restoreRecordAtIndex = (index, record, state) => {
  const records = [...state.formState.values.records];

  records.splice(index, 0, record);

  return records;
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
    return compact(field.content.split(' ')).every(content => /^\$[a-z0-9]*/.test(content));
  }

  return false;
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
