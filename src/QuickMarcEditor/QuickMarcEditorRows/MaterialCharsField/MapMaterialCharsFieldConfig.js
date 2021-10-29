import { SUBFIELD_TYPES } from '../BytesField';

const MapMaterialCharsFieldConfig = [
  {
    name: 'Relf',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
  },
  {
    name: 'Proj',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'CrTp',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'SpFm',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
];

export default MapMaterialCharsFieldConfig;
