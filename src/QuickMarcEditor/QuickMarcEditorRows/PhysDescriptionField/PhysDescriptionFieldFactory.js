import React from 'react';

import MapPhysDescriptionField from './MapPhysDescriptionField';
import ElResourcePhysDescriptionField from './ElResourcePhysDescriptionField';
import GlobePhysDescriptionField from './GlobePhysDescriptionField';
import TactilePhysDescriptionField from './TactilePhysDescriptionField';
import ProjGraphicPhysDescriptionField from './ProjGraphicPhysDescriptionField';
import MicroformDescriptionField from './MicroformDescriptionField';
import NonProjGraphicPhysDescriptionField from './NonProjGraphicPhysDescriptionField';
import PicturePhysDescriptionField from './PicturePhysDescriptionField';
import KitPhysDescriptionField from './KitPhysDescriptionField';
import MusicPhysDescriptionField from './MusicPhysDescriptionField';
import RSImagePhysDescriptionField from './RSImagePhysDescriptionField';
import SoundPhysDescriptionField from './SoundPhysDescriptionField';
import TextPhysDescriptionField from './TextPhysDescriptionField';
import VideoPhysDescriptionField from './VideoPhysDescriptionField';
import UnspecifiedPhysDescriptionField from './UnspecifiedPhysDescriptionField';
import UnknownPhysDescriptionField from './UnknownPhysDescriptionField';

export const PhysDescriptionFieldFactory = {
  getPhysDescriptionField(name, type) {
    let PhysDescriptionField;

    switch (type) {
      case 'a':
        PhysDescriptionField = MapPhysDescriptionField;
        break;
      case 'c':
        PhysDescriptionField = ElResourcePhysDescriptionField;
        break;
      case 'd':
        PhysDescriptionField = GlobePhysDescriptionField;
        break;
      case 'f':
        PhysDescriptionField = TactilePhysDescriptionField;
        break;
      case 'g':
        PhysDescriptionField = ProjGraphicPhysDescriptionField;
        break;
      case 'h':
        PhysDescriptionField = MicroformDescriptionField;
        break;
      case 'k':
        PhysDescriptionField = NonProjGraphicPhysDescriptionField;
        break;
      case 'm':
        PhysDescriptionField = PicturePhysDescriptionField;
        break;
      case 'o':
        PhysDescriptionField = KitPhysDescriptionField;
        break;
      case 'q':
        PhysDescriptionField = MusicPhysDescriptionField;
        break;
      case 'r':
        PhysDescriptionField = RSImagePhysDescriptionField;
        break;
      case 's':
        PhysDescriptionField = SoundPhysDescriptionField;
        break;
      case 't':
        PhysDescriptionField = TextPhysDescriptionField;
        break;
      case 'v':
        PhysDescriptionField = VideoPhysDescriptionField;
        break;
      case 'z':
        PhysDescriptionField = UnspecifiedPhysDescriptionField;
        break;
      default:
        PhysDescriptionField = UnknownPhysDescriptionField;
    }

    return <PhysDescriptionField name={name} />;
  },
};
