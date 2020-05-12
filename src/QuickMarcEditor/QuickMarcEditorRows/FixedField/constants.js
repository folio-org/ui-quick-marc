import { SUBFIELD_TYPES } from './FixedField';

export const BOOK_CONFIG = {
  colSizes: [1, 3, 2, 2, 2, 2],
  fields: [
    [
      {
        disabled: true,
        name: 'Type',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        name: 'Audn',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Ctrl',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        disabled: true,
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Conf',
      },
      {
        name: 'Biog',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      undefined,
      {
        name: 'Cont',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 4,
      },
      {
        name: 'GPub',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'LitF',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Indx',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ills',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 4,
      },
      {
        name: 'Fest',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

export const COMPUTER_CONFIG = {
  colSizes: [2, 2, 2, 2, 2, 2],
  fields: [
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Type',
        disabled: true,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Audn',
      },
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        disabled: true,
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'GPub',
      },
      undefined,
      {
        name: 'MRec',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'File',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

export const CONTINUING_RESOURCE = {
  colSizes: [2, 2, 2, 2, 2, 2],
  fields: [
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
        name: 'Type',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'GPub',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Ctrl',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
        name: 'BLvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Conf',
      },
      {
        name: 'Freq',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Ctry',
      },
    ],
    [
      {
        name: 'S/L',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Orig',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'EntW',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Regl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Alph',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'SrTp',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Cont',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 3,
      },
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

export const MAP_CONFIG = {
  colSizes: [1, 2, 2, 3, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Relf',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 4,
      },
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Lang',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'GPub',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'SpFm',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 2,
      },
      {
        name: 'MRec',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'CrTp',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Indx',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Proj',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
  ],
};

export const MIXED_MATERIAL = {
  colSizes: [2, 2, 2, 2, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Lang',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
      undefined,
      {
        name: 'MRec',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
      undefined,
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

export const SCORE_CONFIG = {
  colSizes: [1, 1, 2, 4, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Audn',
      },
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        name: 'Comp',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        type: SUBFIELD_TYPES.BYTES,
        name: 'AccM',
        bytes: 6,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Ctry',
      },
    ],
    [
      undefined,
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Part',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'TrAr',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Desc',
      },
      {
        name: 'FMus',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'LTxt',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'DtSt',
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Date2',
      },
    ],
  ],
};

export const SOUND_RECORDING_CONFIG = {
  colSizes: [1, 1, 2, 4, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        name: 'Audn',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Ctrl',
      },
      {
        name: 'Lang',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        disabled: true,
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Comp',
      },
      {
        bytes: 6,
        name: 'AccM',
        type: SUBFIELD_TYPES.BYTES,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      undefined,
      {
        name: 'Part',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'TrAr',
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'FMus',
      },
      {
        name: 'LTxt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'DtSt',
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Date2',
      },
    ],
  ],
};

export const VISUAL_MATERIAL_CONFIG = {
  colSizes: [1, 1, 2, 4, 2, 2],
  fields: [
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Type',
        disabled: true,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        name: 'Audn',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'BLvl',
        disabled: true,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Comp',
      },
      {
        type: SUBFIELD_TYPES.BYTES,
        name: 'AccM',
        bytes: 6,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      undefined,
      {
        name: 'Part',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'TrAr',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Desc',
      },
      {
        name: 'FMus',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'LTxt',
      },
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Date1',
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};
