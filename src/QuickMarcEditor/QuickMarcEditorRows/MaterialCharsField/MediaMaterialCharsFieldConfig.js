import { SUBFIELD_TYPES } from '../BytesField';

const MediaMaterialCharsFieldConfig = [
  {
    name: 'Comp',
    hint: 'Form of composition',
    type: SUBFIELD_TYPES.STRING,
    length: 2,
  },
  {
    name: 'FMus',
    hint: 'Format of music',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Part',
    hint: 'Music parts',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Audn',
    hint: 'Target audience',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    hint: 'Form of item',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'AccM',
    hint: 'Accompanying matter',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 6,
  },
  {
    name: 'LTxt',
    hint: 'Literary text for sound recordings',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'TrAr',
    hint: 'Transposition and arrangement',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default MediaMaterialCharsFieldConfig;
