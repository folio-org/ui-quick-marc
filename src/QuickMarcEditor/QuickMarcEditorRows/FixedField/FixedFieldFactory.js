import React from 'react';

import { MARC_TYPES } from '../../../common/constants';

import BookFixedField from './BookFixedField';
import ComputerFileFixedField from './ComputerFileFixedField';
import ContinuingResourceFixedField from './ContinuingResourceFixedField';
import MapFixedField from './MapFixedField';
import MixedMaterialFixedField from './MixedMaterialFixedField';
import ScoreFixedField from './ScoreFixedField';
import SoundRecordingFixedField from './SoundRecordingFixedField';
import VisualMaterialFixedField from './VisualMaterialFixedField';
import HoldingsFixedField from './HoldingsFixedField';
import AuthorityFixedField from './AuthorityFixedField';

export const FixedFieldFactory = {
  getFixedFieldByType(marcType, type, subtype) {
    let FixedField;

    switch (true) {
      case marcType === MARC_TYPES.HOLDINGS:
        FixedField = HoldingsFixedField;
        break;
      case marcType === MARC_TYPES.AUTHORITY:
        FixedField = AuthorityFixedField;
        break;
      case type === 'a' && ['b', 'i', 's'].includes(subtype):
      case type === 's':
        FixedField = ContinuingResourceFixedField;
        break;
      case type === 'a' && ['a', 'c', 'd', 'm'].includes(subtype):
      case type === 't':
        FixedField = BookFixedField;
        break;
      case type === 'm':
        FixedField = ComputerFileFixedField;
        break;
      case ['e', 'f'].includes(type):
        FixedField = MapFixedField;
        break;
      case type === 'p':
        FixedField = MixedMaterialFixedField;
        break;
      case ['c', 'd'].includes(type):
        FixedField = ScoreFixedField;
        break;
      case ['i', 'j'].includes(type):
        FixedField = SoundRecordingFixedField;
        break;
      case ['g', 'k', 'o', 'r'].includes(type):
        FixedField = VisualMaterialFixedField;
        break;
      default:
        FixedField = null;
    }

    return FixedField;
  },
  getFixedField(name, marcType, type, subtype) {
    const FixedField = this.getFixedFieldByType(marcType, type, subtype);

    return FixedField ? <FixedField name={name} /> : null;
  },
};
