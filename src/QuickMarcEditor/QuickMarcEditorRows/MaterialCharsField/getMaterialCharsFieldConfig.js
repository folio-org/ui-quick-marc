import BookMaterialCharsFieldConfig from './BookMaterialCharsFieldConfig';
import ComputerFileMaterialCharsFieldConfig from './ComputerFileMaterialCharsFieldConfig';
import ContinuingMaterialCharsFieldConfig from './ContinuingMaterialCharsFieldConfig';
import MapMaterialCharsFieldConfig from './MapMaterialCharsFieldConfig';
import MixedMaterialCharsFieldConfig from './MixedMaterialCharsFieldConfig';
import MediaMaterialCharsFieldConfig from './MediaMaterialCharsFieldConfig';
import VisualMaterialCharsFieldConfig from './VisualMaterialCharsFieldConfig';
import UnknownMaterialCharsFieldConfig from './UnknownMaterialCharsFieldConfig';

const getMaterialCharsFieldConfig = (type) => {
  switch (true) {
    case type === 's':
      return ContinuingMaterialCharsFieldConfig;
    case ['a', 't'].includes(type):
      return BookMaterialCharsFieldConfig;
    case type === 'm':
      return ComputerFileMaterialCharsFieldConfig;
    case ['e', 'f'].includes(type):
      return MapMaterialCharsFieldConfig;
    case type === 'p':
      return MixedMaterialCharsFieldConfig;
    case ['c', 'd', 'i', 'j'].includes(type):
      return MediaMaterialCharsFieldConfig;
    case ['g', 'k', 'o', 'r'].includes(type):
      return VisualMaterialCharsFieldConfig;
    default:
      return UnknownMaterialCharsFieldConfig;
  }
};

export default getMaterialCharsFieldConfig;
