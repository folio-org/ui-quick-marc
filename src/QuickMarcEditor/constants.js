export const LEADER_TAG = 'LDR';

export const QUICK_MARC_ACTIONS = {
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

export const FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS = [
  { tag: LEADER_TAG },
  ...FIELD_TAGS_TO_REMOVE,
  { tag: '006' },
  { tag: '007' },
  { tag: '008' },
];

export const QM_RECORD_STATUS_TIMEOUT = 5000;

export const QM_RECORD_STATUS_BAIL_TIME = 20000;
