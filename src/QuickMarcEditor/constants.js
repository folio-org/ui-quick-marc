import { MARC_TYPES } from '../common/constants';

export const LEADER_TAG = 'LDR';

export const LEADER_EDITABLE_BYTES = {
  [MARC_TYPES.BIB]: [5, 8, 17, 18, 19],
  [MARC_TYPES.HOLDINGS]: [5, 6, 17, 18],
};

export const QUICK_MARC_ACTIONS = {
  CREATE: 'create',
  EDIT: 'edit',
  DUPLICATE: 'duplicate',
};

export const FIELD_TAGS_TO_REMOVE = [
  { tag: '001' },
  { tag: '005' },
  { tag: '019' },
  { tag: '035' },
  {
    tag: '999',
    indicators: ['f', 'f'],
  },
];

export const FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS = {
  [MARC_TYPES.BIB]: [
    { tag: LEADER_TAG },
    ...FIELD_TAGS_TO_REMOVE,
    { tag: '003' },
    { tag: '006' },
    { tag: '007' },
    { tag: '008' },
  ],
  [MARC_TYPES.HOLDINGS]: [
    { tag: LEADER_TAG },
    ...FIELD_TAGS_TO_REMOVE,
    { tag: '003' },
    { tag: '004' },
    { tag: '006' },
    { tag: '007' },
    { tag: '008' },
  ],
};

export const CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE = '00000nu\\\\\\2200000un\\4500';

export const CREATE_MARC_RECORD_DEFAULT_FIELD_TAGS = ['001', '004', '005', '999'];

export const QM_RECORD_STATUS_TIMEOUT = 5000;

export const QM_RECORD_STATUS_BAIL_TIME = 20000;
