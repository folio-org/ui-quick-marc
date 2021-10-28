import { SUBFIELD_TYPES } from '../BytesField';

const ContinuingMaterialCharsFieldConfig = [
  {
    name: 'Regl',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Freq',
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
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Cont',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'SrTp',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Conf',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Alph',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'S/L',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default ContinuingMaterialCharsFieldConfig;
