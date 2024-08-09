import { Link } from 'react-router-dom';

import {
  CORRESPONDING_HEADING_TYPE_TAGS,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';
import { MARC_TYPES } from '../../common/constants';
import {
  validate$9InLinkable,
  validateTagChanged,
  validateLocation,
  validateCorrectLength,
  validateExistence,
  validateLeaderLength,
  validateLeaderPositions,
  validateLeaderEditableBytes,
  validateNonRepeatable,
  validateNonRepeatableSubfield,
  validateSubfieldIsControlled,
  validateSubfieldValueExists,
  validateTagCharacters,
  validateTagLength,
  validateEmptySubfields,
  validateSubfieldChanged,
  validateSubfieldValueMatch,
  validateContentExistence,
  validateFixedFieldPositions,
  validateLccnDuplication,
} from './validators';
import {
  is010LinkedToBibRecord,
  isFolioSourceFileNotSelected,
} from '../../QuickMarcEditor/utils';

const RULES = {
  EXISTS: validateExistence,
  CONTENT_EXISTS: validateContentExistence,
  NON_REPEATABLE: validateNonRepeatable,
  NON_REPEATABLE_SUBFIELD: validateNonRepeatableSubfield,
  $9IN_LINKABLE: validate$9InLinkable,
  TAG_CHANGED: validateTagChanged,
  VALID_LOCATION: validateLocation,
  CONTROLLED_SUBFIELD: validateSubfieldIsControlled,
  CORRECT_LENGTH: validateCorrectLength,
  LEADER_EDITABLE_BYTES: validateLeaderEditableBytes,
  LEADER_LENGTH: validateLeaderLength,
  LEADER_POSITIONS: validateLeaderPositions,
  TAG_LENGTH: validateTagLength,
  TAG_CHARACTERS: validateTagCharacters,
  EMPTY_SUBFIELDS: validateEmptySubfields,
  SUBFIELD_VALUE_EXISTS: validateSubfieldValueExists,
  SUBFIELD_VALUE_MATCH: validateSubfieldValueMatch,
  SUBFIELD_CHANGED: validateSubfieldChanged,
  FIXED_FIELD_POSITIONS: validateFixedFieldPositions,
  DUPLICATE_LCCN: validateLccnDuplication,
};

const COMMON_VALIDATORS = [
  {
    validator: RULES.LEADER_LENGTH,
    message: () => ({ id: 'ui-quick-marc.record.error.leader.length' }),
  },
  {
    validator: RULES.LEADER_EDITABLE_BYTES,
    message: (marcType) => ({ id: `ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}` }),
  },
  {
    validator: RULES.LEADER_POSITIONS,
    message: (positions, link) => ({
      id: 'ui-quick-marc.record.error.leader.invalidPositionValue',
      values: {
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
      },
    }),
  },
  {
    tag: '001',
    validator: RULES.NON_REPEATABLE,
    message: () => ({ id: 'ui-quick-marc.record.error.controlField.multiple' }),
  },
  {
    validator: RULES.TAG_LENGTH,
    message: () => ({ id: 'ui-quick-marc.record.error.tag.length' }),
  },
  {
    validator: RULES.TAG_CHARACTERS,
    message: () => ({ id: 'ui-quick-marc.record.error.tag.nonDigits' }),
  },
];

const BASE_BIB_VALIDATORS = [
  // {
  //   tag: '008',
  //   validator: RULES.FIXED_FIELD_POSITIONS,
  //   message: (name) => ({
  //     id: 'ui-quick-marc.record.error.008.invalidValue',
  //     values: { name },
  //   }),
  // },
  // {
  //   tag: '010',
  //   validator: RULES.NON_REPEATABLE,
  //   message: () => ({ id: 'ui-quick-marc.record.error.010.multiple' }),
  // },
  // {
  //   tag: '245',
  //   validator: RULES.EXISTS,
  //   message: () => ({ id: 'ui-quick-marc.record.error.title.empty' }),
  // },
  // {
  //   tag: '245',
  //   validator: RULES.NON_REPEATABLE,
  //   message: () => ({ id: 'ui-quick-marc.record.error.title.multiple' }),
  // },
  {
    validator: RULES.LEADER_EDITABLE_BYTES,
    message: (marcType) => ({ id: `ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}` }),
  },
  {
    validator: RULES.$9IN_LINKABLE,
    message: () => ({ id: 'ui-quick-marc.record.error.$9' }),
  },
  {
    validator: RULES.CONTROLLED_SUBFIELD,
    message: (uniqueTags) => {
      if (uniqueTags.length === 1) {
        return ({
          id: 'ui-quick-marc.record.error.fieldIsControlled',
          values: {
            count: 1,
            fieldTags: `MARC ${uniqueTags[0]}`,
          },
        });
      }

      return ({
        id: 'ui-quick-marc.record.error.fieldsAreControlled',
        values: {
          count: uniqueTags.length,
          fieldTags: uniqueTags.slice(0, -1).map(tag => `MARC ${tag}`).join(', '),
          lastFieldTag: `MARC ${uniqueTags[uniqueTags.length - 1]}`,
        },
      });
    },
  },
  {
    tag: '010',
    validator: RULES.DUPLICATE_LCCN,
    message: () => ({ id: 'ui-quick-marc.record.error.010.lccnDuplicated' }),
  },
];

const BASE_HOLDINGS_VALIDATORS = [
  ...COMMON_VALIDATORS,
  {
    tag: '004',
    validator: RULES.NON_REPEATABLE,
    message: () => ({ id: 'ui-quick-marc.record.error.instanceHrid.multiple' }),
  },
  {
    tag: '008',
    validator: RULES.EXISTS,
    message: () => ({ id: 'ui-quick-marc.record.error.008.empty' }),
  }, {
    tag: '008',
    validator: RULES.NON_REPEATABLE,
    message: () => ({ id: 'ui-quick-marc.record.error.008.multiple' }),
  },
  {
    tag: '852',
    validator: RULES.EXISTS,
    message: () => ({ id: 'ui-quick-marc.record.error.location.empty' }),
  },
  {
    tag: '852',
    validator: RULES.NON_REPEATABLE,
    message: () => ({ id: 'ui-quick-marc.record.error.location.multiple' }),
  },
  {
    tag: '852',
    subfield: '$b',
    validator: RULES.NON_REPEATABLE_SUBFIELD,
    message: (fieldTag, subField) => ({
      id: 'ui-quick-marc.record.error.field.onlyOneSubfield',
      values: { fieldTag, subField },
    }),
  },
  {
    tag: '852',
    validator: RULES.VALID_LOCATION,
    message: () => ({ id: 'ui-quick-marc.record.error.location.invalid' }),
  },
];

const BASE_AUTHORITY_VALIDATORS = [
  {
    validator: RULES.LEADER_EDITABLE_BYTES,
    message: (marcType) => ({ id: `ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}` }),
  },
  {
    tag: '010',
    subfield: '$a',
    ignore: ({ linksCount, initialValues, naturalId }) => {
      return !is010LinkedToBibRecord(initialValues.records, naturalId, linksCount);
    },
    validator: RULES.SUBFIELD_VALUE_EXISTS,
    message: () => ({ id: 'ui-quick-marc.record.error.010.$aRemoved' }),
  },
  {
    tag: '010',
    ignore: ({ linksCount, initialValues, naturalId }) => {
      return !is010LinkedToBibRecord(initialValues.records, naturalId, linksCount);
    },
    validator: RULES.EXISTS,
    message: () => ({ id: 'ui-quick-marc.record.error.010.removed' }),
  },
  // {
  //   tag: '010',
  //   validator: RULES.NON_REPEATABLE,
  //   message: () => ({ id: 'ui-quick-marc.record.error.010.multiple' }),
  // },
  // {
  //   tag: '010',
  //   subfield: '$a',
  //   validator: RULES.NON_REPEATABLE_SUBFIELD,
  //   message: () => ({ id: 'ui-quick-marc.record.error.010.$aOnlyOne' }),
  // },
  // {
  //   tag: new RegExp(`${CORRESPONDING_HEADING_TYPE_TAGS.join('|')}`),
  //   validator: RULES.EXISTS,
  //   message: () => ({ id: 'ui-quick-marc.record.error.heading.empty' }),
  // },
  // {
  //   tag: new RegExp(/1\d\d/),
  //   validator: RULES.NON_REPEATABLE,
  //   message: () => ({ id: 'ui-quick-marc.record.error.heading.multiple' }),
  // },
  {
    tag: new RegExp(`${CORRESPONDING_HEADING_TYPE_TAGS.join('|')}`),
    validator: RULES.TAG_CHANGED,
    ignore: ({ linksCount }) => !linksCount,
    message: (initialTag) => ({
      id: 'ui-quick-marc.record.error.1xx.change',
      values: { tag: initialTag },
    }),
  },
  {
    tag: new RegExp(`${CORRESPONDING_HEADING_TYPE_TAGS.join('|')}`),
    subfield: '$t',
    ignore: ({ linksCount }) => !linksCount,
    validator: RULES.SUBFIELD_CHANGED,
    message: (changes, initialTag) => {
      if (changes.added) {
        return {
          id: 'ui-quick-marc.record.error.1xx.add$t',
          values: { tag: initialTag },
        };
      }

      if (changes.removed) {
        return {
          id: 'ui-quick-marc.record.error.1xx.remove$t',
          values: { tag: initialTag },
        };
      }

      return null;
    },
  },
];

const CREATE_AUTHORITY_VALIDATORS = [
  ...BASE_AUTHORITY_VALIDATORS,
  {
    tag: '010',
    validator: RULES.EXISTS,
    ignore: isFolioSourceFileNotSelected,
    message: () => ({ id: 'ui-quick-marc.record.error.010.absent' }),
  },
  {
    tag: '010',
    subfield: '$a',
    ignore: isFolioSourceFileNotSelected,
    pattern: () => /^[a-zA-Z]/,
    validator: RULES.SUBFIELD_VALUE_MATCH,
    message: () => ({ id: 'ui-quick-marc.record.error.010.prefix.absent' }),
  },
  {
    tag: '010',
    subfield: '$a',
    ignore: isFolioSourceFileNotSelected,
    pattern: ({ sourceFiles, selectedSourceFile }) => {
      const codes = sourceFiles.find(sourceFile => sourceFile.id === selectedSourceFile?.id)?.codes || [];

      return new RegExp(`^(${codes.join('|')})([^a-zA-Z].*|$)`);
    },
    validator: RULES.SUBFIELD_VALUE_MATCH,
    message: () => ({ id: 'ui-quick-marc.record.error.010.prefix.invalid' }),
  },
  // {
  //   tag: '001',
  //   validator: RULES.CONTENT_EXISTS,
  //   message: () => ({ id: 'ui-quick-marc.record.error.controlField.content.empty' }),
  // },
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
    [QUICK_MARC_ACTIONS.CREATE]: CREATE_AUTHORITY_VALIDATORS,
  },
};
