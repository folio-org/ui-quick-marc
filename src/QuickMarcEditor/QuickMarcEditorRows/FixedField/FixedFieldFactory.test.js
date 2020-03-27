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
      FixedFieldFactory.getFixedField('records', 'a', 'c').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'm').type.displayName,
    ).toBe(ComputerFileFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'a', 'i').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'f', 'c').type.displayName,
    ).toBe(MapFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'p', 'c').type.displayName,
    ).toBe(MixedMaterialFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'c', 'c').type.displayName,
    ).toBe(ScoreFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'i', 'c').type.displayName,
    ).toBe(SoundRecordingFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'a', 'c').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'r').type.displayName,
    ).toBe(VisualMaterialFixedField.displayName);
  });

  it('should return null when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'l'),
    ).toBe(null);
  });
});
