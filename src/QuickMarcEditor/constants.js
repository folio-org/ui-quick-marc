import { MARC_TYPES } from '../common/constants';

export const LEADER_TAG = 'LDR';
export const FIXED_FIELD_TAG = '008';

export const TAG_LENGTH = 3;

export const LEADER_EDITABLE_BYTES = {
  [MARC_TYPES.BIB]: [5, 6, 7, 8, 17, 18, 19],
  [MARC_TYPES.HOLDINGS]: [5, 6, 17, 18],
  [MARC_TYPES.AUTHORITY]: [5, 17, 18],
};

export const LEADER_DOCUMENTATION_LINKS = {
  [MARC_TYPES.BIB]: 'https://loc.gov/marc/bibliographic/bdleader.html',
  [MARC_TYPES.HOLDINGS]: 'https://www.loc.gov/marc/holdings/hdleader.html',
  [MARC_TYPES.AUTHORITY]: 'https://www.loc.gov/marc/authority/adleader.html',
};

export const QUICK_MARC_ACTIONS = {
  CREATE: 'create',
  EDIT: 'edit',
  DERIVE: 'derive',
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

export const CREATE_HOLDINGS_RECORD_DEFAULT_FIELD_TAGS = ['001', '004', '005', '008', '852', '999'];

export const CREATE_BIB_RECORD_DEFAULT_FIELD_TAGS = ['001', '005', '008', '245', '999'];

export const CREATE_AUTHORITY_RECORD_DEFAULT_FIELD_TAGS = ['001', '005', '008', '999'];

export const QM_RECORD_STATUS_TIMEOUT = 5000;

export const QM_RECORD_STATUS_BAIL_TIME = 20000;

export const ELVL_BYTE = 'ELvl';

export const ENTERED_KEY = 'Entered';

export const HOLDINGS_FIXED_FIELD_DEFAULT_VALUES = {
  AcqStatus: 0,
  AcqMethod: 'u',
  AcqEndDate: '\\\\\\\\',
  'Gen ret': 0,
  'Spec ret': ['\\', '\\', '\\'],
  Compl: 0,
  Copies: '\\\\\\',
  Lend: 'u',
  Repro: 'u',
  Lang: 'eng',
  'Sep/comp': 0,
  'Rept date': '\\\\\\\\\\\\',
};

export const BIB_FIXED_FIELD_DEFAULT_TYPE = 'a';
export const BIB_FIXED_FIELD_DEFAULT_BLVL = 'm';

export const AUTHORITY_FIXED_FIELD_DEFAULT_TYPE = 'z';

export const CORRESPONDING_HEADING_TYPE_TAGS = ['100', '110', '111', '151', '130', '150', '155'];

export const AUTOLINKING_STATUSES = {
  NEW: 'NEW',
  ERROR: 'ERROR',
};

export const AUTOLINKING_ERROR_CODES = {
  AUTHORITY_NOT_FOUND: '101',
  MULTIPLE_AUTHORITIES_FOUND: '102',
  AUTOLINKING_DISABLED: '103',
};

export const UNCONTROLLED_ALPHA = 'uncontrolledAlpha';
export const UNCONTROLLED_NUMBER = 'uncontrolledNumber';
export const UNCONTROLLED_SUBFIELDS = [UNCONTROLLED_ALPHA, UNCONTROLLED_NUMBER];
