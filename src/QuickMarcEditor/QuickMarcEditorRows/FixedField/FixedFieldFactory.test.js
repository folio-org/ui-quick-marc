import '@folio/stripes-acq-components/test/jest/__mock__';

import { FixedFieldFactory } from './FixedFieldFactory';

import BibliographicFixedField from './BibliographicFixedField';
import HoldingsFixedField from './HoldingsFixedField';
import AuthorityFixedField from './AuthorityFixedField';
import { MARC_TYPES } from '../../../common/constants';
import fixedFieldSpecBib from '../../../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../../../test/mocks/fixedFieldSpecAuth';
import fixedFieldSpecHold from '../../../../test/mocks/fixedFieldSpecHold';

describe('FixedFieldFactory', () => {
  it('should create correct marc type fixed field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB).type.displayName,
    ).toBe(BibliographicFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY).type.displayName,
    ).toBe(AuthorityFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS).type.displayName,
    ).toBe(HoldingsFixedField.displayName);
  });

  it('should create correct fixed field type', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'm').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'a').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'd').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'x').props.config.type,
    ).toBe(undefined);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 't').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'c').props.config.type,
    ).toBe('scores');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'i').props.config.type,
    ).toBe('sound_recordings');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'b').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 'i').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'a', 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'm').props.config.type,
    ).toBe('computer_files');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'g').props.config.type,
    ).toBe('visual_materials');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'e').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'f').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'p').props.config.type,
    ).toBe('mixed_materials');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY, fixedFieldSpecAuth, 'z').props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY, fixedFieldSpecAuth, 'z').type.displayName,
    ).toBe(AuthorityFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS, fixedFieldSpecHold, 'u').props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS, fixedFieldSpecHold, 'u').type.displayName,
    ).toBe(HoldingsFixedField.displayName);
  });

  it('should return undefined type when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, fixedFieldSpecBib, 'l').props.config.type,
    ).toBe(undefined);
  });

  it('should return null when marc types is wrong', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'instance', fixedFieldSpecBib, 'l'),
    ).toBe(null);
  });
});
