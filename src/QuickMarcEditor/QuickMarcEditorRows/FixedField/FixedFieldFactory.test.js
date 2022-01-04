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
import AuthorityFixedField from './AuthorityFixedField';
import { MARC_TYPES } from '../../../common/constants';

describe('FixedFieldFactory', () => {
  it('should create correct fields', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'a', 'm').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 't').type.displayName,
    ).toBe(BookFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS, 't').type.displayName,
    ).toBe(HoldingsFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'm').type.displayName,
    ).toBe(ComputerFileFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'a', 's').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 's').type.displayName,
    ).toBe(ContinuingResourceFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'f').type.displayName,
    ).toBe(MapFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'p').type.displayName,
    ).toBe(MixedMaterialFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'c').type.displayName,
    ).toBe(ScoreFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'i').type.displayName,
    ).toBe(SoundRecordingFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, 'r').type.displayName,
    ).toBe(VisualMaterialFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY).type.displayName,
    ).toBe(AuthorityFixedField.displayName);
  });

  it('should return null when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'bib', 'l'),
    ).toBe(null);
  });
});
