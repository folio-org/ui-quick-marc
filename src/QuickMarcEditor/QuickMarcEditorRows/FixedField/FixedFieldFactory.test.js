import '@folio/stripes-acq-components/test/jest/__mock__';

import { FixedFieldFactory } from './FixedFieldFactory';
import fixedFieldSpecBib from '../../../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../../../test/mocks/fixedFieldSpecAuth';
import fixedFieldSpecHold from '../../../../test/mocks/fixedFieldSpecHold';

describe('FixedFieldFactory', () => {
  it('should create correct fixed field type', () => {
    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'm').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'a').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'd').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'x').props.config.type,
    ).toBe(undefined);

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 't').props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'c').props.config.type,
    ).toBe('scores');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'i').props.config.type,
    ).toBe('sound_recordings');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'b').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 'i').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'a', 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 's').props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'm').props.config.type,
    ).toBe('computer_files');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'g').props.config.type,
    ).toBe('visual_materials');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'e').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'f').props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'p').props.config.type,
    ).toBe('mixed_materials');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecAuth, 'z').props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecHold, 'u').props.config.type,
    ).toBe('unknown');
  });

  it('should return undefined type when there is no matched field', () => {
    expect(
      FixedFieldFactory.getFixedField('records', fixedFieldSpecBib, 'l').props.config.type,
    ).toBe(undefined);
  });
});
