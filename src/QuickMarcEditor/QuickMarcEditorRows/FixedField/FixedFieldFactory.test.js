import '@folio/stripes-acq-components/test/jest/__mock__';

import { FixedFieldFactory } from './FixedFieldFactory';
import fixedFieldSpecBib from '../../../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../../../test/mocks/fixedFieldSpecAuth';
import fixedFieldSpecHold from '../../../../test/mocks/fixedFieldSpecHold';
import { SUBFIELD_TYPES } from '../BytesField';

describe('FixedFieldFactory', () => {
  const intl = {
    formatMessage: jest.fn(),
  };

  it('should create correct fixed field type', () => {
    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'a')().props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'd')().props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'x')().props.config.type,
    ).toBe(undefined);

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 't')().props.config.type,
    ).toBe('books');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'c')().props.config.type,
    ).toBe('scores');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'i')().props.config.type,
    ).toBe('sound_recordings');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'b')().props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'i')().props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 's')().props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 's')().props.config.type,
    ).toBe('continuing_resources');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'm')().props.config.type,
    ).toBe('computer_files');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'g')().props.config.type,
    ).toBe('visual_materials');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'e')().props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'f')().props.config.type,
    ).toBe('maps');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'p')().props.config.type,
    ).toBe('mixed_materials');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecAuth, 'z')().props.config.type,
    ).toBe('unknown');

    expect(
      FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecHold, 'u')().props.config.type,
    ).toBe('unknown');
  });

  describe('when document type is unknown', () => {
    it('should return undefined type when there is no matched field', () => {
      expect(
        FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'l')().props.config.type,
      ).toBe(undefined);
    });
  });

  describe('when type of document is defined', () => {
    it('should field not to be in config when is ReadOnly', () => {
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.fields;
      const fieldsEntered = fields.filter(x => x.name === 'Entered');

      expect(fieldsEntered).toHaveLength(0);
    });
  });

  describe('when document type is book', () => {
    it('should return type "String" for field Date1', () => {
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.fields;
      const fieldDate1 = fields.filter(x => x.name === 'Date1')[0];

      expect(fieldDate1.type).toBe(SUBFIELD_TYPES.STRING);
    });

    it('should return type "Bytes" for field Cont', () => {
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.fields;
      const fieldCont = fields.filter(x => x.name === 'Cont')[0];

      expect(fieldCont.type).toBe(SUBFIELD_TYPES.BYTES);
    });

    it('should return fields config with one select and one selects type', () => {
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.fields;
      const selectCount = fields.filter(x => x.type === SUBFIELD_TYPES.SELECT);
      const selectsCount = fields.filter(x => x.type === SUBFIELD_TYPES.SELECTS);

      expect(selectCount).toHaveLength(1);
      expect(selectsCount).toHaveLength(1);
    });
  });

  describe('when config has type select', () => {
    it('should have initialValue to be equal record content', () => {
      const content = {
        DtSt: 'b',
        Ills: ['a', 'b', 'c', 'd'],
      };
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm', content)().props.config.fields;
      const fieldDtSt = fields.filter(x => x.name === 'DtSt')[0];
      const fieldIlls = fields.filter(x => x.name === 'Ills')[0];

      expect(fieldDtSt.initialValue).toEqual(content.DtSt);
      expect(fieldIlls.initialValue).toEqual(content.Ills);
    });

    it('should have initialValue to be set as default when record has no content', () => {
      const fields = FixedFieldFactory.getFixedField(intl, 'records', fixedFieldSpecBib, 'a', 'm')().props.config.fields;
      const fieldDtSt = fields.filter(x => x.name === 'DtSt')[0];
      const fieldIlls = fields.filter(x => x.name === 'Ills')[0];

      expect(fieldDtSt.initialValue).toEqual('\\');
      expect(fieldIlls.initialValue).toEqual(['\\', '\\', '\\', '\\']);
    });
  });
});
