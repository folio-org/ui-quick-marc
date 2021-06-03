const TYPE_VALUES = ['', 'a', 'c', 'd', 'e', 'f', 'g', 'i', 'j', 'k', 'm', 'o', 'p', 'r', 's', 't'];

const MATERIAL_CHARS_KEY = 'ui-quick-marc.record.materialChars.materialType';

const TYPE_FIELD_NAME = 'Type';

export const TYPE_SELECT_FIELD_PROPS = {
  name: TYPE_FIELD_NAME,
  codes: TYPE_VALUES,
  key: MATERIAL_CHARS_KEY,
};
