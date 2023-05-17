import { MARC_TYPES } from '../common/constants';

export const LEADER_TAG = 'LDR';

export const LEADER_EDITABLE_BYTES = {
  [MARC_TYPES.BIB]: [5, 6, 7, 8, 17, 18, 19],
  [MARC_TYPES.HOLDINGS]: [5, 6, 17, 18],
  [MARC_TYPES.AUTHORITY]: [5, 17, 18],
};

export const NON_BREAKING_SPACE = '\u00A0';

export const LEADER_VALUES_FOR_POSITION = {
  [MARC_TYPES.BIB]: {
    5: ['a', 'c', 'd', 'n', 'p'],
    6: ['a', 'c', 'd', 'e', 'f', 'g', 'i', 'j', 'k', 'm', 'o', 'p', 'r', 't'],
    7: ['a', 'b', 'c', 'd', 'i', 'm', 's'],
    8: ['\\', ' ', NON_BREAKING_SPACE, 'a'],
    18: ['\\', ' ', NON_BREAKING_SPACE, 'a', 'c', 'i', 'n', 'u'],
    19: ['\\', ' ', NON_BREAKING_SPACE, 'a', 'b', 'c'],
  },
  [MARC_TYPES.HOLDINGS]: {
    5: ['c', 'd', 'n'],
    6: ['u', 'v', 'x', 'y'],
    17: ['1', '2', '3', '4', '5', 'm', 'u', 'z'],
    18: ['\\', ' ', NON_BREAKING_SPACE, 'i', 'n'],
  },
  [MARC_TYPES.AUTHORITY]: {
    5: ['a', 'c', 'd', 'n', 'o', 's', 'x'],
    17: ['n', 'o'],
    18: ['\\', ' ', NON_BREAKING_SPACE, 'c', 'i', 'u'],
  },
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

export const CREATE_HOLDINGS_RECORD_DEFAULT_LEADER_VALUE = '00000nu\\\\\\2200000un\\4500';

export const CREATE_BIB_RECORD_DEFAULT_LEADER_VALUE = '00000n\\\\\\a2200000uu\\4500';

export const CREATE_HOLDINGS_RECORD_DEFAULT_FIELD_TAGS = ['001', '004', '005', '008', '852', '999'];

export const CREATE_BIB_RECORD_DEFAULT_FIELD_TAGS = ['001', '005', '008', '245', '999'];

export const QM_RECORD_STATUS_TIMEOUT = 5000;

export const QM_RECORD_STATUS_BAIL_TIME = 20000;

export const ELVL_BYTE = 'ELvl';

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
export const BIB_FIXED_FIELD_DEFAULT_BLVL = 'b';

export const BIB_FIXED_FIELD_DEFAULT_VALUES = {
  Srce: '\\',
  Audn: '\\',
  Ctrl: '',
  Lang: '\\\\\\',
  Form: '\\',
  Conf: '\\',
  Biog: '\\',
  MRec: '\\',
  Ctry: '\\\\\\',
  Cont: ['\\', '\\', '\\', '\\'],
  GPub: '\\',
  LitF: '\\',
  Indx: '\\',
  Ills: ['\\', '\\', '\\', '\\'],
  Fest: '\\',
  DtSt: '\\',
  Date1: '\\\\\\\\',
  Date2: '\\\\\\\\',
  Type: BIB_FIXED_FIELD_DEFAULT_TYPE,
  BLvl: BIB_FIXED_FIELD_DEFAULT_BLVL,
};

export const CORRESPONDING_HEADING_TYPE_TAGS = ['100', '110', '111', '151', '130', '150', '155'];
