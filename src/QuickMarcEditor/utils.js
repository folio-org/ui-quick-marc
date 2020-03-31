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
