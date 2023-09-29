import '@folio/stripes-acq-components/test/jest/__mock__';

import { FixedFieldFactory } from './FixedFieldFactory';

import BibliographicFixedField from './BibliographicFixedField';
import HoldingsFixedField from './HoldingsFixedField';
import AuthorityFixedField from './AuthorityFixedField';
import { MARC_TYPES } from '../../../common/constants';
import marcSpecificationBib from '../../../../test/mocks/marcSpecificationBib';
import marcSpecificationAuth from '../../../../test/mocks/marcSpecificationAuth';
import marcSpecificationHold from '../../../../test/mocks/marcSpecificationHold';

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

  it('should create correct document type', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'm').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'a').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'd').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'x').props.config.type,
    ).toBe(undefined);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 't').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'c').props.config.type,
    ).toBe('scores');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'i').props.config.type,
    ).toBe('sound_recordings');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'b').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 'i').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'a', 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'm').props.config.type,
    ).toBe('computer_files');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'g').props.config.type,
    ).toBe('visual_materials');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'e').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'f').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'p').props.config.type,
    ).toBe('mixed_materials');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY, marcSpecificationAuth, 'z').props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.AUTHORITY, marcSpecificationAuth, 'z').type.displayName,
    ).toBe(AuthorityFixedField.displayName);

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS, marcSpecificationHold, 'u').props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.HOLDINGS, marcSpecificationHold, 'u').type.displayName,
    ).toBe(HoldingsFixedField.displayName);
  });

  it('should return undefined type when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', MARC_TYPES.BIB, marcSpecificationBib, 'l').props.config.type,
    ).toBe(undefined);
  });

  it('should return null when marc types is wrong', () => {
    expect(
      FixedFieldFactory.getFixedField('records', 'instance', marcSpecificationBib, 'l'),
    ).toBe(null);
  });
});
