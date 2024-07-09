import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import Harness from '../../../test/jest/helpers/harness';
import { useValidation } from './useValidation';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import { MISSING_FIELD_ID } from './constants';
import fixedFieldSpecBib from '../../../test/mocks/fixedFieldSpecBib';
import {
  authorityLeader,
  bibLeader,
  holdingsLeader,
} from '../../../test/jest/fixtures/leaders';

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

const getWrapper = (extraProps = {}) => props => <Harness {...props} {...extraProps} />;

describe('useValidation', () => {
  describe('when validating common rules', () => {
    const testCommonValidationRules = ({ marcContext }) => {
      const {
        initialValues,
        marcType,
      } = marcContext;

      describe('when Leader length is not valid', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['leader-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.leader.length' }]));
        });
      });

      describe('when Leader non-editable bytes changed', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['leader-id']).toEqual(expect.arrayContaining([{ id: `ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}` }]));
        });
      });

      describe('when Leader has not valid values in some positions', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['leader-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.leader.invalidPositionValue' })]));
        });
      });

      describe('when there is no 008 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                content: initialValues.leader,
                tag: 'LDR',
              },
            ],
          };

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.008.empty' }]));
        });
      });

      describe('when there are multiple 008 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['008-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.008.multiple' }]));
          expect(result.current.validate(record.records)['008-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.008.multiple' }]));
        });
      });

      describe('when tag length is not 3', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.tag.length' }]));
        });
      });

      describe('when tag contains non-digit characters', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.tag.nonDigits' }]));
        });
      });

      describe('when fields contain empty subfields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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
                tag: '245',
                content: '',
                indicators: ['\\', '\\'],
                id: 'test-id',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.subfield' }]));
        });
      });

      describe('when there are multiple 001 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.controlField.multiple' }]));
          expect(result.current.validate(record.records)['test-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.controlField.multiple' }]));
        });
      });
    };

    describe('when validating Bib record', () => {
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

      describe('when action is EDIT', () => {
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

        testCommonValidationRules({ marcContext });
      });

      describe('when action is CREATE', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.BIB,
          action: QUICK_MARC_ACTIONS.CREATE,
          locations,
          linksCount: 0,
          naturalId: null,
          linkableBibFields,
          linkingRules,
        };

        testCommonValidationRules({ marcContext });
      });

      describe('when action is DERIVE', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.BIB,
          action: QUICK_MARC_ACTIONS.DERIVE,
          locations,
          linksCount: 0,
          naturalId: null,
          linkableBibFields,
          linkingRules,
        };

        testCommonValidationRules({ marcContext });
      });
    });

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

    describe('when validating Authority record', () => {
      const initialValues = {
        leader: authorityLeader,
        records: [
          {
            content: authorityLeader,
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              Desc: 'i',
            },
          },
          {
            tag: '100',
            content: '$a test heading',
          },
        ],
      };

      describe('when action is EDIT', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
          action: QUICK_MARC_ACTIONS.EDIT,
          linksCount: 0,
          naturalId: null,
          linkableBibFields,
          linkingRules,
        };

        testCommonValidationRules({ marcContext });
      });

      describe('when action is CREATE', () => {
        const marcContext = {
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
          action: QUICK_MARC_ACTIONS.CREATE,
          linksCount: 0,
          naturalId: null,
          linkableBibFields,
          linkingRules,
        };

        testCommonValidationRules({ marcContext });
      });
    });
  });

  describe('when validating Bib record', () => {
    const testBaseBibValidation = ({ marcContext }) => {
      const { initialValues } = marcContext;

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('when there is no 245 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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
            ],
          };

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.title.empty' }]));
        });
      });

      describe('when there are multiple 245 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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
                tag: '245',
                id: 'test-id-1',
              },
              {
                tag: '245',
                id: 'test-id-2',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.title.multiple' }]));
          expect(result.current.validate(record.records)['test-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.title.multiple' }]));
        });
      });

      describe('when there are multiple 010 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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
                tag: '245',
              },
              {
                tag: '010',
                id: 'test-id-1',
              },
              {
                tag: '010',
                id: 'test-id-2',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.multiple' }]));
          expect(result.current.validate(record.records)['test-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.multiple' }]));
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
                id: 'test-id',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.$9' }]));
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
                id: 'test-id',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.$9' }]));
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

          expect(result.current.validate(record.records)).toEqual({});
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
                id: 'test-id',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.fieldIsControlled' })]));
        });
      });

      describe('when 008 content has invalid value', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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
                  DtSt: '^',
                },
                id: 'test-id',
              },
            ],
          };

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.008.invalidValue' })]));
        });
      });
    };

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

    describe('when action is EDIT', () => {
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

      testBaseBibValidation({ marcContext });
    });

    describe('when action is CREATE', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.BIB,
        action: QUICK_MARC_ACTIONS.CREATE,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
        fixedFieldSpec: fixedFieldSpecBib,
      };

      testBaseBibValidation({ marcContext });
    });

    describe('when action is DERIVE', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.BIB,
        action: QUICK_MARC_ACTIONS.DERIVE,
        linksCount: 0,
        naturalId: null,
        linkableBibFields,
        linkingRules,
        fixedFieldSpec: fixedFieldSpecBib,
      };

      testBaseBibValidation({ marcContext });
    });
  });

  describe('when validating Holdings record', () => {
    const testBaseHoldingsValidation = ({ marcContext }) => {
      const { initialValues } = marcContext;

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('when there are multiple 004 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.instanceHrid.multiple' }]));
          expect(result.current.validate(record.records)['test-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.instanceHrid.multiple' }]));
        });
      });

      describe('when there is no 852 field', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.location.empty' }]));
        });
      });

      describe('when there are multiple 852 fields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id-1']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.location.multiple' }]));
          expect(result.current.validate(record.records)['test-id-2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.location.multiple' }]));
        });
      });

      describe('when there are multiple 852 $b subfields', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{
            id: 'ui-quick-marc.record.error.field.onlyOneSubfield',
            values: {
              fieldTag: '852',
              subField: '$b',
            },
          }]));
        });
      });

      describe('when 852 $b does not have a valid location code', () => {
        it('should return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)['test-id']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.location.invalid' }]));
        });
      });

      describe('when 852 $b does have a valid location code', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

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

          expect(result.current.validate(record.records)).toEqual({});
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
    const localSourceFile = {
      id: '1',
      source: 'local',
      codes: ['k'],
    };

    const folioSourceFile = {
      id: '2',
      source: 'folio',
      codes: ['n', 'fe'],
    };

    const testBaseAuthorityValidation = ({ marcContext }) => {
      const { initialValues } = marcContext;

      describe('when record is without 1XX row', () => {
        it('should return an error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                id: 1,
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                id: 2,
                content: {},
                tag: '008',
              },
            ],
          };

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.empty' }]));
        });
      });

      describe('when record does not have a valid 1XX row', () => {
        it('should return an error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                id: 1,
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                id: 2,
                content: {},
                tag: '008',
              },
              {
                id: 3,
                content: '',
                tag: '101',
              },
            ],
          };

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.empty' }]));
        });
      });

      describe('when record has multiple valid 1XX rows', () => {
        it('should return an error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                id: 'LDR',
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                id: 1,
                content: {},
                tag: '008',
              },
              {
                id: 2,
                content: '$a test',
                tag: '010',
              },
              {
                id: 3,
                tag: '100',
              },
              {
                id: 4,
                tag: '155',
              },
            ],
          };

          expect(result.current.validate(record.records)['3']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.multiple' }]));
          expect(result.current.validate(record.records)['4']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.multiple' }]));
        });
      });

      describe('when record has multiple not valid 1XX rows', () => {
        it('should return an error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              {
                id: 'LDR',
                content: initialValues.leader,
                tag: 'LDR',
              },
              {
                id: 1,
                content: {},
                tag: '008',
              },
              {
                id: 2,
                content: '$a test',
                tag: '010',
              },
              {
                id: 3,
                tag: '110',
                content: '$a test',
              },
              {
                id: 4,
                tag: '101',
              },
            ],
          };

          expect(result.current.validate(record.records)['3']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.multiple' }]));
          expect(result.current.validate(record.records)['4']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.heading.multiple' }]));
        });
      });

      describe('when 010 field has several $a subfields', () => {
        it('should return an error', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: 4,
                tag: '010',
                content: '$a val1 $a val2',
              },
            ],
          };

          expect(result.current.validate(record.records)['4']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.$aOnlyOne' }]));
        });
      });

      describe('when record has multiple 010 fields', () => {
        it('should return an error', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: 4,
                tag: '010',
                content: '$a test',
              },
              {
                id: 5,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)['4']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.multiple' }]));
          expect(result.current.validate(record.records)['5']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.multiple' }]));
        });
      });
    };

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

    describe('when action is EDIT', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.AUTHORITY,
        action: QUICK_MARC_ACTIONS.EDIT,
        linksCount: 1,
        naturalId: 'n123456',
        sourceFiles: [
          localSourceFile,
          folioSourceFile,
        ],
      };

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      testBaseAuthorityValidation({ marcContext });

      describe('when authority is linked to bib record', () => {
        describe('when 1XX tag is changed', () => {
          it('should return an error', () => {
            const { result } = renderHook(() => useValidation(marcContext));

            const record = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
                  tag: 'LDR',
                },
                {
                  id: 2,
                  content: {},
                  tag: '008',
                },
                {
                  id: 3,
                  tag: '150',
                  content: '$a Record title',
                },
              ],
            };

            expect(result.current.validate(record.records)['3']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.1xx.change' })]));
          });
        });

        describe('when $t was added to 1XX field', () => {
          it('should return an error', () => {
            const { result } = renderHook(() => useValidation(marcContext));

            const record = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
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
                  content: '$a Record title $t test',
                },
              ],
            };

            expect(result.current.validate(record.records)['3']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.1xx.add$t' })]));
          });
        });

        describe('when $t was removed from 1XX field', () => {
          it('should return an error', () => {
            const _initialValues = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
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
                  content: '$a Record title $t test',
                },
              ],
            };

            const { result } = renderHook(() => useValidation({
              ...marcContext,
              initialValues: _initialValues,
            }));

            const record = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
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

            expect(result.current.validate(record.records)['3']).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'ui-quick-marc.record.error.1xx.remove$t' })]));
          });
        });

        describe('when 010 $a was removed', () => {
          it('should return an error message', () => {
            const _initialValues = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
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
                  tag: '010',
                  content: '$a n123456',
                },
              ],
            };
            const { result } = renderHook(() => useValidation({
              ...marcContext,
              initialValues: _initialValues,
            }));

            const record = {
              ...initialValues,
              records: [
                {
                  id: 'LDR',
                  content: initialValues.leader,
                  tag: 'LDR',
                },
                {
                  id: 1,
                  content: {},
                  tag: '008',
                },
                {
                  id: 2,
                  content: '$a',
                  tag: '010',
                },
                {
                  id: 3,
                  tag: '110',
                },
              ],
            };

            expect(result.current.validate(record.records)['2']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.$aRemoved' }]));
          });
        });

        describe('when 010 was a linking point', () => {
          describe('and 010 was removed', () => {
            it('should return an error message', () => {
              const _initialValues = {
                leader: initialValues.leader,
                records: [
                  {
                    id: 1,
                    content: initialValues.leader,
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
                    tag: '010',
                    content: '$a n123456',
                  },
                ],
              };
              const { result } = renderHook(() => useValidation({
                ...marcContext,
                initialValues: _initialValues,
                naturalId: 'n123456',
              }));

              const record = {
                ...initialValues,
                records: [
                  {
                    id: 'LDR',
                    content: initialValues.leader,
                    tag: 'LDR',
                  },
                  {
                    id: 1,
                    content: {},
                    tag: '008',
                  },
                  {
                    id: 3,
                    tag: '110',
                  },
                ],
              };

              expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.removed' }]));
            });
          });
        });

        describe('when 010 was not a linking point', () => {
          describe('and 010 was removed', () => {
            it('should not return an error message', () => {
              const _initialValues = {
                leader: initialValues.leader,
                records: [
                  {
                    id: 1,
                    content: initialValues.leader,
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
                    tag: '010',
                    content: '$a n123456',
                  },
                ],
              };
              const { result } = renderHook(() => useValidation({
                ...marcContext,
                initialValues: _initialValues,
                naturalId: 'n09876',
              }));

              const record = {
                ...initialValues,
                records: [
                  {
                    id: 'LDR',
                    content: initialValues.leader,
                    tag: 'LDR',
                  },
                  {
                    id: 1,
                    content: {},
                    tag: '008',
                  },
                  {
                    id: 3,
                    tag: '110',
                  },
                ],
              };

              expect(result.current.validate(record.records)).toEqual({});
            });
          });
        });
      });

      describe('when authority is not linked to bib record', () => {
        describe('when 010 $a was removed', () => {
          it('should not return an error message', () => {
            const _initialValues = {
              leader: initialValues.leader,
              records: [
                {
                  id: 1,
                  content: initialValues.leader,
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
                  tag: '010',
                  content: '$a n123456',
                },
              ],
            };
            const { result } = renderHook(() => useValidation({
              ...marcContext,
              linksCount: 0,
              initialValues: _initialValues,
            }));

            const record = {
              ...initialValues,
              records: [
                {
                  id: 'LDR',
                  content: initialValues.leader,
                  tag: 'LDR',
                },
                {
                  id: 1,
                  content: {},
                  tag: '008',
                },
                {
                  id: 2,
                  content: '$a',
                  tag: '010',
                },
                {
                  id: 3,
                  tag: '110',
                },
              ],
            };

            expect(result.current.validate(record.records)).toEqual({});
          });
        });
      });
    });

    describe('when action is CREATE', () => {
      const marcContext = {
        initialValues,
        marcType: MARC_TYPES.AUTHORITY,
        action: QUICK_MARC_ACTIONS.CREATE,
        sourceFiles: [
          localSourceFile,
          folioSourceFile,
        ],
      };

      describe('when record is valid', () => {
        it('should not return error message', () => {
          const { result } = renderHook(() => useValidation(marcContext));

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: '$a n1',
                tag: '010',
              },
              {
                id: '5',
                content: 'pre1',
                tag: '001',
              },
            ],
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      testBaseAuthorityValidation({ marcContext });

      describe('and 001 row content is empty', () => {
        it('should return an error message', () => {
          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper(),
          });

          const record = {
            leader: initialValues.leader,
            records: [...initialValues.records, {
              id: 4,
              tag: '001',
              content: '',
            }],
          };

          expect(result.current.validate(record.records)['4']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.controlField.content.empty' }]));
        });
      });

      describe('and 010 row is absent and selected source file in 001 is local', () => {
        it('should not return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: localSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: 'pre1',
                tag: '001',
              },
            ],
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('and 010 row is absent and selected source file in 001 is folio', () => {
        it('should return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: folioSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: 'pre1',
                tag: '001',
              },
            ],
          };

          expect(result.current.validate(record.records)[MISSING_FIELD_ID]).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.absent' }]));
        });
      });

      describe('and 010 prefix is empty and selected source file in 001 is local', () => {
        it('should not return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: localSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const emptyPrefix = '';
          const valueOf010$a = `${emptyPrefix}123`;

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: valueOf010$a,
                tag: '001',
              },
              {
                id: '5',
                content: `$a ${valueOf010$a}`,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('and 010 prefix is empty and selected source file in 001 is folio', () => {
        it('should return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: folioSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const emptyPrefix = '';
          const valueOf010$a = `${emptyPrefix}123`;

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: valueOf010$a,
                tag: '001',
              },
              {
                id: '5',
                content: `$a ${valueOf010$a}`,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)['5']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.prefix.absent' }]));
        });
      });

      describe('and 010 prefix is invalid and selected source file in 001 is local', () => {
        it('should not return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: localSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const prefix = 'invalidPrefix';
          const valueOf010$a = `${prefix}123`;

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: valueOf010$a,
                tag: '001',
              },
              {
                id: '5',
                content: `$a ${valueOf010$a}`,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('and 010 prefix is valid and selected source file in 001 is folio', () => {
        it('should not return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: folioSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const validPrefix = marcContext.sourceFiles[1].codes[0];
          const valueOf010$a = `${validPrefix}123`;

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: valueOf010$a,
                tag: '001',
              },
              {
                id: '5',
                content: `$a ${valueOf010$a}`,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)).toEqual({});
        });
      });

      describe('and 010 prefix is invalid and selected source file in 001 is folio', () => {
        it('should return an error message', () => {
          const quickMarcContext = {
            selectedSourceFile: folioSourceFile,
          };

          const { result } = renderHook(() => useValidation(marcContext), {
            wrapper: getWrapper({ quickMarcContext }),
          });

          const prefix = 'nn';
          const valueOf010$a = `${prefix}123`;

          const record = {
            ...initialValues,
            records: [
              ...initialValues.records,
              {
                id: '4',
                content: valueOf010$a,
                tag: '001',
              },
              {
                id: '5',
                content: `$a ${valueOf010$a}`,
                tag: '010',
              },
            ],
          };

          expect(result.current.validate(record.records)['5']).toEqual(expect.arrayContaining([{ id: 'ui-quick-marc.record.error.010.prefix.invalid' }]));
        });
      });
    });
  });
});
