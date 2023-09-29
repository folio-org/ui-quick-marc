import { SUBFIELD_TYPES } from '../BytesField';

const MapMaterialCharsFieldConfig = [
  {
    name: 'Relf',
    hint: 'Relief',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
  },
  {
    name: 'Proj',
    hint: 'Projection',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'CrTp',
    hint: 'Type of cartographic material',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    hint: 'Government publication',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    hint: 'Form of item',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    hint: 'Index',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'SpFm',
    hint: 'Special format characteristics',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
];

export default MapMaterialCharsFieldConfig;
