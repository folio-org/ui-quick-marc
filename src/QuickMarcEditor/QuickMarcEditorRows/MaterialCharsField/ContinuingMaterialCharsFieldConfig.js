import { SUBFIELD_TYPES } from '../BytesField';

const ContinuingMaterialCharsFieldConfig = [
  {
    name: 'Regl',
    hint: 'Regularity',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Freq',
    hint: 'Frequency',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Orig',
    hint: 'Form of original item',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'EntW',
    hint: 'Nature of entire work',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    hint: 'Form of item',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Cont',
    hint: 'Nature of contents',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'SrTp',
    hint: 'Type of continuing resource',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    hint: 'Government publication',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Conf',
    hint: 'Conference publication',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Alph',
    hint: 'Original alphabet or script of title',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'S/L',
    hint: 'Entry convention',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default ContinuingMaterialCharsFieldConfig;
