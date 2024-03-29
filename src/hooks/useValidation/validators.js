import {
  checkIsInitialRecord,
  getContentSubfieldValue,
  getControlledSubfields,
  getIsSubfieldRemoved,
  getLocationValue,
  checkIsEmptyContent,
  convertLeaderToString,
  getLeaderPositions,
} from '../../QuickMarcEditor/utils';
import {
  LEADER_EDITABLE_BYTES,
  LEADER_TAG,
  LEADER_DOCUMENTATION_LINKS,
  UNCONTROLLED_SUBFIELDS,
  TAG_LENGTH,
  FIXED_FIELD_TAG,
} from '../../QuickMarcEditor/constants';

import { FixedFieldFactory } from '../../QuickMarcEditor/QuickMarcEditorRows/FixedField';
import { leaderConfig } from '../../QuickMarcEditor/QuickMarcEditorRows/LeaderField/leaderConfig';

export const validateTagLength = ({ marcRecords }, rule) => {
  const nonEmptyRecords = marcRecords.filter(field => !checkIsEmptyContent(field));

  if (nonEmptyRecords.some(({ tag }) => !tag || tag.length !== TAG_LENGTH)) {
    return rule.message();
  }

  return undefined;
};
export const validateTagCharacters = ({ marcRecords }, rule) => {
  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  const tagDigitsRegex = new RegExp(`^\\d{0,${TAG_LENGTH}}$`);

  if (marcRecordsWithoutLDR.some(({ tag }) => !tag.match(tagDigitsRegex))) {
    return rule.message();
  }

  return undefined;
};
export const validateEmptySubfields = ({ marcRecords }, rule) => {
  const recordsToValidate = marcRecords
    .filter(marcRecord => Boolean(marcRecord.tag))
    .filter(marcRecord => marcRecord.indicators);

  const isEmptySubfield = recordsToValidate.some(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(marcRecord);
  });

  if (isEmptySubfield) {
    return rule.message();
  }

  return undefined;
};
export const validateSubfieldValueExists = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const records = marcRecords.filter(record => record.tag.match(rule.tag));

  const recordWithEmptySubfield = records
    .find(record => !getContentSubfieldValue(record.content)[rule.subfield]?.[0]?.length);

  if (recordWithEmptySubfield) {
    return rule.message(recordWithEmptySubfield.tag, rule.subfield);
  }

  return undefined;
};
export const validateContentExistence = (context, rule) => {
  const { marcRecords } = context;

  if (!marcRecords.find(record => record.tag.match(rule.tag))?.content) {
    return rule.message();
  }

  return undefined;
};
export const validateExistence = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  if (!marcRecords.find(record => record.tag.match(rule.tag))) {
    return rule.message();
  }

  return undefined;
};
export const validateNonRepeatable = ({ marcRecords }, rule) => {
  if (marcRecords.filter(record => record.tag.match(rule.tag)).length > 1) {
    return rule.message();
  }

  return undefined;
};
export const validateNonRepeatableSubfield = ({ marcRecords }, rule) => {
  const fields = marcRecords.filter(record => record.tag === rule.tag);

  const hasError = fields.some((field) => {
    return getContentSubfieldValue(field.content)[rule.subfield]?.length > 1;
  });

  if (hasError) {
    return rule.message(rule.tag, rule.subfield);
  }

  return undefined;
};
export const validateLeaderLength = ({ marcRecords, marcType }, rule) => {
  const leader = marcRecords.find(field => field.tag === LEADER_TAG);
  const leaderContent = convertLeaderToString(marcType, leader);

  if (leaderContent.length !== 24) {
    return rule.message();
  }

  return undefined;
};
export const validateCorrectLength = ({ marcRecords }, rule) => {
  const field = marcRecords.find(record => record.tag === rule.tag);

  if (field.content.length !== rule.length) {
    return rule.message();
  }

  return undefined;
};
export const validateLeaderEditableBytes = ({ marcRecords, initialValues, marcType }, rule) => {
  const initialField = initialValues.records.find(record => record.tag === LEADER_TAG);
  const field = marcRecords.find(record => record.tag === LEADER_TAG);
  const initialContent = convertLeaderToString(marcType, initialField);
  const fieldContent = convertLeaderToString(marcType, field);

  const cutEditableBytes = (str) => (
    LEADER_EDITABLE_BYTES[marcType].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (cutEditableBytes(initialContent) !== cutEditableBytes(fieldContent)) {
    return rule.message(marcType);
  }

  return undefined;
};
const getInvalidLeaderPositions = (leader, marcType) => {
  const failedPositions = leaderConfig[marcType]
    .filter(config => config.allowedValues)
    .filter(({ allowedValues, position }) => !allowedValues.some(({ code }) => code === leader[position]))
    .map(({ position }) => position);

  return failedPositions;
};

const joinFailedPositions = (failedPositions) => {
  const formattedFailedPositions = failedPositions.map(position => `Leader ${position < 10 ? '0' : ''}${position}`);

  const last = formattedFailedPositions.pop();
  const joinedPositions = formattedFailedPositions.length > 0
    ? formattedFailedPositions.join(', ') + ' and ' + last
    : last;

  return joinedPositions;
};

export const validateLeaderPositions = ({ marcRecords, marcType }, rule) => {
  const leader = marcRecords.find(field => field.tag === LEADER_TAG);
  const leaderContent = convertLeaderToString(marcType, leader);
  const failedPositions = getInvalidLeaderPositions(leaderContent, marcType);
  const joinedPositions = joinFailedPositions(failedPositions);

  if (failedPositions.length) {
    return rule.message(joinedPositions, LEADER_DOCUMENTATION_LINKS[marcType]);
  }

  return undefined;
};
export const validate$9InLinkable = ({ marcRecords, linkableBibFields }, rule) => {
  const fieldsToCheck = marcRecords.filter(field => linkableBibFields.includes(field.tag));

  const hasEntered$9 = fieldsToCheck.some(field => {
    if (!field.subfieldGroups) {
      return '$9' in getContentSubfieldValue(field.content);
    }

    return UNCONTROLLED_SUBFIELDS.some(subfield => {
      return field.subfieldGroups[subfield] && '$9' in getContentSubfieldValue(field.subfieldGroups[subfield]);
    });
  });

  if (hasEntered$9) {
    return rule.message();
  }

  return undefined;
};
export const validateTagChanged = (context, rule) => {
  const { marcRecords, initialValues } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const recordWithChangedTag = initialValues.records
    .filter(field => field.tag.match(rule.tag))
    .find(field => marcRecords.find(_field => _field.id === field.id && _field.tag !== field.tag));

  if (recordWithChangedTag) {
    return rule.message(recordWithChangedTag.tag);
  }

  return undefined;
};
export const validateSubfieldChanged = (context, rule) => {
  if (rule.ignore?.(context)) {
    return undefined;
  }

  const { marcRecords, initialValues } = context;

  const {
    tag: initialTag,
    content: initialContent,
    id,
  } = initialValues.records.find(field => field.tag.match(rule.tag));
  const {
    content: contentToSave,
  } = marcRecords.find(field => field.id === id);

  const hasInitiallySubfield = rule.subfield in getContentSubfieldValue(initialContent);
  const hasSubfieldToSave = rule.subfield in getContentSubfieldValue(contentToSave);
  const isSubfieldAdded = !hasInitiallySubfield && hasSubfieldToSave;
  const isSubfieldRemoved = hasInitiallySubfield && getIsSubfieldRemoved(contentToSave, rule.subfield);
  const isSubfieldValueChanged = getContentSubfieldValue(initialContent)[rule.subfield]?.[0]
    !== getContentSubfieldValue(contentToSave)[rule.subfield]?.[0];

  const changes = {
    added: isSubfieldAdded,
    removed: isSubfieldRemoved,
    changed: !isSubfieldAdded && !isSubfieldRemoved && isSubfieldValueChanged,
  };

  if (Object.values(changes).some(Boolean)) {
    return rule.message(changes, initialTag);
  }

  return undefined;
};
export const validateLocation = ({ marcRecords, locations }, rule) => {
  const field = marcRecords.find(record => record.tag === rule.tag);
  const [, locationValue] = getLocationValue(field.content)?.replace(/\s+/, ' ').split(' ') || '';

  if (!locations.find(location => location.code === locationValue)) {
    return rule.message();
  }

  return undefined;
};
export const validateSubfieldValueMatch = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const marcRecord = marcRecords.find(record => record.tag.match(rule.tag));
  const subfieldValue = getContentSubfieldValue(marcRecord?.content)[rule.subfield]?.[0];

  if (!subfieldValue.match(rule.pattern(context))) {
    return rule.message();
  }

  return undefined;
};
export const validateSubfieldIsControlled = ({ marcRecords, linkingRules }, rule) => {
  const linkedFields = marcRecords.filter(field => field.subfieldGroups);

  const linkedFieldsWithEnteredSubfieldsThatCanBeControlled = linkedFields.filter(linkedField => {
    return UNCONTROLLED_SUBFIELDS.some(subfield => {
      if (!linkedField.subfieldGroups[subfield]) {
        return false;
      }

      const contentSubfieldValue = getContentSubfieldValue(linkedField.subfieldGroups[subfield]);
      const linkingRule = linkingRules
        .find(_linkingRule => _linkingRule.id === linkedField.linkDetails?.linkingRuleId);

      if (!linkingRule) {
        return false;
      }

      const controlledSubfields = getControlledSubfields(linkingRule);

      return controlledSubfields.some(authSubfield => {
        return `$${authSubfield}` in contentSubfieldValue;
      });
    });
  });

  const fieldTags = linkedFieldsWithEnteredSubfieldsThatCanBeControlled.map(field => field.tag);
  const uniqueTags = [...new Set(fieldTags)];

  if (uniqueTags.length) {
    return rule.message(uniqueTags);
  }

  return undefined;
};
export const validateFixedFieldPositions = ({ marcRecords, fixedFieldSpec, marcType }, rule) => {
  const { type, position7: subtype } = getLeaderPositions(marcType, marcRecords);
  const fixedFieldType = FixedFieldFactory.getFixedFieldType(fixedFieldSpec, type, subtype);
  const field008Selects = fixedFieldType?.items.filter(x => x?.allowedValues || false) || [];
  const field008Content = marcRecords.find(x => x.tag === FIXED_FIELD_TAG)?.content || '';

  for (const subField of field008Selects) {
    const contents = field008Content[subField.code];

    if (!contents) return undefined;
    const subFieldContentArray = Array.isArray(contents) ? contents : [contents];

    if (!subFieldContentArray.every(content => subField.allowedValues.find(value => value.code === content))) {
      return rule.message(subField.code);
    }
  }

  return undefined;
};
