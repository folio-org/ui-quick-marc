import { STANDARD_PHYS_DESCR_FIELDS } from './constants';
import { SUBFIELD_TYPES } from '../BytesField';

const VideoPhysDescriptionFieldConfig = [
  ...STANDARD_PHYS_DESCR_FIELDS,
  {
    name: 'Color',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Videorecording format',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Sound on medium or separate',
  },
  {
    type: SUBFIELD_TYPES.BYTE,
    name: 'Medium for sound',
  },
  {
    name: 'Dimensions',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Configuration of playback channels',
    type: SUBFIELD_TYPES.BYTE,
  },
];

export default VideoPhysDescriptionFieldConfig;
