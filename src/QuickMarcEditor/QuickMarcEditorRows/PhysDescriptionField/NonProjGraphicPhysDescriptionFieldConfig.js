import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const NonProjGraphicPhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Primary support material',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Secondary support material',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default NonProjGraphicPhysDescriptionFieldConfig;
