import {
  LEADER_DOCUMENTATION_LINKS,
  LEADER_TAG,
  FIXED_FIELD_TAG,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import * as validators from './validators';
import fixedFieldSpecBib from '../../../test/mocks/fixedFieldSpecBib';
import { bibLeader } from '../../../test/jest/fixtures/leaders';

const locations = [{
  code: 'VA/LI/D',
}, {
  code: 'LO/CA/TI/ON',
}];

describe('validators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTagLength', () => {
    const rule = {
      message: jest.fn(),
    };

    it('should not call rule.message when tag is valid', () => {
      const marcRecords = [{
        tag: '010',
      }, {
        tag: '245',
      }];

      validators.validateTagLength({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should not call rule.message when tag is not valid (invalid length) and field content is empty', () => {
      const marcRecords = [{
        tag: '10',
        content: '$a ',
      }, {
        tag: '245',
      }];

      validators.validateTagLength({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should call rule.message when tag is not valid (invalid length)', () => {
      const marcRecords = [{
        tag: '10',
        content: '$a test',
      }, {
        tag: '245',
      }];

      validators.validateTagLength({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateTagCharacters', () => {
    const rule = {
      message: jest.fn(),
    };

    it('should not call rule.message when tag is valid', () => {
      const marcRecords = [{
        tag: '010',
      }, {
        tag: '245',
      }];

      validators.validateTagCharacters({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should call rule.message when tag is not valid (non-digit characters)', () => {
      const marcRecords = [{
        tag: '01a',
      }, {
        tag: '245',
      }];

      validators.validateTagCharacters({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateEmptySubfields', () => {
    const rule = {
      message: jest.fn(),
    };

    it('should not return error message when indicators are present and content is not empty', () => {
      const marcRecords = [{
        indicators: ['\\', '\\'],
        content: 'test',
        id: 'id1',
      }, {
        indicators: ['\\', '7'],
        content: 'test',
        id: 'id2',
      }];

      validators.validateEmptySubfields({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should not return error message when tag is not present and content is empty', () => {
      const marcRecords = [{
        indicators: ['\\', '\\'],
        content: '',
        id: 'id1',
      }, {
        indicators: ['\\', '7'],
        content: 'test',
        id: 'id2',
      }];

      validators.validateEmptySubfields({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return error message when tag is present and content is empty', () => {
      const marcRecords = [{
        indicators: ['\\', '\\'],
        tag: '100',
        id: 'id1',
      }, {
        indicators: ['\\', '7'],
        tag: '245',
        id: 'id2',
      }];

      validators.validateEmptySubfields({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateSubfieldValueExists', () => {
    const rule = {
      tag: '852',
      subfield: '$b',
      message: jest.fn(),
    };

    it('should not return an error when a field contains a subfield value', () => {
      const marcRecords = [{
        tag: '852',
        content: '$b value',
      }];

      validators.validateSubfieldValueExists({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a field does not contain a subfield value', () => {
      const marcRecords = [{
        tag: '852',
        content: '$b',
      }];

      validators.validateSubfieldValueExists({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalledWith('852', '$b');
    });
  });

  describe('validateExistence', () => {
    const rule = {
      tag: '245',
      message: jest.fn(),
    };

    it('should not return an error when a field exists', () => {
      const marcRecords = [{
        tag: '245',
      }];

      validators.validateExistence({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a field does not exist', () => {
      const marcRecords = [{
        tag: '240',
      }];

      validators.validateExistence({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalledWith();
    });
  });

  describe('validateNonRepeatable', () => {
    const rule = {
      tag: '245',
      message: jest.fn(),
    };

    it('should not return an error when the field is not repeated', () => {
      const marcRecords = [{
        tag: '245',
      }];

      validators.validateNonRepeatable({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when the field is repeated', () => {
      const marcRecords = [{
        tag: '245',
      }, {
        tag: '245',
      }];

      validators.validateNonRepeatable({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateNonRepeatableSubfield', () => {
    const rule = {
      tag: '100',
      subfield: '$a',
      message: jest.fn(),
    };

    it('should not return an error when the subfield is not repeated', () => {
      const marcRecords = [{
        tag: '100',
        content: '$a test',
      }];

      validators.validateNonRepeatableSubfield({ marcRecords }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when the subfield is repeated', () => {
      const marcRecords = [{
        tag: '100',
        content: '$a test1 $a test2',
      }];

      validators.validateNonRepeatableSubfield({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalledWith('100', '$a');
    });
  });

  describe('validateCorrectLength', () => {
    const rule = {
      tag: LEADER_TAG,
      message: jest.fn(),
    };

    it('should call rule.message when field is not correct length', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: '04706dam a2200865nfa45',
      }];

      validators.validateCorrectLength({ marcRecords }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateLeaderEditableBytes', () => {
    const rule = {
      tag: LEADER_TAG,
      message: jest.fn(),
    };

    it('should call rule.message when forbidden bytes are edited', () => {
      const initialValues = {
        records: [{
          tag: LEADER_TAG,
          content: bibLeader,
        }],
      };
      const marcRecords = [{
        tag: LEADER_TAG,
        content: {
          ...bibLeader,
          '20-23 positions': '4501',
        },
      }];
      const marcType = MARC_TYPES.BIB;

      validators.validateLeaderEditableBytes({ marcRecords, initialValues, marcType }, rule);

      expect(rule.message).toHaveBeenCalledWith(marcType);
    });

    describe('when initial values contain not valid bytes', () => {
      it('should not call rule.message when forbidden bytes are not edited', () => {
        const content = {
          ...bibLeader,
          ELvl: 'I',
        };

        const initialValues = {
          records: [{
            tag: LEADER_TAG,
            content,
          }],
        };
        const marcRecords = [{
          tag: LEADER_TAG,
          content,
        }];
        const marcType = MARC_TYPES.BIB;

        validators.validateLeaderEditableBytes({ marcRecords, initialValues, marcType }, rule);

        expect(rule.message).not.toHaveBeenCalled();
      });
    });
  });

  describe('validateLeaderPositions', () => {
    const marcType = MARC_TYPES.BIB;
    const rule = {
      tag: LEADER_TAG,
      message: jest.fn(),
    };

    it('should call rule.message with correct arguments when position 18 is invalid', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: {
          ...bibLeader,
          Desc: 'f',
        },
      }];

      validators.validateLeaderPositions({ marcRecords, marcType }, rule);

      expect(rule.message).toHaveBeenCalledWith('Leader 18', LEADER_DOCUMENTATION_LINKS[marcType]);
    });

    it('should not call rule.message when leader is valid', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: bibLeader,
      }];

      validators.validateLeaderPositions({ marcRecords, marcType }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });
  });

  describe('validate$9InLinkable', () => {
    const linkableBibFields = ['100'];
    const rule = {
      message: jest.fn(),
    };

    it('should not return an error when $9 is not present in linkable fields', () => {
      const marcRecords = [{
        tag: '100',
        content: '$a test',
      }];

      validators.validate$9InLinkable({ marcRecords, linkableBibFields }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should not return an error when $9 is present in non-linkable fields', () => {
      const marcRecords = [{
        tag: '245',
        content: '$9 test',
      }];

      validators.validate$9InLinkable({ marcRecords, linkableBibFields }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when $9 is present in linkable fields', () => {
      const marcRecords = [{
        tag: '100',
        content: '$9 test',
      }];

      validators.validate$9InLinkable({ marcRecords, linkableBibFields }, rule);

      expect(rule.message).toHaveBeenCalled();
    });

    it('should return an error when $9 is present in linked fields', () => {
      const marcRecords = [{
        tag: '100',
        subfieldGroups: {
          uncontrolledNumber: '$9 test',
        },
      }];

      validators.validate$9InLinkable({ marcRecords, linkableBibFields }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateTagChanged', () => {
    const rule = {
      tag: '100',
      message: jest.fn(),
    };

    it('should not return an error when a tag did not change', () => {
      const initialValues = {
        records: [{
          tag: '100',
          id: 1,
        }],
      };
      const marcRecords = [{
        tag: '100',
        id: 1,
      }];

      validators.validateTagChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should not return an error when a field was deleted', () => {
      const initialValues = {
        records: [{
          tag: '100',
          id: 1,
        }],
      };
      const marcRecords = [];

      validators.validateTagChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a tag was changed', () => {
      const initialValues = {
        records: [{
          tag: '100',
          id: 1,
        }],
      };
      const marcRecords = [{
        tag: '110',
        id: 1,
      }];

      validators.validateTagChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).toHaveBeenCalledWith('100');
    });
  });

  describe('validateSubfieldChanged', () => {
    const rule = {
      tag: '100',
      subfield: '$t',
      message: jest.fn(),
    };

    it('should not return an error when a subfield did not change', () => {
      const initialValues = {
        records: [{
          tag: '100',
          content: '$t test',
        }],
      };
      const marcRecords = [{
        tag: '100',
        content: '$t test',
      }];

      validators.validateSubfieldChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a subfield was removed', () => {
      const initialValues = {
        records: [{
          tag: '100',
          content: '$t test',
        }],
      };
      const marcRecords = [{
        tag: '100',
        content: '$t',
      }];

      validators.validateSubfieldChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).toHaveBeenCalledWith({
        added: false,
        removed: true,
        changed: false,
      }, '100');
    });

    it('should return an error when a subfield was added', () => {
      const initialValues = {
        records: [{
          tag: '100',
          content: '',
        }],
      };
      const marcRecords = [{
        tag: '100',
        content: '$t test',
      }];

      validators.validateSubfieldChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).toHaveBeenCalledWith({
        added: true,
        removed: false,
        changed: false,
      }, '100');
    });

    it('should return an error when a subfield was changed', () => {
      const initialValues = {
        records: [{
          tag: '100',
          content: '$t test',
        }],
      };
      const marcRecords = [{
        tag: '100',
        content: '$t newtest',
      }];

      validators.validateSubfieldChanged({ marcRecords, initialValues }, rule);

      expect(rule.message).toHaveBeenCalledWith({
        added: false,
        removed: false,
        changed: true,
      }, '100');
    });
  });

  describe('validateLocation', () => {
    const rule = {
      tag: '852',
      message: jest.fn(),
    };

    it('should not return an error when field contains a valid location', () => {
      const marcRecords = [{
        tag: '852',
        content: '$b VA/LI/D',
      }];

      validators.validateLocation({ marcRecords, locations }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when field does not contain a valid location', () => {
      const marcRecords = [{
        tag: '852',
        content: '$b somevalue',
      }];

      validators.validateLocation({ marcRecords, locations }, rule);

      expect(rule.message).toHaveBeenCalled();
    });
  });

  describe('validateSubfieldIsControlled', () => {
    const rule = {
      message: jest.fn(),
    };
    const linkingRules = [{
      id: 1,
      authoritySubfields: ['a', 'b'],
    }];

    it('should not return an error when a field does not change controlled subfields', () => {
      const marcRecords = [{
        tag: '600',
        linkDetails: {
          linkingRuleId: 1,
        },
        subfieldGroups: {
          uncontrolledAlpha: '$c test',
        },
      }];

      validators.validateSubfieldIsControlled({ marcRecords, linkingRules }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a field changes controlled subfields', () => {
      const marcRecords = [{
        tag: '600',
        linkDetails: {
          linkingRuleId: 1,
        },
        subfieldGroups: {
          uncontrolledAlpha: '$a test $b test',
        },
      }];

      validators.validateSubfieldIsControlled({ marcRecords, linkingRules }, rule);

      expect(rule.message).toHaveBeenCalledWith(['600']);
    });
  });

  describe('validateFixedFieldPositions', () => {
    const rule = {
      message: jest.fn(),
    };

    const fixedFieldSpec = fixedFieldSpecBib;

    it('should not return an error when a subfield contains valid content', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: bibLeader,
      }, {
        tag: FIXED_FIELD_TAG,
        content: {
          'DtSt': 'b',
          'Ills': ['\\', '\\', '\\', '\\'],
        },
      }];

      const marcType = MARC_TYPES.BIB;

      validators.validateFixedFieldPositions({ marcRecords, fixedFieldSpec, marcType }, rule);

      expect(rule.message).not.toHaveBeenCalled();
    });

    it('should return an error when a subfield contains invalid content', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: bibLeader,
      }, {
        tag: FIXED_FIELD_TAG,
        content: {
          'DtSt': '^',
          'Ills': ['\\', '\\', '\\', '\\'],
        },
      }];

      validators.validateFixedFieldPositions({ marcRecords, fixedFieldSpec, marcType: MARC_TYPES.BIB }, rule);

      expect(rule.message).toHaveBeenCalledWith('DtSt');
    });

    it('should not return an error when a subfiled contains valid value in content array', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: bibLeader,
      }, {
        tag: FIXED_FIELD_TAG,
        content: {
          'DtSt': 'b',
          'Ills': ['|', '\\', 'a', 'b'],
        },
      }];
      const marcType = MARC_TYPES.BIB;

      validators.validateFixedFieldPositions({ marcRecords, fixedFieldSpec, marcType }, rule);

      expect(rule.message).not.toHaveBeenCalledWith('Ills');
    });

    it('should return an error when a subfiled contains invalid value in content array', () => {
      const marcRecords = [{
        tag: LEADER_TAG,
        content: bibLeader,
      }, {
        tag: FIXED_FIELD_TAG,
        content: {
          'DtSt': 'b',
          'Ills': ['|', '|', '|', '^'],
        },
      }];
      const marcType = MARC_TYPES.BIB;

      validators.validateFixedFieldPositions({ marcRecords, fixedFieldSpec, marcType }, rule);

      expect(rule.message).toHaveBeenCalledWith('Ills');
    });
  });

  describe('validateLccnDuplication', () => {
    const rule = {
      tag: '010',
      message: jest.fn(),
    };

    describe('when 010 $a is not duplicated', () => {
      it('should not return an error', async () => {
        const marcRecords = [{
          tag: LEADER_TAG,
          content: bibLeader,
        }, {
          tag: '010',
          content: '$a test',
        }];
        const ky = {
          get: jest.fn().mockReturnValue({
            json: jest.fn().mockResolvedValue({ instances: [] }),
          }),
        };

        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;
        const duplicateLccnCheckingEnabled = true;

        await validators.validateLccnDuplication({
          ky,
          marcRecords,
          marcType,
          action,
          duplicateLccnCheckingEnabled,
        }, rule);

        expect(rule.message).not.toHaveBeenCalled();
      });
    });

    describe('when 010 $a is duplicated', () => {
      it('should return an error', async () => {
        const marcRecords = [{
          tag: LEADER_TAG,
          content: bibLeader,
        }, {
          tag: '010',
          content: '$a test',
        }];
        const ky = {
          get: jest.fn().mockReturnValue({
            json: jest.fn().mockResolvedValue({ instances: [{}] }),
          }),
        };
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;
        const duplicateLccnCheckingEnabled = true;

        await validators.validateLccnDuplication({
          ky,
          marcRecords,
          marcType,
          action,
          duplicateLccnCheckingEnabled,
        }, rule);

        expect(rule.message).toHaveBeenCalled();
      });
    });
  });
});
