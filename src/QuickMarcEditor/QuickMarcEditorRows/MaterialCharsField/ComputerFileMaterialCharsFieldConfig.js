import { SUBFIELD_TYPES } from '../BytesField';

const ComputerFileMaterialCharsFieldConfig = [
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
    name: 'File',
    hint: 'Type of computer file',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    hint: 'Government publication',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default ComputerFileMaterialCharsFieldConfig;
