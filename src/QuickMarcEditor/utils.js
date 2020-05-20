import uuid from 'uuid';

import { isLastRecord } from './QuickMarcEditorRows/utils';
import { LEADER_TAG } from './constants';

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

export const validateMarcRecord = marcRecord => {
  const marcRecords = marcRecord.records || [];

  const recordLeader = marcRecords[0];

  const leaderError = validateLeader(marcRecord?.leader, recordLeader?.content);

  const tagError = validateRecordTag(marcRecords);

  if (leaderError) {
    return leaderError;
  }

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

export const isLastRecordMoved = (prevRowsValue, newRowsValue) => {
  const prevStateIndex = prevRowsValue.findIndex(row => isLastRecord(row));
  const newStateIndex = newRowsValue?.findIndex(row => isLastRecord(row));

  return newStateIndex !== prevStateIndex;
};
