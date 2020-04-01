import uuid from 'uuid';

import { LEADER_TAG } from './constants';

export const dehydrateMarcRecordResponse = marcRecordResponse => ({
  ...marcRecordResponse,
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
