import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const GlobePhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Physical medium',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Type of reproduction',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default GlobePhysDescriptionFieldConfig;
