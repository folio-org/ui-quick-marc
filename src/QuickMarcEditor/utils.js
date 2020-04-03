import uuid from 'uuid';

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
