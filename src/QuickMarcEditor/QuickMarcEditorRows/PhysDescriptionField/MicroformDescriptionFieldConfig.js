import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const MicroformDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Positive/negative aspect',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Reduction ratio range/Reduction ratio',
    type: SUBFIELD_TYPES.STRING,
  },
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Emulsion on film',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Generation',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Base of film',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default MicroformDescriptionFieldConfig;
