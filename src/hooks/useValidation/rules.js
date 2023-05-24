import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import {
  validate$9InLinkable,
  validateCorrectLength,
  validateEditableBytes,
  validateExistance,
  validateLeaderPositions,
  validateNonRepeatable,
  validateSubfieldIsControlled,
  validateSubfieldValueExists,
  validateTagCharacters,
  validateTagLength,
} from './validators';

const RULES = {
  EXISTS: validateExistance,
  NON_REPEATABLE: validateNonRepeatable,
  $9IN_LINKABLE: validate$9InLinkable,
  CONTROLLED_SUBFIELD: validateSubfieldIsControlled,
  CORRECT_LENGTH: validateCorrectLength,
  EDITABLE_BYTES: validateEditableBytes,
  LEADER_POSITIONS: validateLeaderPositions,
  TAG_LENGTH: validateTagLength,
  TAG_CHARACTERS: validateTagCharacters,
  SUBFIELD_VALUE_EXISTS: validateSubfieldValueExists,
};

export const validators = {
  [MARC_TYPES.BIB]: {
    [QUICK_MARC_ACTIONS.EDIT]: [
      {
        tag: 'LDR',
        validator: RULES.CORRECT_LENGTH,
        message: () => <FormattedMessage id="ui-quick-marc.record.error.leader.length" />,
        length: 24,
      }, {
        tag: 'LDR',
        validator: RULES.EDITABLE_BYTES,
        message: (marcType) => <FormattedMessage id={`ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}`} />,
      }, {
        tag: 'LDR',
        validator: RULES.LEADER_POSITIONS,
        message: (positions, link) => (
          <FormattedMessage
            id="ui-quick-marc.record.error.leader.invalidPositionValue"
            values={{
              positions,
              link: (
                <Link
                  to={{
                    pathname: link,
                  }}
                  target="_blank"
                >
                  {link}
                </Link>
              ),
            }}
          />
        ),
      },
      {
        tag: '001',
        validator: RULES.NON_REPEATABLE,
        message: 'multiple 001',
      },
      {
        tag: '008',
        validator: RULES.EXISTS,
        message: '008 doesnt exist',
      }, {
        tag: '008',
        validator: RULES.NON_REPEATABLE,
        message: 'more than 008',
      },
      {
        tag: '245',
        validator: RULES.EXISTS,
        message: '245 doesnt exist',
      }, {
        tag: '245',
        validator: RULES.NON_REPEATABLE,
        message: 'more than one 245',
      },
      {
        tag: '010',
        validator: RULES.NON_REPEATABLE,
        message: 'more than one 010',
      },
      {
        validator: RULES.$9IN_LINKABLE,
        message: 'sub 9 in linkable',
      }, {
        validator: RULES.CONTROLLED_SUBFIELD,
        message: 'has controlled subfield',
      }, {
        validator: RULES.TAG_LENGTH,
        message: 'wrong tag length',
      }, {
        validator: RULES.TAG_CHARACTERS,
        message: 'wrong tag characters',
      }, {
        validator: RULES.SUBFIELD_VALUE_EXISTS,
        message: 'subfield without value',
      },
    ],
  },
};
