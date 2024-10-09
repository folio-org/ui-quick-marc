import isEmpty from 'lodash/isEmpty';

import {
  checkIsInitialRecord,
  getContentSubfieldValue,
  getControlledSubfields,
  getIsSubfieldRemoved,
  getLocationValue,
  checkIsEmptyContent,
  convertLeaderToString,
  getLeaderPositions,
  getFixedFieldStringPositions,
} from '../../QuickMarcEditor/utils';
import {
  LEADER_EDITABLE_BYTES,
  LEADER_TAG,
  LEADER_DOCUMENTATION_LINKS,
  UNCONTROLLED_SUBFIELDS,
  TAG_LENGTH,
  FIXED_FIELD_TAG,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';
import { FixedFieldFactory } from '../../QuickMarcEditor/QuickMarcEditorRows/FixedField';
import { leaderConfig } from '../../QuickMarcEditor/QuickMarcEditorRows/LeaderField/leaderConfig';
import { MISSING_FIELD_ID } from './constants';
import { MARC_TYPES } from '../../common/constants';

const mapFailingFields = (fields, formatMessage) => {
  return fields.reduce((acc, field) => {
    return {
      ...acc,
      [field.id]: formatMessage(field),
    };
  }, {});
};

export const validateTagLength = ({ marcRecords }, rule) => {
  const nonEmptyRecords = marcRecords.filter(field => !checkIsEmptyContent(field));

  const failingFields = nonEmptyRecords.filter(({ tag }) => !tag || tag.length !== TAG_LENGTH);

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateTagCharacters = ({ marcRecords }, rule) => {
  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  const tagDigitsRegex = new RegExp(`^\\d{0,${TAG_LENGTH}}$`);

  const failingFields = marcRecordsWithoutLDR.filter(({ tag }) => !tag.match(tagDigitsRegex));

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateEmptySubfields = ({ marcRecords }, rule) => {
  const recordsToValidate = marcRecords
    .filter(marcRecord => Boolean(marcRecord.tag))
    .filter(marcRecord => marcRecord.indicators);

  const failingFields = recordsToValidate.filter(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(marcRecord);
  });

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateSubfieldValueExists = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const records = marcRecords.filter(record => record.tag.match(rule.tag));

  const recordsWithEmptySubfield = records
    .filter(record => !getContentSubfieldValue(record.content)[rule.subfield]?.[0]?.length);

  if (recordsWithEmptySubfield.length) {
    return mapFailingFields(recordsWithEmptySubfield, (field) => rule.message(field.tag, rule.subfield));
  }

  return undefined;
};
export const validateContentExistence = (context, rule) => {
  const { marcRecords } = context;

  if (!marcRecords.find(record => record.tag.match(rule.tag))) {
    return { [MISSING_FIELD_ID]: rule.message() };
  }

  const failingFields = marcRecords
    .filter(record => record.tag.match(rule.tag))
    .filter(record => !record.content);

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateExistence = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  if (!marcRecords.find(record => record.tag.match(rule.tag))) {
    return { [MISSING_FIELD_ID]: rule.message() };
  }

  return undefined;
};
export const validateNonRepeatable = ({ marcRecords }, rule) => {
  const fields = marcRecords.filter(record => record.tag.match(rule.tag));

  if (fields.length > 1) {
    return mapFailingFields(fields, rule.message);
  }

  return undefined;
};
export const validateNonRepeatableSubfield = ({ marcRecords }, rule) => {
  const fields = marcRecords.filter(record => record.tag === rule.tag);

  const failingFields = fields.filter((field) => {
    return getContentSubfieldValue(field.content)[rule.subfield]?.length > 1;
  });

  if (failingFields.length) {
    return mapFailingFields(failingFields, () => rule.message(rule.tag, rule.subfield));
  }

  return undefined;
};
export const validateLeaderLength = ({ marcRecords, marcType }, rule) => {
  const leader = marcRecords.find(field => field.tag === LEADER_TAG);
  const leaderContent = typeof leader.content === 'object' ? convertLeaderToString(marcType, leader) : leader.content;

  if (leaderContent.length !== 24) {
    return mapFailingFields([leader], rule.message);
  }

  return undefined;
};
export const validateCorrectLength = ({ marcRecords }, rule) => {
  const fields = marcRecords.filter(record => record.tag === rule.tag);

  const failingFields = fields.filter(field => field.content.length !== rule.length);

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateLeaderEditableBytes = ({ marcRecords, initialValues, marcType }, rule) => {
  const initialField = initialValues.records.find(record => record.tag === LEADER_TAG);
  const field = marcRecords.find(record => record.tag === LEADER_TAG);
  const initialContent = typeof initialField.content === 'object' ? convertLeaderToString(marcType, initialField) : initialField.content;
  const fieldContent = typeof field.content === 'object' ? convertLeaderToString(marcType, field) : field.content;

  const cutEditableBytes = (str) => (
    LEADER_EDITABLE_BYTES[marcType].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (cutEditableBytes(initialContent) !== cutEditableBytes(fieldContent)) {
    return mapFailingFields([field], () => rule.message(marcType));
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
  const leaderContent = typeof leader.content === 'object' ? convertLeaderToString(marcType, leader) : leader.content;
  const failedPositions = getInvalidLeaderPositions(leaderContent, marcType);
  const joinedPositions = joinFailedPositions(failedPositions);

  if (failedPositions.length) {
    return mapFailingFields([leader], () => rule.message(joinedPositions, LEADER_DOCUMENTATION_LINKS[marcType]));
  }

  return undefined;
};
export const validate$9InLinkable = ({ marcRecords, linkableBibFields }, rule) => {
  const fieldsToCheck = marcRecords.filter(field => linkableBibFields.includes(field.tag));

  const failingFields = fieldsToCheck.filter(field => {
    if (!field.subfieldGroups) {
      return '$9' in getContentSubfieldValue(field.content);
    }

    return UNCONTROLLED_SUBFIELDS.some(subfield => {
      return field.subfieldGroups[subfield] && '$9' in getContentSubfieldValue(field.subfieldGroups[subfield]);
    });
  });

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateTagChanged = (context, rule) => {
  const { marcRecords, initialValues } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const recordsWithChangedTag = initialValues.records
    .filter(field => field.tag.match(rule.tag))
    .filter(field => marcRecords.find(_field => _field.id === field.id && _field.tag !== field.tag));

  if (recordsWithChangedTag.length) {
    return mapFailingFields(recordsWithChangedTag, (field) => rule.message(field.tag));
  }

  return undefined;
};
export const validateSubfieldChanged = (context, rule) => {
  if (rule.ignore?.(context)) {
    return undefined;
  }

  const { marcRecords, initialValues } = context;

  const runValidationForField = (field) => {
    const {
      tag: initialTag,
      content: initialContent,
      id,
    } = field;

    const fieldToSave = marcRecords.find(_field => _field.id === id);

    if (!fieldToSave) {
      return undefined;
    }

    const { content: contentToSave } = fieldToSave;
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

  const fieldsToCheck = initialValues.records.filter(_field => _field.tag.match(rule.tag));

  const errors = fieldsToCheck.reduce((acc, field) => {
    const errorMessage = runValidationForField(field);

    if (errorMessage) {
      return { ...acc, [field.id]: [errorMessage] };
    }

    return acc;
  }, {});

  if (!isEmpty(errors)) {
    return errors;
  }

  return undefined;
};
export const validateLocation = ({ marcRecords, locations }, rule) => {
  const fields = marcRecords.filter(record => record.tag === rule.tag);

  const failingFields = fields.filter(field => {
    const [, locationValue] = getLocationValue(field.content)?.replace(/\s+/, ' ').split(' ') || '';

    const locationExists = Boolean(locations.find(location => location.code === locationValue));

    return !locationExists;
  });

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
  }

  return undefined;
};
export const validateSubfieldValueMatch = (context, rule) => {
  const { marcRecords } = context;

  if (rule.ignore?.(context)) {
    return undefined;
  }

  const fields = marcRecords.filter(record => record.tag.match(rule.tag));

  const failingFields = fields.filter((field) => {
    const subfieldValue = getContentSubfieldValue(field?.content)[rule.subfield]?.[0];

    return !subfieldValue.match(rule.pattern(context));
  });

  if (failingFields.length) {
    return mapFailingFields(failingFields, rule.message);
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

  if (linkedFieldsWithEnteredSubfieldsThatCanBeControlled.length) {
    return mapFailingFields(linkedFieldsWithEnteredSubfieldsThatCanBeControlled, () => rule.message());
  }

  return undefined;
};
export const validateFixedFieldPositions = ({ marcRecords, fixedFieldSpec, marcType }, rule) => {
  const { type, position7: subtype } = getLeaderPositions(marcType, marcRecords);
  const fixedFieldType = FixedFieldFactory.getFixedFieldType(fixedFieldSpec, type, subtype);
  const field008Selects = fixedFieldType?.items.filter(x => x?.allowedValues || false) || [];
  const fields008 = marcRecords.filter(x => x.tag === FIXED_FIELD_TAG);

  const errors = fields008.reduce((acc, field) => {
    const field008Content = field.content || '';

    for (const subField of field008Selects) {
      const contents = field008Content[subField.code];

      if (!contents) {
        return acc;
      }

      const subFieldContentArray = Array.isArray(contents) ? contents : [contents];

      if (!subFieldContentArray.every(content => subField.allowedValues.find(value => value.code === content))) {
        return { ...acc, [field.id]: [rule.message(subField.code)] };
      }
    }

    return acc;
  }, {});

  if (!isEmpty(errors)) {
    return errors;
  }

  return undefined;
};

export const validateFixedFieldLength = ({ marcRecords, fixedFieldSpec, marcType, intl }, rule) => {
  const { type, position7: subtype } = getLeaderPositions(marcType, marcRecords);
  const fieldsToCheck = marcRecords.filter(x => x.tag === rule.tag);

  const errors = fieldsToCheck.reduce((acc, field) => {
    const nonSelectableSubfields = getFixedFieldStringPositions(type, subtype, field, fixedFieldSpec);

    nonSelectableSubfields.forEach(subfield => {
      const content = field.content[subfield.code || subfield.name];

      if (content && content.length !== subfield.length) {
        const subfieldName = intl.formatMessage({ id: `ui-quick-marc.record.fixedField.${subfield.code || subfield.name}` });

        acc[field.id] = [
          ...(acc[field.id] || []),
          rule.message(subfieldName, subfield.length),
        ];
      }
    });

    return acc;
  }, {});

  if (!isEmpty(errors)) {
    return errors;
  }

  return undefined;
};
export const validateLccnDuplication = async ({
  ky,
  marcRecords,
  duplicateLccnCheckingEnabled,
  instanceId,
  action,
  marcType,
}, rule) => {
  if (!duplicateLccnCheckingEnabled) {
    return undefined;
  }

  const fields = marcRecords.filter(record => record.tag.match(rule.tag));

  const validateField = async (field) => {
    const { $a = [] } = getContentSubfieldValue(field.content);

    if (!$a.filter(lccn => lccn).length) {
      return undefined;
    }

    const lccnQuery = $a
      .filter(lccn => lccn)
      .map(lccn => `lccn=="${lccn}"`)
      .join(' or ');

    // prevent retrieving a record with the same id to avoid getting the record we are validating.
    let idQuery = ` not id=="${instanceId}"`;

    // Derive mode uses the derived record id during saving, so a record with that id must also be searched to avoid
    // duplication in 010 $a.
    if ([QUICK_MARC_ACTIONS.CREATE, QUICK_MARC_ACTIONS.DERIVE].includes(action)) {
      idQuery = '';
    }

    const searchParams = {
      limit: 1,
      query: `(${lccnQuery})${idQuery}`,
    };

    if (marcType === MARC_TYPES.BIB) {
      searchParams.query += ' not (staffSuppress=="true" and discoverySuppress=="true")';
    }

    const requests = {
      [MARC_TYPES.BIB]: () => ky.get('search/instances', { searchParams }),
      [MARC_TYPES.AUTHORITY]: () => ky.get('search/authorities', { searchParams }),
    };

    try {
      const records = await requests[marcType]().json();

      const isLccnDuplicated = records?.authorities?.[0] || records?.instances?.[0];

      if (isLccnDuplicated) {
        return rule.message();
      }

      return undefined;
    } catch (e) {
      return { id: 'ui-quick-marc.record.error.generic' };
    }
  };

  const errors = (await Promise.all(fields.map(validateField))).reduce((acc, validationError, index) => {
    const field = fields[index];

    if (validationError) {
      return { ...acc, [field.id]: [validationError] };
    }

    return acc;
  }, {});

  if (!isEmpty(errors)) {
    return errors;
  }

  return undefined;
};
