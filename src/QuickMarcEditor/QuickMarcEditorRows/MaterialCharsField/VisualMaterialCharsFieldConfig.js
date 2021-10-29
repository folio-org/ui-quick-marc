import { SUBFIELD_TYPES } from '../BytesField';

const VisualMaterialCharsFieldConfig = [
  {
    name: 'Time',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'Audn',
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
    name: 'TMat',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Tech',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default VisualMaterialCharsFieldConfig;
