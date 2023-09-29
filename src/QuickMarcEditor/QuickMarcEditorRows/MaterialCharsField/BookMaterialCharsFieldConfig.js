import { SUBFIELD_TYPES } from '../BytesField';

const BookMaterialCharsFieldConfig = [
  {
    name: 'Ills',
    hint: 'Illustrations',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Cont',
    hint: 'Nature of contents',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Fest',
    hint: 'Festschrift',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    hint: 'Index',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'LitF',
    hint: 'Literary form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Biog',
    hint: 'Biography',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default BookMaterialCharsFieldConfig;
