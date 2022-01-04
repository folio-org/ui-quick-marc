import { MARC_TYPES } from '../common/constants';

export const LEADER_TAG = 'LDR';

export const LEADER_EDITABLE_BYTES = {
  [MARC_TYPES.BIB]: [5, 8, 17, 18, 19],
  [MARC_TYPES.HOLDINGS]: [5, 6, 17, 18],
  [MARC_TYPES.AUTHORITY]: [],
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
  [MARC_TYPES.AUTHORITY]: [
    { tag: LEADER_TAG },
    ...FIELD_TAGS_TO_REMOVE,
    { tag: '008' },
  ],
};

export const CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE = '00000nu\\\\\\2200000un\\4500';

export const CREATE_MARC_RECORD_DEFAULT_FIELD_TAGS = ['001', '004', '005', '008', '852', '999'];

export const QM_RECORD_STATUS_TIMEOUT = 5000;

export const QM_RECORD_STATUS_BAIL_TIME = 20000;

export const HOLDINGS_FIXED_FIELD_DEFAULT_VALUES = {
  AcqStatus: 0,
  AcqMethod: 'u',
  AcqEndDate: '////',
  'Gen ret': 0,
  'Spec ret': ['/', '/', '/'],
  Compl: 0,
  Copies: '///',
  Lend: 'u',
  Repro: 'u',
  Lang: 'eng',
  'Sep/comp': 0,
  'Rept date': '//////',
};

export const CORRESPONDING_HEADING_TYPE_TAGS = ['100', '110', '111', '151', '130', '150', '155'];
