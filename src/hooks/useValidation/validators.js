import {
  checkIsInitialRecord,
  getContentSubfieldValue,
  getControlledSubfields,
  getIsSubfieldRemoved,
  getLocationValue,
} from '../../QuickMarcEditor/utils';
import {
  LEADER_EDITABLE_BYTES,
  LEADER_TAG,
  LEADER_VALUES_FOR_POSITION,
  LEADER_DOCUMENTATION_LINKS,
} from '../../QuickMarcEditor/constants';

const uncontrolledSubfieldGroups = ['uncontrolledAlpha', 'uncontrolledNumber'];

export const validateTagLength = ({ marcRecords }, rule) => {
  if (marcRecords.some(({ tag }) => !tag || tag.length !== 3)) {
    return rule.message();
  }

  return undefined;
};
export const validateTagCharacters = ({ marcRecords }, rule) => {
  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  if (marcRecordsWithoutLDR.some(({ tag }) => !tag.match(/\d{3}/))) {
    return rule.message();
  }

  return undefined;
};
export const validateEmptySubfields = ({ marcRecords }, rule) => {
  const marcRecordsWithSubfields = marcRecords.filter(marcRecord => marcRecord.indicators);
  const isEmptySubfield = marcRecordsWithSubfields.some(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(marcRecord);
  });

  if (isEmptySubfield) {
    return rule.message();
  }

  return undefined;
};
export const validateSubfieldValueExists = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore && rule.ignore(context)) {
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
export const validateExistance = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore && rule.ignore(context)) {
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
export const validateCorrectLength = ({ marcRecords }, rule) => {
  const field = marcRecords.find(record => record.tag === rule.tag);

  if (field.content.length !== rule.length) {
    return rule.message();
  }

  return undefined;
};
export const validateEditableBytes = ({ marcRecords, initialValues, marcType }, rule) => {
  const initialField = initialValues.records.find(record => record.tag === rule.tag);
  const field = marcRecords.find(record => record.tag === rule.tag);

  const cutEditableBytes = (str) => (
    LEADER_EDITABLE_BYTES[marcType].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (cutEditableBytes(initialField.content) !== cutEditableBytes(field.content)) {
    return rule.message(marcType);
  }

  return undefined;
};
const getInvalidLeaderPositions = (leader, marcType) => {
  const failedPositions = Object.keys(LEADER_VALUES_FOR_POSITION[marcType]).map(position => {
    if (!LEADER_VALUES_FOR_POSITION[marcType][position].includes(leader[position])) {
      return position;
    }

    return null;
  }).filter(result => !!result);

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
  const leader = marcRecords.find(record => record.tag === rule.tag);
  const failedPositions = getInvalidLeaderPositions(leader.content, marcType);
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

    return uncontrolledSubfieldGroups.some(subfield => {
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

  if (rule.ignore && rule.ignore(context)) {
    return undefined;
  }

  const { tag: initialTag } = initialValues.records.find(field => field.tag.match(rule.tag));
  const { tag: tagToSave } = marcRecords.find(field => field.tag.match(rule.tag));

  if (initialTag !== tagToSave) {
    return rule.message(initialTag);
  }

  return undefined;
};
export const validateSubfieldChanged = (context, rule) => {
  if (rule.ignore && rule.ignore(context)) {
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
};
export const validateSubfieldIsControlled = ({ marcRecords, linkingRules }, rule) => {
  const linkedFields = marcRecords.filter(field => field.subfieldGroups);

  const linkedFieldsWithEnteredSubfieldsThatCanBeControlled = linkedFields.filter(linkedField => {
    return uncontrolledSubfieldGroups.some(subfield => {
      if (linkedField.subfieldGroups[subfield]) {
        const contentSubfieldValue = getContentSubfieldValue(linkedField.subfieldGroups[subfield]);
        const linkingRule = linkingRules
          .find(_linkingRule => _linkingRule.id === linkedField.linkDetails?.linkingRuleId);
        const controlledSubfields = getControlledSubfields(linkingRule);

        return controlledSubfields.some(authSubfield => {
          return `$${authSubfield}` in contentSubfieldValue;
        });
      }

      return false;
    });
  });

  const fieldTags = linkedFieldsWithEnteredSubfieldsThatCanBeControlled.map(field => field.tag);
  const uniqueTags = [...new Set(fieldTags)];

  if (uniqueTags.length) {
    return rule.message(uniqueTags);
  }

  return undefined;
};
