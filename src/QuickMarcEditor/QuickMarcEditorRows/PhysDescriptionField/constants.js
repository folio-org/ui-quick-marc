import {
  SUBFIELD_TYPES,
} from '../BytesField';

const CATEGORY_VALUES = ['', 'a', 'c', 'd', 'f', 'g', 'h', 'k', 'm', 'o', 'q', 'r', 's', 't', 'v', 'z'];

export const STANDARD_PHYS_DESCR_FIELDS = [
  {
    name: 'Category',
    type: SUBFIELD_TYPES.SELECT,
    options: CATEGORY_VALUES.map(category => ({ label: category, value: category })),
  },
  {
    name: 'SMD',
    type: SUBFIELD_TYPES.BYTE,
  },
];
