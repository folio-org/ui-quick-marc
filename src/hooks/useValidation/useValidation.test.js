import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useValidation } from './useValidation';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';

const locations = [{
  code: 'VA/LI/D',
}, {
  code: 'LO/CA/TI/ON',
}];

const linkableBibFields = ['100', '600'];
const linkingRules = [
  {
    'id': 1,
    'bibField': '100',
    'authorityField': '100',
    'authoritySubfields': ['a', 'b', 'c', 'd', 'j', 'q'],
    'validation': { 'existence': [{ 't': false }] },
    'autoLinkingEnabled': true,
  },
  {
    'id': 8,
    'bibField': '600',
    'authorityField': '100',
    'authoritySubfields': ['a', 'b', 'c', 'd', 'g', 'j', 'q', 'f', 'h', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't'],
    'autoLinkingEnabled': false,
  },
  {
    'id': 12,
    'bibField': '650',
    'authorityField': '150',
    'authoritySubfields': ['a', 'b', 'g'],
    'autoLinkingEnabled': false,
  },
];

describe('useValidation', () => {
  describe('validateMarcRecord', () => {
    describe.only('when validating common rules', () => {
      const initialValues = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              Desc: 'i',
            },
          },
          {
            tag: '245',
            content: 'Test title',
            indicators: ['\\', '\\'],
          },
        ],
      };

      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.BIB,
        action: QUICK_MARC_ACTIONS.EDIT,
        locations,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
      };

      describe('when Leader length is not valid', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            leader: '04706cam a2200865Ii',
            records: [
              {
                content: '04706cam a2200865Ii',
                tag: 'LDR',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.leader.length');
        });
      });

      describe('when Leader non-editable bytes changed', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            leader: '04706cam a2200865Ii 4500',
            records: [
              {
                content: '14706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.leader.forbiddenBytes.bibliographic');
        });
      });

      describe('when Leader has not valid values in some positions', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            leader: '04706cam a2200865Ii 4500',
            records: [
              {
                content: '04706xam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.leader.invalidPositionValue');
        });
      });

      describe('when there is no 008 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            leader: '04706cam a2200865Ii 4500',
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.008.empty');
        });
      });

      describe('when there are multiple 008 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            leader: '04706cam a2200865Ii 4500',
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.008.multiple');
        });
      });

      describe('when tag length is not 3', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              { tag: '00' },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.tag.length');
        });
      });

      describe('when tag contains non-digit characters', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              { tag: '00a' },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.tag.nonDigits');
        });
      });

      describe('when fields contain empty subfields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
              {
                tag: '245',
                content: '',
                indicators: ['\\', '\\'],
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.subfield');
        });
      });

      describe('when there are multiple 001 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
              {
                tag: '001',
                content: '',
              },
              {
                tag: '001',
                content: '',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.controlField.multiple');
        });
      });
    });

    describe.only('when validating Bib record', () => {
      const initialValues = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              Desc: 'i',
            },
          },
          {
            tag: '245',
            content: 'Test title',
            indicators: ['\\', '\\'],
          },
        ],
      };

      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.BIB,
        action: QUICK_MARC_ACTIONS.EDIT,
        locations,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
      };

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
          };

          expect(result.current.validate(record.records)).not.toBeDefined();
        });
      });

      describe('when there is no 245 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.title.empty');
        });
      });

      describe('when there are multiple 245 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
              {
                tag: '245',
              },
              {
                tag: '245',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.title.multiple');
        });
      });

      describe('when there are multiple 010 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cam a2200865Ii 4500',
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
              {
                tag: '245',
              },
              {
                tag: '010',
              },
              {
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.010.multiple');
        });
      });

      describe('when there is $9 in a linkable field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '100',
                content: '$9 this is not valid',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.$9');
        });
      });

      describe('when there is $9 in a linked field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '100',
                subfieldGroups: {
                  uncontrolledNumber: '$9 this is not valid',
                },
                linkDetails: {
                  linkingRuleId: 1,
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.$9');
        });
      });

      describe('when there is $9 in a non-linkable field', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '300',
                content: '$9 this is valid',
              },
            ],
          };

          expect(result.current.validate(record.records)).not.toBeDefined();
        });
      });

      describe('when linked field contains controlled subfields in an uncontrolled group', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '100',
                subfieldGroups: {
                  uncontrolledAlpha: '$a this is a controlled subfield',
                },
                linkDetails: {
                  linkingRuleId: 1,
                },
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.fieldCantBeSaved');
        });
      });
    });

    describe.only('when validating Holdings record', () => {
      const initialValues = {
        leader: '04706cxm a2200865mi 4500',
        records: [
          {
            content: '04706cxm a2200865mi 4500',
            tag: 'LDR',
          },
          {
            content: {},
            tag: '008',
          },
          {
            tag: '852',
            content: '$b VA/LI/D',
          },
        ],
      };

      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.HOLDINGS,
        action: QUICK_MARC_ACTIONS.EDIT,
        locations,
        linksCount: 0,
        naturalId: null,
      };

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
          };

          expect(result.current.validate(record.records)).not.toBeDefined();
        });
      });

      describe('when there are multiple 004 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              { tag: '004' },
              { tag: '004' },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.instanceHrid.multiple');
        });
      });

      describe('when there is no 852 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cxm a2200865mi 4500',
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.location.empty');
        });
      });

      describe('when there are multiple 852 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cxm a2200865mi 4500',
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              { tag: '852' },
              { tag: '852' },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.location.multiple');
        });
      });

      describe('when there are multiple 852 $b subfields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cxm a2200865mi 4500',
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                content: '$b value $b this is not valid',
              },
            ],
          };

          expect(result.current.validate(record.records).props).toMatchObject({
            id: 'ui-quick-marc.record.error.field.onlyOneSubfield',
            values: {
              fieldTag: '852',
              subField: '$b',
            },
          });
        });
      });

      describe('when 852 $b does not have a valid location code', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cxm a2200865mi 4500',
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                content: '$b NOT_VALID_CODE',
              },
            ],
          };

          expect(result.current.validate(record.records).props.id).toEqual('ui-quick-marc.record.error.location.invalid');
        });
      });

      describe('when 852 $b does have a valid location code', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: '04706cxm a2200865mi 4500',
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                content: '$b VA/LI/D',
              },
            ],
          };

          expect(result.current.validate(record.records)).not.toBeDefined();
        });
      });
    });

    describe('when record is MARC Authority record', () => {
      it('should not return error message when record is valid', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              content: {},
              tag: '008',
            },
            {
              tag: '110',
              content: '$a Record title',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        })).not.toBeDefined();
      });

      it('should return error message when record is without 1XX row', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              content: {},
              tag: '008',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.heading.empty');
      });

      it('should return error message when record has several 1XX rows', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              content: {},
              tag: '008',
            },
            {
              tag: '100',
              content: '$a',
            },
            {
              tag: '110',
              content: '$a',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.heading.multiple');
      });

      it('should return error message when record has 010 field with several $a subfields', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              content: {},
              tag: '008',
            },
            {
              tag: '100',
              content: '$a',
            },
            {
              tag: '010',
              content: '$a Record $a title',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.010.$aOnlyOne');
      });

      it('should return error message when record has multiple 010 fields', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              content: {},
              tag: '008',
            },
            {
              tag: '100',
              content: '$a',
            },
            {
              tag: '010',
              content: '$a Record',
            },
            {
              tag: '010',
              content: '$a Record 2',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.010.multiple');
      });

      describe('when authority linked to bib record', () => {
        const linksCount = 1;
        const initialValues = {
          leader: '04706cxm a2200865ni 4500',
          records: [
            {
              content: '04706cxm a2200865ni 4500',
              tag: 'LDR',
            },
            {
              tag: '110',
              content: '$a Record title',
            },
            {
              content: {},
              tag: '008',
            },
          ],
        };

        it('should return an error if 1xx tag is changed', () => {
          const record = cloneDeep(initialValues);

          record.records[1].tag = '100';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.change');
        });

        it('should return an error if $t is added to 1xx field', () => {
          const record = cloneDeep(initialValues);

          record.records[1].content += ' $t';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.add$t');
        });

        it('should return an error if $t is removed from 1xx field', () => {
          const newInitialValues = cloneDeep(initialValues);

          newInitialValues.records[1].content += ' $t some text';

          const record = cloneDeep(initialValues);

          record.records[1].content.replace('$t', '');

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.remove$t');
        });

        it('should return an error if $t value is removed from 1xx field', () => {
          const newInitialValues = cloneDeep(initialValues);

          newInitialValues.records[1].content += ' $t some text';

          const record = cloneDeep(initialValues);

          record.records[1].content.replace('some text', '');

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.remove$t');
        });

        it('should return an error if 010 $a removed and 010 is linked', () => {
          const newInitialValues = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                content: '7394284',
                tag: '001',
              },
              {
                tag: '010',
                content: '$a n 83073672 $k naf',
              },
            ],
          };

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                content: '7394284',
                tag: '001',
              },
              {
                tag: '010',
                content: '$a  $k naf',
              },
            ],
          };

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount,
            naturalId: 'n83073672',
          }).props.id).toBe('ui-quick-marc.record.error.010.$aRemoved');
        });

        it('should return an error if 010 field is deleted and 010 is linked', () => {
          const newInitialValues = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                content: '7394284',
                tag: '001',
              },
              {
                tag: '010',
                content: '$a n 83073672',
              },
            ],
          };

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                content: '7394284',
                tag: '001',
              },
            ],
          };

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount,
            naturalId: 'n83073672',
          }).props.id).toBe('ui-quick-marc.record.error.010.removed');
        });
      });
    });
  });
});
