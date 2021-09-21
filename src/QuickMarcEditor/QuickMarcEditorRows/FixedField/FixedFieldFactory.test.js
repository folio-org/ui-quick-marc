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
import HoldingsFixedField from './HoldingsFixedField';

describe('FixedFieldFactory', () => {
  it('should create correct fields', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'a', 'm').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 't').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'holdings', 't').type.displayName,
    ).toBe(HoldingsFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'm').type.displayName,
    ).toBe(ComputerFileFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'a', 's').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 's').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'f').type.displayName,
    ).toBe(MapFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'p').type.displayName,
    ).toBe(MixedMaterialFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'c').type.displayName,
    ).toBe(ScoreFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'i').type.displayName,
    ).toBe(SoundRecordingFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'r').type.displayName,
    ).toBe(VisualMaterialFixedField.displayName);
  });

  it('should return null when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'l'),
    ).toBe(null);
  });
});
