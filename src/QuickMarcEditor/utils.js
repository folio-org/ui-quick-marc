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
  };

  records.splice(newIndex, 0, emptyRow);

  return records;
};

export const validateMarcRecord = marcRecord => {
  const marcRecords = marcRecord.records || [];

  const recordLeader = marcRecords[0];
  const fixedField = marcRecords.filter(({ tag }) => tag === '008')[0];

  if (
    !recordLeader
    || !fixedField
    || recordLeader.content[6] !== fixedField.content.Type
    || recordLeader.content[7] !== fixedField.content.BLvl
  ) {
    return 'ui-quick-marc.record.error.typeIsNotMatched';
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
