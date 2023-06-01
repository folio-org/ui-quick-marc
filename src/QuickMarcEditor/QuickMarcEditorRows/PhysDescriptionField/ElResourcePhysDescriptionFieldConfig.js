import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const ElResourcePhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Dimensions',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Sound',
  },
  {
    name: 'Image bit depth',
    type: SUBFIELD_TYPES.STRING,
    length: 3,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'File formats',
  },
  {
    name: 'Quality assurance target(s)',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Antecedent/ Source',
  },
  {
    name: 'Level of compression',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Reformatting quality',
  },
];

export default ElResourcePhysDescriptionFieldConfig;
