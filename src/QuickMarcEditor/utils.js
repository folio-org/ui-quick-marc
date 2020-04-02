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
  const titleRecords = (marcRecord.records || []).filter(({ tag }) => tag === '245');

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
