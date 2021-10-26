
import MapPhysDescriptionFieldConfig from './MapPhysDescriptionFieldConfig';
import ElResourcePhysDescriptionFieldConfig from './ElResourcePhysDescriptionFieldConfig';
import GlobePhysDescriptionFieldConfig from './GlobePhysDescriptionFieldConfig';
import TactilePhysDescriptionFieldConfig from './TactilePhysDescriptionFieldConfig';
import ProjGraphicPhysDescriptionFieldConfig from './ProjGraphicPhysDescriptionFieldConfig';
import MicroformDescriptionFieldConfig from './MicroformDescriptionFieldConfig';
import NonProjGraphicPhysDescriptionFieldConfig from './NonProjGraphicPhysDescriptionFieldConfig';
import PicturePhysDescriptionFieldConfig from './PicturePhysDescriptionFieldConfig';
import KitPhysDescriptionFieldConfig from './KitPhysDescriptionFieldConfig';
import MusicPhysDescriptionFieldConfig from './MusicPhysDescriptionFieldConfig';
import RSImagePhysDescriptionFieldConfig from './RSImagePhysDescriptionFieldConfig';
import SoundPhysDescriptionFieldConfig from './SoundPhysDescriptionFieldConfig';
import TextPhysDescriptionFieldConfig from './TextPhysDescriptionFieldConfig';
import VideoPhysDescriptionFieldConfig from './VideoPhysDescriptionFieldConfig';
import UnspecifiedPhysDescriptionFieldConfig from './UnspecifiedPhysDescriptionFieldConfig';
import UnknownPhysDescriptionFieldConfig from './UnknownPhysDescriptionFieldConfig';

const getPhysDescriptionFieldConfig = (type) => {
  switch (type) {
    case 'a':
      return MapPhysDescriptionFieldConfig;
    case 'c':
      return ElResourcePhysDescriptionFieldConfig;
    case 'd':
      return GlobePhysDescriptionFieldConfig;
    case 'f':
      return TactilePhysDescriptionFieldConfig;
    case 'g':
      return ProjGraphicPhysDescriptionFieldConfig;
    case 'h':
      return MicroformDescriptionFieldConfig;
    case 'k':
      return NonProjGraphicPhysDescriptionFieldConfig;
    case 'm':
      return PicturePhysDescriptionFieldConfig;
    case 'o':
      return KitPhysDescriptionFieldConfig;
    case 'q':
      return MusicPhysDescriptionFieldConfig;
    case 'r':
      return RSImagePhysDescriptionFieldConfig;
    case 's':
      return SoundPhysDescriptionFieldConfig;
    case 't':
      return TextPhysDescriptionFieldConfig;
    case 'v':
      return VideoPhysDescriptionFieldConfig;
    case 'z':
      return UnspecifiedPhysDescriptionFieldConfig;
    default:
      return UnknownPhysDescriptionFieldConfig;
  }
};

export default getPhysDescriptionFieldConfig;
