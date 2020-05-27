import React from 'react';

import BookMaterialCharsField from './BookMaterialCharsField';
import ComputerFileMaterialCharsField from './ComputerFileMaterialCharsField';
import ContinuingMaterialCharsField from './ContinuingMaterialCharsField';
import MapMaterialCharsField from './MapMaterialCharsField';
import MixedMaterialCharsField from './MixedMaterialCharsField';
import ScoreMaterialCharsField from './ScoreMaterialCharsField';
import SoundMaterialCharsField from './SoundMaterialCharsField';
import VisualMaterialCharsField from './VisualMaterialCharsField';

export const MaterialCharsFieldFactory = {
  getMaterialCharsFieldField(name, type) {
    let MaterialCharsField;

    switch (true) {
      case ['a', 't'].includes(type):
        MaterialCharsField = BookMaterialCharsField;
        break;
      case type === 's':
        MaterialCharsField = ContinuingMaterialCharsField;
        break;
      case type === 'm':
        MaterialCharsField = ComputerFileMaterialCharsField;
        break;
      case ['e', 'f'].includes(type):
        MaterialCharsField = MapMaterialCharsField;
        break;
      case type === 'p':
        MaterialCharsField = MixedMaterialCharsField;
        break;
      case ['c', 'd'].includes(type):
        MaterialCharsField = ScoreMaterialCharsField;
        break;
      case ['i', 'j'].includes(type):
        MaterialCharsField = SoundMaterialCharsField;
        break;
      case ['g', 'k', 'o', 'r'].includes(type):
        MaterialCharsField = VisualMaterialCharsField;
        break;
      default:
        MaterialCharsField = null;
    }

    return MaterialCharsField ? <MaterialCharsField name={name} /> : null;
  },
};
