import {
  checkIsInitialRecord,
  getContentSubfieldValue,
  getControlledSubfields,
} from '../../QuickMarcEditor/utils';
import {
  LEADER_EDITABLE_BYTES,
  LEADER_TAG,
  LEADER_VALUES_FOR_POSITION,
} from '../../QuickMarcEditor/constants';

const uncontrolledSubfieldGroups = ['uncontrolledAlpha', 'uncontrolledNumber'];

export const validateTagLength = ({ marcRecords }, rule) => {
  if (marcRecords.some(({ tag }) => !tag || tag.length !== 3)) {
    return rule.message;
  }

  return undefined;
};
export const validateTagCharacters = ({ marcRecords }, rule) => {
  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  if (marcRecordsWithoutLDR.some(({ tag }) => !tag.match(/\d{3}/))) {
    return rule.message;
  }

  return undefined;
};
export const validateSubfieldValueExists = ({ marcRecords }, rule) => {
  const marcRecordsWithSubfields = marcRecords.filter(marcRecord => marcRecord.indicators);
  const isEmptySubfield = marcRecordsWithSubfields.some(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(marcRecord);
  });

  if (isEmptySubfield) {
    return rule.message;
  }

  return undefined;
};
export const validateExistance = ({ marcRecords }, rule) => {
  if (!marcRecords.find(record => record.tag === rule.tag)) {
    return rule.message;
  }

  return undefined;
};
export const validateNonRepeatable = ({ marcRecords }, rule) => {
  if (marcRecords.filter(record => record.tag === rule.tag).length !== 1) {
    return rule.message;
  }

  return undefined;
};
export const validateCorrectLength = ({ marcRecords }, rule) => {
  const field = marcRecords.find(record => record.tag === rule.tag);

  if (field.content.length !== rule.length) {
    return rule.message;
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
    return rule.message;
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
    return rule.message;
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
    return rule.message;
  }

  return undefined;
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
    return rule.message;
  }

  return undefined;
};
