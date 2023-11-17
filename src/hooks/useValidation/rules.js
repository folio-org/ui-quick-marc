import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import {
  validate$9InLinkable,
  validateTagChanged,
  validateLocation,
  validateCorrectLength,
  validateEditableBytes,
  validateExistance,
  validateLeaderPositions,
  validateNonRepeatable,
  validateNonRepeatableSubfield,
  validateSubfieldIsControlled,
  validateSubfieldValueExists,
  validateTagCharacters,
  validateTagLength,
  validateEmptySubfields,
  validateSubfieldChanged,
} from './validators';
import { is010LinkedToBibRecord } from '../../QuickMarcEditor/utils';

const RULES = {
  EXISTS: validateExistance,
  NON_REPEATABLE: validateNonRepeatable,
  NON_REPEATABLE_SUBFIELD: validateNonRepeatableSubfield,
  $9IN_LINKABLE: validate$9InLinkable,
  TAG_CHANGED: validateTagChanged,
  VALID_LOCATION: validateLocation,
  CONTROLLED_SUBFIELD: validateSubfieldIsControlled,
  CORRECT_LENGTH: validateCorrectLength,
  EDITABLE_BYTES: validateEditableBytes,
  LEADER_POSITIONS: validateLeaderPositions,
  TAG_LENGTH: validateTagLength,
  TAG_CHARACTERS: validateTagCharacters,
  EMPTY_SUBFIELDS: validateEmptySubfields,
  SUBFIELD_VALUE_EXISTS: validateSubfieldValueExists,
  SUBFIELD_CHANGED: validateSubfieldChanged,
};

const COMMON_VALIDATORS = [
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
    message: () => <FormattedMessage id="ui-quick-marc.record.error.controlField.multiple" />,
  },
  {
    validator: RULES.TAG_LENGTH,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.tag.length" />,
  },
  {
    validator: RULES.TAG_CHARACTERS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.tag.nonDigits" />,
  },
  {
    validator: RULES.EMPTY_SUBFIELDS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.subfield" />,
  },
  {
    tag: '008',
    validator: RULES.EXISTS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.008.empty" />,
  }, {
    tag: '008',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.008.multiple" />,
  },
];

const BASE_BIB_VALIDATORS = [
  ...COMMON_VALIDATORS,
  {
    tag: '010',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.010.multiple" />,
  },
  {
    tag: '245',
    validator: RULES.EXISTS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.title.empty" />,
  },
  {
    tag: '245',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.title.multiple" />,
  },
  {
    validator: RULES.$9IN_LINKABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.$9" />,
  },
  {
    validator: RULES.CONTROLLED_SUBFIELD,
    message: (uniqueTags) => {
      if (uniqueTags.length === 1) {
        return (
          <FormattedMessage
            id="ui-quick-marc.record.error.fieldCantBeSaved"
            values={{
              count: 1,
              fieldTags: `MARC ${uniqueTags[0]}`,
            }}
          />
        );
      }

      return (
        <FormattedMessage
          id="ui-quick-marc.record.error.fieldsCantBeSaved"
          values={{
            count: uniqueTags.length,
            fieldTags: uniqueTags.slice(0, -1).map(tag => `MARC ${tag}`).join(', '),
            lastFieldTag: `MARC ${uniqueTags[uniqueTags.length - 1]}`,
          }}
        />
      );
    },
  },
];

const BASE_HOLDINGS_VALIDATORS = [
  ...COMMON_VALIDATORS,
  {
    tag: '004',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.instanceHrid.multiple" />,
  },
  {
    tag: '852',
    validator: RULES.EXISTS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.location.empty" />,
  },
  {
    tag: '852',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.location.multiple" />,
  },
  {
    tag: '852',
    subfield: '$b',
    validator: RULES.NON_REPEATABLE_SUBFIELD,
    message: (fieldTag, subField) => <FormattedMessage id="ui-quick-marc.record.error.field.onlyOneSubfield" values={{ fieldTag, subField }} />,
  },
  {
    tag: '852',
    validator: RULES.VALID_LOCATION,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.location.invalid" />,
  },
];

const BASE_AUTHORITY_VALIDATORS = [
  ...COMMON_VALIDATORS,
  {
    tag: '010',
    validator: RULES.EXISTS,
    ignore: ({ initialValues, naturalId }) => !is010LinkedToBibRecord(initialValues.records, naturalId),
    message: () => <FormattedMessage id="ui-quick-marc.record.error.010.removed" />,
  },
  {
    tag: '010',
    subfield: '$a',
    ignore: ({ initialValues, naturalId }) => !is010LinkedToBibRecord(initialValues.records, naturalId),
    validator: RULES.SUBFIELD_VALUE_EXISTS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.010.$aRemoved" />,
  },
  {
    tag: '010',
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.010.multiple" />,
  },
  {
    tag: '010',
    subfield: '$a',
    validator: RULES.NON_REPEATABLE_SUBFIELD,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.010.$aOnlyOne" />,
  },
  {
    tag: /1\d\d/,
    validator: RULES.EXISTS,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.heading.empty" />,
  },
  {
    tag: /1\d\d/,
    validator: RULES.NON_REPEATABLE,
    message: () => <FormattedMessage id="ui-quick-marc.record.error.heading.multiple" />,
  },
  {
    tag: /1\d\d/,
    validator: RULES.TAG_CHANGED,
    ignore: ({ linksCount }) => !linksCount,
    message: (initialTag) => <FormattedMessage id="ui-quick-marc.record.error.1xx.change" values={{ tag: initialTag }} />,
  },
  {
    tag: /1\d\d/,
    subfield: '$t',
    ignore: ({ linksCount }) => !linksCount,
    validator: RULES.SUBFIELD_CHANGED,
    message: (changes, initialTag) => {
      if (changes.added) {
        return <FormattedMessage id="ui-quick-marc.record.error.1xx.add$t" values={{ tag: initialTag }} />;
      }

      if (changes.removed) {
        return <FormattedMessage id="ui-quick-marc.record.error.1xx.remove$t" values={{ tag: initialTag }} />;
      }

      return null;
    },
  },
];

export const validators = {
  [MARC_TYPES.BIB]: {
    [QUICK_MARC_ACTIONS.EDIT]: BASE_BIB_VALIDATORS,
    [QUICK_MARC_ACTIONS.CREATE]: BASE_BIB_VALIDATORS,
    [QUICK_MARC_ACTIONS.DERIVE]: BASE_BIB_VALIDATORS,
  },
  [MARC_TYPES.HOLDINGS]: {
    [QUICK_MARC_ACTIONS.EDIT]: BASE_HOLDINGS_VALIDATORS,
    [QUICK_MARC_ACTIONS.CREATE]: BASE_HOLDINGS_VALIDATORS,
  },
  [MARC_TYPES.AUTHORITY]: {
    [QUICK_MARC_ACTIONS.EDIT]: BASE_AUTHORITY_VALIDATORS,
  },
};
