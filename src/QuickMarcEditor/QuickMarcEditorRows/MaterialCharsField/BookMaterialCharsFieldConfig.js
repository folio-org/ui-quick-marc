import { SUBFIELD_TYPES } from '../BytesField';

const BookMaterialCharsFieldConfig = [
  {
    name: 'Ills',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Cont',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Fest',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'LitF',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Biog',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default BookMaterialCharsFieldConfig;
