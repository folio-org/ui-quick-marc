import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import Harness from '../../../test/jest/helpers/harness';
import { useValidation } from './useValidation';
import { useValidate } from '../../queries';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import { MISSING_FIELD_ID } from './constants';
import fixedFieldSpecBib from '../../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../../test/mocks/fixedFieldSpecAuth';
import {
  authorityLeader,
  authorityLeaderString,
  bibLeader,
  bibLeaderString,
  holdingsLeader,
} from '../../../test/jest/fixtures/leaders';

jest.mock('../../queries', () => ({
  useValidate: jest.fn().mockReturnValue({
    validate: jest.fn(),
  }),
  useLccnDuplicateConfig: jest.fn().mockReturnValue({
    duplicateLccnCheckingEnabled: true,
  }),
}));

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

const quickMarcContext = {
  validationErrorsRef: { current: {} },
  setValidationErrors: jest.fn(),
};

const getWrapper = (extraProps = {}) => props => (
  <Harness
    quickMarcContext={quickMarcContext}
    {...props}
    {...extraProps}
  />
);

const mockValidate = jest.fn().mockReturnValue({
  issues: [{
    message: 'error message',
    tag: '245[0]',
    severity: 'error',
  }],
});

describe('useValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when validating common rules', () => {
    const testCommonValidationRules = ({ marcContext }) => {
      const {
        initialValues,
        marcType,
      } = marcContext;

      describe('when Leader length is not valid', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: {
                  ...initialValues.leader,
                  'Record length': initialValues.leader['Record length'].slice(1),
                },
                tag: 'LDR',
                id: 'leader-id',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['leader-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.leader.length' })]));
        });
      });

      describe('when Leader non-editable bytes changed', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: {
                  ...initialValues.leader,
                  'Record length': '10000',
                },
                tag: 'LDR',
                id: 'leader-id',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['leader-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: `ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}` })]));
        });
      });

      describe('when Leader has not valid values in some positions', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: {
                  ...initialValues.leader,
                  Status: '1',
                },
                tag: 'LDR',
                id: 'leader-id',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['leader-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.leader.invalidPositionValue' })]));
        });
      });

      describe('when there is no 008 field', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.008.empty' })]));
        });
      });

      describe('when there are multiple 008 fields', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
                id: '008-id-1',
              },
              {
                tag: '008',
                content: {
                  Desc: 'i',
                },
                id: '008-id-2',
              },
            ],
          };

          let validationErrors = await result.current.validate(record.records);

          expect(validationErrors['008-id-1']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.008.multiple' })]));
          validationErrors = await result.current.validate(record.records);

          expect(validationErrors['008-id-2']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.008.multiple' })]));
        });
      });

      describe('when tag length is not 3', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '00',
                content: 'some value',
                id: 'test-id',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.tag.length' })]));
        });
      });

      describe('when tag contains non-digit characters', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '00a',
                id: 'test-id',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.tag.nonDigits' })]));
        });
      });

      describe('when there are multiple 001 fields', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
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
                id: 'test-id-1',
              },
              {
                tag: '001',
                content: '',
                id: 'test-id-2',
              },
            ],
          };

          let validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-1']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.controlField.multiple' })]));
          validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-2']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.controlField.multiple' })]));
        });
      });
    };

    describe('when validating Holdings record', () => {
      const initialValues = {
        leader: holdingsLeader,
        records: [
          {
            content: holdingsLeader,
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

      describe('when action is EDIT', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          action: QUICK_MARC_ACTIONS.EDIT,
          locations,
        };

        testCommonValidationRules({ marcContext });
      });

      describe('when action is CREATE', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          action: QUICK_MARC_ACTIONS.CREATE,
          locations,
        };

        testCommonValidationRules({ marcContext });
      });
    });
  });

  describe('when validating Bib record', () => {
    beforeEach(() => {
      useValidate.mockReturnValue({
        validate: mockValidate,
      });
    });

    const initialValues = {
      leader: bibLeader,
      records: [
        {
          content: bibLeader,
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
      linksCount: 0,
      naturalId: null,
      linkableBibFields,
      linkingRules,
      fixedFieldSpec: fixedFieldSpecBib,
    };

    const record = {
      leader: bibLeaderString,
      records: [
        {
          id: 1,
          content: bibLeaderString,
          tag: 'LDR',
        },
        {
          id: 2,
          tag: '008',
          content: {
            Desc: 'i',
          },
        },
        {
          id: 3,
          tag: '245',
          content: 'Test title',
          indicators: ['\\', '\\'],
        },
        {
          id: 4,
          tag: '010',
          content: '$a test',
        },
      ],
    };

    describe('when LCCN validation returns an error', () => {
      it('should set the error with severity', async () => {
        useOkapiKy.mockReturnValueOnce({
          get: jest.fn().mockReturnValue({
            json: jest.fn().mockResolvedValue({ instances: [{}] }),
          }),
        });
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        await result.current.validate(record.records);

        expect(quickMarcContext.setValidationErrors).toHaveBeenCalledWith(expect.objectContaining({
          4: [{
            id: 'ui-quick-marc.record.error.010.lccnDuplicated',
            severity: 'error',
          }],
        }));
      });
    });

    it('should make a request to validate endpoint', async () => {
      const { result } = renderHook(() => useValidation(marcContext), {
        wrapper: getWrapper(),
      });

      await result.current.validate(record.records);

      expect(mockValidate).toHaveBeenCalledWith({
        body: {
          fields: [{
            id: 2,
            tag: '008',
            content: {
              Desc: 'i',
            },
          }, {
            id: 3,
            tag: '245',
            content: 'Test title',
            indicators: ['\\', '\\'],
          }, {
            id: 4,
            tag: '010',
            content: '$a test',
          }],
          leader: bibLeaderString,
          marcFormat: 'BIBLIOGRAPHIC',
        },
      });
    });

    it('should format response from validate endpoint', async () => {
      const { result } = renderHook(() => useValidation(marcContext), {
        wrapper: getWrapper(),
      });

      const validationErrors = await result.current.validate(record.records);

      expect(validationErrors).toEqual(expect.objectContaining({
        3: [{ message: 'error message', severity: 'error', tag: '245[0]' }],
      }));
    });

    it.each([
      QUICK_MARC_ACTIONS.CREATE,
      QUICK_MARC_ACTIONS.DERIVE,
    ])('should filter out error 001 missing field for create and derive', async (action) => {
      useValidate.mockReturnValue({
        validate: () => ({
          issues: [{
            tag: '001[0]',
            severity: 'error',
            definitionType: 'field',
            message: 'Field 001 is required.',
          }],
        }),
      });

      const { result } = renderHook(() => useValidation({
        ...marcContext,
        action,
      }), { wrapper: getWrapper() });

      const validationErrors = await result.current.validate(record.records);

      expect(validationErrors).toEqual({});
    });

    describe('when 008 content has invalid value', () => {
      it('should return error message', async () => {
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        const validationErrors = await result.current.validate(
          [...record.records, {
            id: 5,
            tag: '008',
            content: {
              DtSt: '^',
            },
          }],
        );

        expect(validationErrors[5]).toEqual(
          expect.arrayContaining([expect.objectContaining({
            id: 'ui-quick-marc.record.error.008.invalidValue',
            severity: 'error',
          })]),
        );
      });
    });

    describe('when the length of the subfields of field 008 does not correspond with the one from spec', () => {
      it('should append backslashes if there are fewer characters and cut off extra ones', async () => {
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        await result.current.validate([
          ...record.records,
          {
            id: 5,
            tag: '008',
            content: {
              Date1: '199',
              Ctry: 'a',
            },
          },
          {
            id: 6,
            tag: '008',
            content: {
              Date2: '19999',
            },
          },
        ]);

        expect(mockValidate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            fields: expect.arrayContaining([{
              id: 5,
              tag: '008',
              content: {
                Date1: '199\\',
                Ctry: 'a\\\\',
              },
            }, {
              id: 6,
              tag: '008',
              content: {
                Date2: '1999',
              },
            }]),
          }),
        });
      });

      it('should return error messages for each field 008', async () => {
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        const validationErrors = await result.current.validate([
          ...record.records,
          {
            id: 5,
            tag: '008',
            content: {
              Date1: '199',
              Ctry: 'a',
            },
          },
          {
            id: 6,
            tag: '008',
            content: {
              Date2: '19999',
            },
          },
        ]);

        expect(validationErrors).toEqual(expect.objectContaining({
          5: [{
            id: 'ui-quick-marc.record.error.008.invalidLength',
            severity: 'error',
            values: {
              length: 4,
              name: 'ui-quick-marc.record.fixedField.Date1',
            },
          }, {
            id: 'ui-quick-marc.record.error.008.invalidLength',
            severity: 'error',
            values: {
              length: 3,
              name: 'ui-quick-marc.record.fixedField.Ctry',
            },
          }],
          6: [{
            id: 'ui-quick-marc.record.error.008.invalidLength',
            severity: 'error',
            values: {
              length: 4,
              name: 'ui-quick-marc.record.fixedField.Date2',
            },
          }],
        }));
      });
    });
  });

  describe('when validating Holdings record', () => {
    const testBaseHoldingsValidation = ({ marcContext }) => {
      const { initialValues } = marcContext;

      describe('when record is valid', () => {
        it('should not return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors).toEqual({});
        });
      });

      describe('when there are multiple 004 fields', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                tag: '004',
                id: 'test-id-1',
              },
              {
                tag: '004',
                id: 'test-id-2',
              },
            ],
          };

          let validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-1']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.instanceHrid.multiple' })]));
          validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-2']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.instanceHrid.multiple' })]));
        });
      });

      describe('when there is no 852 field', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.location.empty' })]));
        });
      });

      describe('when there are multiple 852 fields', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                id: 'test-id-1',
              },
              {
                tag: '852',
                id: 'test-id-2',
              },
            ],
          };

          let validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-1']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.location.multiple' })]));
          validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id-2']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.location.multiple' })]));
        });
      });

      describe('when there are multiple 852 $b subfields', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                content: '$b value $b this is not valid',
                id: 'test-id',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({
            id: 'ui-quick-marc.record.error.field.onlyOneSubfield',
            values: {
              fieldTag: '852',
              subField: '$b',
            },
          })]));
        });
      });

      describe('when 852 $b does not have a valid location code', () => {
        it('should return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                content: {},
                tag: '008',
              },
              {
                tag: '852',
                content: '$b NOT_VALID_CODE',
                id: 'test-id',
              },
            ],
          };

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.location.invalid' })]));
        });
      });

      describe('when 852 $b does have a valid location code', () => {
        it('should not return error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
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

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors).toEqual({});
        });
      });
    };

    const initialValues = {
      leader: holdingsLeader,
      records: [
        {
          content: holdingsLeader,
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

    describe('when action is EDIT', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.HOLDINGS,
        action: QUICK_MARC_ACTIONS.EDIT,
        locations,
      };

      testBaseHoldingsValidation({ marcContext });
    });

    describe('when action is CREATE', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.HOLDINGS,
        action: QUICK_MARC_ACTIONS.CREATE,
        locations,
      };

      testBaseHoldingsValidation({ marcContext });
    });
  });

  describe('when validating Authority record', () => {
    beforeEach(() => {
      useValidate.mockReturnValue({
        validate: mockValidate,
      });
    });

    describe('when action is EDIT', () => {
      const initialValues = {
        leader: authorityLeader,
        records: [
          {
            id: 1,
            content: authorityLeader,
            tag: 'LDR',
          },
          {
            id: 2,
            content: {},
            tag: '008',
          },
          {
            id: 3,
            tag: '110',
            content: '$a Record title',
          },
        ],
      };

      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.AUTHORITY,
        action: QUICK_MARC_ACTIONS.EDIT,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
        fixedFieldSpec: fixedFieldSpecAuth,
      };

      const record = {
        leader: authorityLeaderString,
        records: [
          {
            id: 1,
            content: authorityLeaderString,
            tag: 'LDR',
          },
          {
            id: 2,
            content: {},
            tag: '008',
          },
          {
            id: 3,
            tag: '110',
            content: '$a Record title',
          },
        ],
      };

      it('should make a request to validate endpoint', async () => {
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        await result.current.validate(record.records);

        expect(mockValidate).toHaveBeenCalledWith({
          body: {
            fields: [{
              id: 2,
              content: {},
              tag: '008',
            },
            {
              id: 3,
              tag: '110',
              content: '$a Record title',
            }],
            leader: authorityLeaderString,
            marcFormat: 'AUTHORITY',
          },
        });
      });

      it('should format response from validate endpoint', async () => {
        const { result } = renderHook(() => useValidation(marcContext), {
          wrapper: getWrapper(),
        });

        const validationErrors = await result.current.validate(record.records);

        expect(validationErrors).toEqual({
          [MISSING_FIELD_ID]: [{ message: 'error message', severity: 'error', tag: '245[0]' }],
        });
      });

      describe('when the length of the subfields of field 008 exceeds the limit', () => {
        it('should return error messages', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const validationErrors = await result.current.validate([
            ...record.records,
            {
              id: 4,
              content: {
                'Geo Subd': 'test',
                'Lang': 'test',
              },
              tag: '008',
            },
          ]);

          expect(validationErrors[4]).toEqual([{
            id: 'ui-quick-marc.record.error.008.invalidLength',
            severity: 'error',
            values: {
              length: 1,
              name: 'ui-quick-marc.record.fixedField.Geo Subd',
            },
          }, {
            id: 'ui-quick-marc.record.error.008.invalidLength',
            severity: 'error',
            values: {
              length: 1,
              name: 'ui-quick-marc.record.fixedField.Lang',
            },
          }]);
        });
      });
    });

    describe('when action is CREATE', () => {
      beforeEach(() => {
        mockValidate.mockResolvedValue({});
      });

      const initialValues = {
        leader: authorityLeader,
        records: [
          {
            id: 1,
            content: authorityLeader,
            tag: 'LDR',
          },
          {
            id: 2,
            content: {},
            tag: '008',
          },
          {
            id: 3,
            tag: '110',
            content: '$a Record title',
          },
        ],
      };

      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.AUTHORITY,
        action: QUICK_MARC_ACTIONS.CREATE,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
        fixedFieldSpec: fixedFieldSpecAuth,
      };

      const record = {
        leader: authorityLeaderString,
        records: [
          {
            id: 1,
            content: authorityLeaderString,
            tag: 'LDR',
          },
          {
            id: 2,
            content: {},
            tag: '008',
          },
          {
            id: 3,
            tag: '110',
            content: '$a Record title',
          },
          {
            id: 4,
            tag: '001',
            content: '',
          },
        ],
      };

      describe('and 001 row content is empty', () => {
        it('should return an error message', async () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const validationErrors = await result.current.validate(record.records);

          expect(validationErrors).toEqual({
            4: [expect.objectContaining({ id: 'ui-quick-marc.record.error.controlField.content.empty' })],
          });
        });
      });
    });
  });
});
