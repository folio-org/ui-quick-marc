import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const MapPhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Physical medium',
  },
  {
    name: 'Type of reproduction',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Production/reproduction details',
  },
  {
    name: 'Positive/negative aspect',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default MapPhysDescriptionFieldConfig;
