import '@folio/stripes-acq-components/test/jest/__mock__';

import { MaterialCharsFieldFactory } from './MaterialCharsFieldFactory';

import BookMaterialCharsField from './BookMaterialCharsField';
import ComputerFileMaterialCharsField from './ComputerFileMaterialCharsField';
import ContinuingMaterialCharsField from './ContinuingMaterialCharsField';
import MapMaterialCharsField from './MapMaterialCharsField';
import MixedMaterialCharsField from './MixedMaterialCharsField';
import ScoreMaterialCharsField from './ScoreMaterialCharsField';
import SoundMaterialCharsField from './SoundMaterialCharsField';
import VisualMaterialCharsField from './VisualMaterialCharsField';
import UnknownMaterialCharsField from './UnknownMaterialCharsField';

describe('MaterialCharsFieldFactory', () => {
  it('should create correct fields', () => {
    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'a', 'v').type.displayName,
    ).toBe(BookMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'a', 's').type.displayName,
    ).toBe(ContinuingMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'm').type.displayName,
    ).toBe(ComputerFileMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 's').type.displayName,
    ).toBe(ContinuingMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'f').type.displayName,
    ).toBe(MapMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'p').type.displayName,
    ).toBe(MixedMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'c').type.displayName,
    ).toBe(ScoreMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'i').type.displayName,
    ).toBe(SoundMaterialCharsField.displayName);

    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'r').type.displayName,
    ).toBe(VisualMaterialCharsField.displayName);
  });

  it('should return null when there is no matched field', () => {
    expect(
      MaterialCharsFieldFactory.getMaterialCharsFieldField('records', 'l').type.displayName,
    ).toBe(UnknownMaterialCharsField.displayName);
  });
});
