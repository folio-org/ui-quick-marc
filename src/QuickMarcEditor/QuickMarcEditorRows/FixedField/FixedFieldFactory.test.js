import '@folio/stripes-acq-components/test/jest/__mock__';

import { FixedFieldFactory } from './FixedFieldFactory';

import BookFixedField from './BookFixedField';
import ComputerFileFixedField from './ComputerFileFixedField';
import ContinuingResourceFixedField from './ContinuingResourceFixedField';
import MapFixedField from './MapFixedField';
import MixedMaterialFixedField from './MixedMaterialFixedField';
import ScoreFixedField from './ScoreFixedField';
import SoundRecordingFixedField from './SoundRecordingFixedField';
import VisualMaterialFixedField from './VisualMaterialFixedField';

describe('FixedFieldFactory', () => {
  it('should create correct fields', () => {
    expect(
      FixedFieldFactory.getFixedFied('records', 'a', 'c').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'm').type.displayName,
    ).toBe(ComputerFileFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'a', 'i').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'f', 'c').type.displayName,
    ).toBe(MapFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'p', 'c').type.displayName,
    ).toBe(MixedMaterialFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'c', 'c').type.displayName,
    ).toBe(ScoreFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'i', 'c').type.displayName,
    ).toBe(SoundRecordingFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'a', 'c').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedFied('records', 'r').type.displayName,
    ).toBe(VisualMaterialFixedField.displayName);
  });

  it('should return null when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedFied('records', 'l'),
    ).toBe(null);
  });
});
