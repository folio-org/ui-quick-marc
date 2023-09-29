import { SUBFIELD_TYPES } from '../BytesField';

const VisualMaterialCharsFieldConfig = [
  {
    name: 'Time',
    hint: 'Running time for motion pictures and videorecordings',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'Audn',
    hint: 'Target audience',
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
    name: 'TMat',
    hint: 'Type of visual material',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Tech',
    hint: 'Technique',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default VisualMaterialCharsFieldConfig;
