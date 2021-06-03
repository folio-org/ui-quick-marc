import { SUBFIELD_TYPES } from '../BytesField';

const CATEGORY_VALUES = ['', 'a', 'c', 'd', 'f', 'g', 'h', 'k', 'm', 'o', 'q', 'r', 's', 't', 'v', 'z'];

const PHYS_DESCRIPTION_KEY = 'ui-quick-marc.record.physDescription.categoryOfMaterial';

const CATEGORY_FIELD_NAME = 'Category';

export const CATEGORY_SELECT_FIELD_PROPS = {
  codes: CATEGORY_VALUES,
  name: CATEGORY_FIELD_NAME,
  key: PHYS_DESCRIPTION_KEY,
};

export const STANDARD_PHYS_DESCR_FIELDS = [
  {
    name: 'SMD',
    type: SUBFIELD_TYPES.BYTE,
  },
];
