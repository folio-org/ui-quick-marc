import { SUBFIELD_TYPES } from '../BytesField';

const MediaMaterialCharsFieldConfig = [
  {
    name: 'Comp',
    type: SUBFIELD_TYPES.STRING,
    length: 2,
  },
  {
    name: 'FMus',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Part',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Audn',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'AccM',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 6,
  },
  {
    name: 'LTxt',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'TrAr',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default MediaMaterialCharsFieldConfig;
