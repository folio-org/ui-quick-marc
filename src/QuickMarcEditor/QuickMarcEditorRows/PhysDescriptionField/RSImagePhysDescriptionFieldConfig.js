import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const RSImagePhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Altitude of sensor',
  },
  {
    name: 'Attitude of sensor',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Cloud cover',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Platform construction type',
  },
  {
    name: 'Platform use category',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Sensor type',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.STRING,
    name: 'Data type',
    length: 2,
  },
];

export default RSImagePhysDescriptionFieldConfig;
