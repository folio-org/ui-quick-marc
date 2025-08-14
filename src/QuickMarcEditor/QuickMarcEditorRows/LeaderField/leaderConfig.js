import { SUBFIELD_TYPES } from '../BytesField';
import { MARC_TYPES } from '../../../common/constants';

export const recordLength = {
  name: 'Record length',
  type: SUBFIELD_TYPES.STRING,
  disabled: true,
  noLabel: true,
  defaultValue: '00000',
  width48: true,
};

const recordStatus = {
  name: 'Status',
  type: SUBFIELD_TYPES.SELECT,
  defaultValue: 'n',
};

const typeOfRecord = {
  name: 'Type',
  type: SUBFIELD_TYPES.SELECT,
};

const encodingLevel = {
  name: 'ELvl',
  type: SUBFIELD_TYPES.SELECT,
};

const positions19to23 = {
  name: '19-23 positions',
  type: SUBFIELD_TYPES.STRING,
  disabled: true,
  noLabel: true,
  width46: true,
  defaultValue: '\\4500',
};

export const leaderConfig = {
  [MARC_TYPES.BIB]: [
    recordLength,
    {
      ...recordStatus,
      position: 5,
      allowedValues: [
        {
          code: 'a',
          name: 'Increase in encoding level',
        }, {
          code: 'c',
          name: 'Corrected or revised',
        }, {
          code: 'd',
          name: 'Deleted',
        }, {
          code: 'n',
          name: 'New',
        }, {
          code: 'p',
          name: 'Increase in encoding level from prepublication',
        },
      ],
    },
    {
      ...typeOfRecord,
      required: true,
      defaultValue: '\\',
      position: 6,
      allowedValues: [
        {
          code: 'a',
          name: 'Language material',
        }, {
          code: 'c',
          name: 'Notated music',
        }, {
          code: 'd',
          name: 'Manuscript notated music',
        }, {
          code: 'e',
          name: 'Cartographic material',
        }, {
          code: 'f',
          name: 'Manuscript cartographic material',
        }, {
          code: 'g',
          name: 'Projected medium',
        }, {
          code: 'i',
          name: 'Nonmusical sound recording',
        }, {
          code: 'j',
          name: 'Musical sound recording',
        }, {
          code: 'k',
          name: 'Two-dimensional nonprojectable graphic',
        }, {
          code: 'm',
          name: 'Computer file',
        }, {
          code: 'o',
          name: 'Kit',
        }, {
          code: 'p',
          name: 'Mixed materials',
        }, {
          code: 'r',
          name: 'Three-dimensional artifact or naturally occurring object',
        }, {
          code: 't',
          name: 'Manuscript language material',
        },
      ],
    },
    {
      name: 'BLvl',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: '\\',
      position: 7,
      required: true,
      allowedValues: [
        {
          code: 'a',
          name: 'Monographic component part',
        }, {
          code: 'b',
          name: 'Serial component part',
        }, {
          code: 'c',
          name: 'Collection',
        }, {
          code: 'd',
          name: 'Subunit',
        }, {
          code: 'i',
          name: 'Integrating resource',
        }, {
          code: 'm',
          name: 'Monograph/Item',
        }, {
          code: 's',
          name: 'Serial',
        },
      ],
    },
    {
      name: 'Ctrl',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: '\\',
      position: 8,
      allowedValues: [
        {
          code: '\\',
          name: 'No specified type',
        }, {
          code: 'a',
          name: 'Archival',
        },
      ],
    },
    {
      name: '9-16 positions',
      type: SUBFIELD_TYPES.STRING,
      disabled: true,
      noLabel: true,
      defaultValue: 'a2200000',
    },
    {
      name: encodingLevel.name,
      type: SUBFIELD_TYPES.BYTE,
      length: 1,
      defaultValue: 'u',
    },
    {
      name: 'Desc',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: 'u',
      position: 18,
      allowedValues: [
        {
          code: '\\',
          name: 'Non-ISBD',
        }, {
          code: 'a',
          name: 'AACR2',
        }, {
          code: 'c',
          name: 'ISBD punctuation omitted',
        }, {
          code: 'i',
          name: 'ISBD punctuation included',
        }, {
          code: 'n',
          name: 'Non-ISBD punctuation omitted',
        }, {
          code: 'u',
          name: 'Unknown',
        },
      ],
    },
    {
      name: 'MultiLvl',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: '\\',
      position: 19,
      allowedValues: [
        {
          code: '\\',
          name: 'Not specified or not applicable',
        }, {
          code: 'a',
          name: 'Set',
        }, {
          code: 'b',
          name: 'Part with independent title',
        }, {
          code: 'c',
          name: 'Part with dependent title',
        },
      ],
    },
    {
      name: '20-23 positions',
      type: SUBFIELD_TYPES.STRING,
      disabled: true,
      noLabel: true,
      width40: true,
      defaultValue: '4500',
    },
  ],
  [MARC_TYPES.AUTHORITY]: [
    recordLength,
    {
      ...recordStatus,
      position: 5,
      allowedValues: [
        {
          code: 'a',
          name: 'Increase in encoding level',
        }, {
          code: 'c',
          name: 'Corrected or revised',
        }, {
          code: 'd',
          name: 'Deleted',
        }, {
          code: 'n',
          name: 'New',
        }, {
          code: 'o',
          name: 'Obsolete',
        }, {
          code: 's',
          name: 'Deleted; heading split into two or more headings',
        }, {
          code: 'x',
          name: 'Deleted; heading replaced by another heading',
        },
      ],
    },
    {
      ...typeOfRecord,
      defaultValue: 'z',
      position: 6,
      allowedValues: [
        {
          code: 'z',
          name: 'Authority data',
        },
      ],
    },
    {
      name: '7-16 positions',
      type: SUBFIELD_TYPES.STRING,
      disabled: true,
      noLabel: true,
      width82: true,
      defaultValue: '\\\\a2200000',
    },
    {
      ...encodingLevel,
      defaultValue: 'o',
      position: 17,
      allowedValues: [
        {
          code: 'n',
          name: 'Complete authority record',
        }, {
          code: 'o',
          name: 'Incomplete authority record',
        },
      ],
    },
    {
      name: 'Punct',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: '\\',
      position: 18,
      allowedValues: [
        {
          code: '\\',
          name: 'No information provided',
        }, {
          code: 'c',
          name: 'Punctuation omitted',
        }, {
          code: 'i',
          name: 'Punctuation included',
        }, {
          code: 'u',
          name: 'Unknown',
        },
      ],
    },
    positions19to23,
  ],
  [MARC_TYPES.HOLDINGS]: [
    recordLength,
    {
      ...recordStatus,
      position: 5,
      allowedValues: [
        {
          code: 'c',
          name: 'Corrected or revised',
        }, {
          code: 'd',
          name: 'Deleted',
        }, {
          code: 'n',
          name: 'New',
        },
      ],
    },
    {
      ...typeOfRecord,
      defaultValue: 'u',
      position: 6,
      allowedValues: [
        {
          code: 'u',
          name: 'Unknown',
        }, {
          code: 'v',
          name: 'Multipart item holdings',
        }, {
          code: 'x',
          name: 'Single-part item holdings',
        }, {
          code: 'y',
          name: 'Serial item holdings',
        },
      ],
    },
    {
      name: '7-16 positions',
      type: SUBFIELD_TYPES.STRING,
      disabled: true,
      noLabel: true,
      width82: true,
      defaultValue: '\\\\\\2200000',
    },
    {
      ...encodingLevel,
      defaultValue: 'u',
      position: 17,
      allowedValues: [
        {
          code: '1',
          name: 'Holdings level 1',
        }, {
          code: '2',
          name: 'Holdings level 2',
        }, {
          code: '3',
          name: 'Holdings level 3',
        }, {
          code: '4',
          name: 'Holdings level 4',
        }, {
          code: '5',
          name: 'Holdings level 4 with piece designation',
        }, {
          code: 'm',
          name: 'Mixed level',
        }, {
          code: 'u',
          name: 'Unknown',
        }, {
          code: 'z',
          name: 'Other level',
        },
      ],
    },
    {
      name: 'Item',
      type: SUBFIELD_TYPES.SELECT,
      defaultValue: 'n',
      position: 18,
      allowedValues: [
        {
          code: 'i',
          name: 'Item information',
        }, {
          code: 'n',
          name: 'No item information',
        },
      ],
    },
    positions19to23,
  ],
};
