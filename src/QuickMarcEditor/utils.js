import uuid from 'uuid';
import omit from 'lodash/omit';
import isString from 'lodash/isString';

import {
  isLastRecord,
  isFixedFieldRow,
  isMaterialCharsRecord,
  isPhysDescriptionRecord,
} from './QuickMarcEditorRows/utils';
import {
  LEADER_TAG,
  FIELD_TAGS_TO_REMOVE,
  QUICK_MARC_ACTIONS,
} from './constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';

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

const removeMarcRecordFieldContentForDuplication = marcRecord => {
  const shouldRemoveFieldContent = (field) => {
    if (!FIELD_TAGS_TO_REMOVE.includes(field.tag)) {
      return false;
    }

    const [firstIndicator, secondIndicator] = (field.indicators || []);

    if (field.tag === '999') {
      if (firstIndicator === 'f' && secondIndicator === 'f') {
        return true;
      }

      return false;
    }

    return true;
  };

  return {
    ...marcRecord,
    records: marcRecord.records.map((field) => (shouldRemoveFieldContent(field)
      ? {
        ...field,
        content: '',
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
    content: '',
    indicators: ['', ''],
  };

  records.splice(newIndex, 0, emptyRow);

  return records;
};

export const validateLeader = (prevLeader = '', leader = '') => {
  const cutEditableBytes = (str) => (
    [5, 8, 17, 18, 19].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (leader.length !== 24) {
    return 'ui-quick-marc.record.error.leader.length';
  }

  if (cutEditableBytes(prevLeader) !== cutEditableBytes(leader)) {
    return 'ui-quick-marc.record.error.leader.forbiddenBytes';
  }

  return undefined;
};

export const validateRecordTag = marcRecords => {
  if (marcRecords.some(({ tag }) => tag.length !== 3)) {
    return 'ui-quick-marc.record.error.tag.length';
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
    return 'ui-quick-marc.record.error.leader.fixedFieldMismatch';
  }

  return undefined;
};

export const validateMarcRecord = (marcRecord) => {
  const marcRecords = marcRecord.records || [];
  const recordLeader = marcRecords[0];

  const leaderError = validateLeader(marcRecord?.leader, recordLeader?.content);

  if (leaderError) {
    return leaderError;
  }

  const leaderMismatchError = validateRecordMismatch(marcRecords);

  if (leaderMismatchError) {
    return leaderMismatchError;
  }

  const tagError = validateRecordTag(marcRecords);

  if (tagError) {
    return tagError;
  }

  const titleRecords = marcRecords.filter(({ tag }) => tag === '245');

  if (titleRecords.length === 0) {
    return 'ui-quick-marc.record.error.title.empty';
  }

  if (titleRecords.length > 1) {
    return 'ui-quick-marc.record.error.title.multiple';
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

const getRecordsTrackChanges = (records) => {
  const trackCHanges = {
    lastRecordPosition: undefined,
    bytesFields: {},
  };

  records.forEach((record, idx) => {
    if (isLastRecord(record)) {
      trackCHanges.lastRecordPosition = idx;
    }

    if (isPhysDescriptionRecord(record)) {
      trackCHanges.bytesFields[idx] = {
        tag: record.tag,
        category: record?.content?.Category,
      };
    }

    if (isMaterialCharsRecord(record)) {
      trackCHanges.bytesFields[idx] = {
        tag: record.tag,
        type: record?.content?.Type,
      };
    }
  });

  return trackCHanges;
};

export const shouldRecordsUpdate = (prevRecords, newRecords) => {
  if (prevRecords.length !== newRecords.length) return true;

  const prevTrackChanges = getRecordsTrackChanges(prevRecords);
  const newTrackChanges = getRecordsTrackChanges(newRecords);

  if (prevTrackChanges.lastRecordPosition !== newTrackChanges.lastRecordPosition) return true;

  if (
    Object.keys(prevTrackChanges.bytesFields).length !== Object.keys(newTrackChanges.bytesFields).length
  ) return true;

  const hasBytesUpdates = Object.keys(prevTrackChanges.bytesFields).some(prevPosition => {
    const prevField = prevTrackChanges.bytesFields[prevPosition];
    const newField = newTrackChanges.bytesFields[prevPosition];

    return prevField.tag !== newField?.tag
      || prevField.category !== newField?.category
      || prevField.type !== newField?.type;
  });

  if (hasBytesUpdates) return true;

  return false;
};

export const removeFieldsForDuplicate = (formValues) => {
  const records = formValues.records;

  const filteredRecords = records.filter(recordRow => {
    if (isLastRecord(recordRow) || recordRow.tag === '001' || recordRow.tag === '005') {
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

export const fillWithSlashEmptyBytesFields = (formValues) => {
  const { records } = formValues;

  const recordsWithSubfieds = records.map((field) => {
    if (isString(field.content)) {
      return field;
    }

    const content = Object.entries(field.content).reduce((acc, [key, value]) => {
      if (isString(value)) {
        return {
          ...acc,
          [key]: value,
        };
      }

      return {
        ...acc,
        [key]: value.map(item => item || '\\'),
      };
    }, {});

    return {
      ...field,
      content,
    };
  });

  return {
    ...formValues,
    records: recordsWithSubfieds,
  };
};
