import React from 'react';

import BookMaterialCharsField from './BookMaterialCharsField';
import ComputerFileMaterialCharsField from './ComputerFileMaterialCharsField';
import ContinuingMaterialCharsField from './ContinuingMaterialCharsField';
import MapMaterialCharsField from './MapMaterialCharsField';
import MixedMaterialCharsField from './MixedMaterialCharsField';
import MediaMaterialCharsField from './MediaMaterialCharsField';
import VisualMaterialCharsField from './VisualMaterialCharsField';
import UnknownMaterialCharsField from './UnknownMaterialCharsField';

export const MaterialCharsFieldFactory = {
  getMaterialCharsFieldByType(type) {
    let MaterialCharsField;

    switch (true) {
      case type === 's':
        MaterialCharsField = ContinuingMaterialCharsField;
        break;
      case ['a', 't'].includes(type):
        MaterialCharsField = BookMaterialCharsField;
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
      case ['c', 'd', 'i', 'j'].includes(type):
        MaterialCharsField = MediaMaterialCharsField;
        break;
      case ['g', 'k', 'o', 'r'].includes(type):
        MaterialCharsField = VisualMaterialCharsField;
        break;
      default:
        MaterialCharsField = UnknownMaterialCharsField;
    }

    return MaterialCharsField;
  },
  getMaterialCharsFieldField(name, type) {
    const MaterialCharsField = this.getMaterialCharsFieldByType(type);

    return <MaterialCharsField name={name} />;
  },
};
