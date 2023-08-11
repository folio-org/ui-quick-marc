import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import toPairs from 'lodash/toPairs';
import flatten from 'lodash/flatten';
import flow from 'lodash/flow';

import {
  checkIfUserInCentralTenant,
  checkIfUserInMemberTenant,
} from '@folio/stripes/core';

import {
  LEADER_TAG,
  FIELD_TAGS_TO_REMOVE,
  FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS,
  QUICK_MARC_ACTIONS,
  LEADER_EDITABLE_BYTES,
  CREATE_HOLDINGS_RECORD_DEFAULT_LEADER_VALUE,
  CREATE_BIB_RECORD_DEFAULT_LEADER_VALUE,
  CREATE_HOLDINGS_RECORD_DEFAULT_FIELD_TAGS,
  HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
  CORRESPONDING_HEADING_TYPE_TAGS,
  LEADER_VALUES_FOR_POSITION,
  LEADER_DOCUMENTATION_LINKS,
  ELVL_BYTE,
  CREATE_BIB_RECORD_DEFAULT_FIELD_TAGS,
  BIB_FIXED_FIELD_DEFAULT_TYPE,
  BIB_FIXED_FIELD_DEFAULT_BLVL,
  ENTERED_KEY,
  CREATE_AUTHORITY_RECORD_DEFAULT_LEADER_VALUE,
  CREATE_AUTHORITY_RECORD_DEFAULT_FIELD_TAGS,
  UNCONTROLLED_ALPHA,
  UNCONTROLLED_NUMBER,
} from './constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import { SUBFIELD_TYPES } from './QuickMarcEditorRows/BytesField';
import getMaterialCharsFieldConfig from './QuickMarcEditorRows/MaterialCharsField/getMaterialCharsFieldConfig';
import getPhysDescriptionFieldConfig from './QuickMarcEditorRows/PhysDescriptionField/getPhysDescriptionFieldConfig';
import { FixedFieldFactory } from './QuickMarcEditorRows/FixedField';
import {
  MARC_TYPES,
  ERROR_TYPES,
  EXTERNAL_INSTANCE_APIS,
  OKAPI_TENANT_HEADER,
} from '../common/constants';

/* eslint-disable max-lines */
export const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[1] === 'f'
  );
};

export const isFixedFieldRow = recordRow => recordRow.tag === '008';
export const isMaterialCharsRecord = recordRow => recordRow.tag === '006';
export const isPhysDescriptionRecord = recordRow => recordRow.tag === '007';
export const isLocationRow = (recordRow, marcType) => marcType === MARC_TYPES.HOLDINGS && recordRow.tag === '852';
export const isContentRow = (recordRow, marcType) => {
  return !(isLocationRow(recordRow, marcType)
    || isFixedFieldRow(recordRow)
    || isMaterialCharsRecord(recordRow)
    || isPhysDescriptionRecord(recordRow));
};

export const getContentSubfieldValue = (content = '') => {
  return content.split(/\$/)
    .filter(str => str.length > 0)
    .reduce((acc, str) => {
      if (!str) {
        return acc;
      }

      const key = `$${str[0]}`;
      const value = acc[key]
        ? flatten([acc[key], str.substring(2).trim()]) // repeatable subfields will be stored as an array
        : [str.substring(2).trim()];

      return {
        ...acc,
        [key]: value,
      };
    }, {});
};

const is001LinkedToBibRecord = (initialRecords, naturalId) => {
  const field001 = initialRecords.find(record => record.tag === '001');

  return naturalId === field001?.content.replaceAll(' ', '');
};

export const is010LinkedToBibRecord = (initialRecords, naturalId) => {
  const initial010Field = initialRecords.find(record => record.tag === '010');

  if (!initial010Field) {
    return false;
  }

  const initial010$a = getContentSubfieldValue(initial010Field.content).$a?.[0];

  return naturalId === initial010$a?.replaceAll(' ', '');
};

export const is010$aCreated = (initial, updated) => {
  const initial010 = initial.find(rec => rec.tag === '010');
  const updated010 = updated.find(rec => rec.tag === '010');

  return !initial010 && updated010 && !!getContentSubfieldValue(updated010.content).$a?.[0];
};

export const is010$aUpdated = (initial, updated) => {
  const initial010 = initial.find(rec => rec.tag === '010');
  const updated010 = updated.find(rec => rec.tag === '010');

  return initial010 &&
    updated010 &&
    getContentSubfieldValue(initial010.content).$a?.[0] !== getContentSubfieldValue(updated010.content).$a?.[0];
};

export const parseHttpError = async (httpError) => {
  const contentType = httpError?.headers?.get('content-type');
  let jsonError = {};

  try {
    if (contentType === 'text/plain') {
      jsonError.message = await httpError.text();
    } else {
      jsonError = await httpError.json();
    }

    jsonError.errorType = ERROR_TYPES.OTHER;

    // Optimistic locking error is currently returned as a plain text
    // https://issues.folio.org/browse/UIIN-1872?focusedCommentId=125438&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-125438
    if (jsonError.message.match(/optimistic locking/i)) {
      jsonError.errorType = ERROR_TYPES.OPTIMISTIC_LOCKING;
    }

    return jsonError;
  } catch (err) {
    return httpError;
  }
};

export const saveLinksToNewRecord = async (mutator, externalId, marcRecord) => {
  // request derived Instance record
  const instancePromise = mutator.quickMarcEditInstance.GET({ path: `${EXTERNAL_INSTANCE_APIS[MARC_TYPES.BIB]}/${externalId}` });
  // request derived MARC Bib record
  const marcPromise = mutator.quickMarcEditMarcRecord.GET({ params: { externalId } });

  Promise.all([instancePromise, marcPromise]).then(([{ _version }, derivedRecord]) => {
    // copy linking data to new record
    derivedRecord.fields = derivedRecord.fields.map((field) => {
      // matching field from POST request
      const matchingLinkedField = marcRecord.fields
        .find(_field => (
          _field.linkDetails?.authorityId
          && _field.tag === field.tag
          && _field.linkDetails?.authorityId === field.linkDetails?.authorityId
        ));

      if (!matchingLinkedField) {
        return field;
      }

      field.linkDetails = matchingLinkedField.linkDetails;

      return field;
    });

    derivedRecord.relatedRecordVersion = parseInt(_version, 10);
    derivedRecord._actionType = 'edit';

    return mutator.quickMarcEditMarcRecord.PUT(derivedRecord);
  });
};

const fillEmptyFieldValues = ({ fieldConfigByType, field, hiddenValues = {} }) => {
  return fieldConfigByType.reduce((acc, fieldConfig) => {
    if (acc[fieldConfig.name]) {
      return acc;
    }

    if (fieldConfig.type === SUBFIELD_TYPES.BYTE) {
      return { ...acc, [fieldConfig.name]: '\\' };
    } else if (fieldConfig.type === SUBFIELD_TYPES.BYTES) {
      return { ...acc, [fieldConfig.name]: new Array(fieldConfig.bytes).fill('\\') };
    } else if (fieldConfig.type === SUBFIELD_TYPES.STRING) {
      return { ...acc, [fieldConfig.name]: new Array(fieldConfig.length).fill('\\').join('') };
    }

    return acc;
  }, {
    ...field?.content,
    ...hiddenValues,
  });
};

export const fillEmptyMaterialCharsFieldValues = (type, field) => {
  const fieldConfigByType = getMaterialCharsFieldConfig(type);

  return fillEmptyFieldValues({ fieldConfigByType, field });
};

export const fillEmptyPhysDescriptionFieldValues = (type, field) => {
  const fieldConfigByType = getPhysDescriptionFieldConfig(type);

  return fillEmptyFieldValues({ fieldConfigByType, field });
};

export const fillEmptyFixedFieldValues = (marcType, type, blvl, field) => {
  const fieldConfigByType = FixedFieldFactory
    .getFixedFieldByType(
      marcType,
      type,
      blvl,
    )?.configFields ?? [];

  let hiddenValues = {};

  if (marcType === MARC_TYPES.BIB) {
    hiddenValues = {
      Type: type,
      BLvl: blvl,
    };
  } else if (marcType === MARC_TYPES.AUTHORITY) {
    hiddenValues = {
      Undef_18: '\\\\\\\\\\\\\\\\\\\\',
      Undef_30: '\\',
      Undef_34: '\\\\\\\\',
    };
  }

  return fillEmptyFieldValues({ fieldConfigByType, field, hiddenValues });
};

const getCreateMarcRecordDefaultFields = (contentMap, indicatorMap, defaultTags) => {
  return defaultTags.map(tag => {
    const field = {
      tag,
      id: uuidv4(),
    };

    const content = contentMap[tag];
    const indicators = indicatorMap[tag];

    if (indicators) {
      field.indicators = indicatorMap[tag];
    }

    if (content) {
      field.content = contentMap[tag];
    }

    return field;
  });
};

const getCreateBibMarcRecordDefaultFields = (instanceRecord) => {
  const contentMap = {
    '001': instanceRecord.hrid,
    '008': fillEmptyFixedFieldValues(MARC_TYPES.BIB, BIB_FIXED_FIELD_DEFAULT_TYPE, BIB_FIXED_FIELD_DEFAULT_BLVL),
    '245': '$a ',
    '999': '',
  };

  const indicatorMap = {
    '245': ['\\', '\\'],
    '999': ['f', 'f'],
  };

  return getCreateMarcRecordDefaultFields(contentMap, indicatorMap, CREATE_BIB_RECORD_DEFAULT_FIELD_TAGS);
};

const getCreateHoldingsMarcRecordDefaultFields = (instanceRecord) => {
  const contentMap = {
    '004': instanceRecord.hrid,
    '008': HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
  };

  const indicatorMap = {
    '852': ['\\', '\\'],
    '999': ['f', 'f'],
  };

  return getCreateMarcRecordDefaultFields(contentMap, indicatorMap, CREATE_HOLDINGS_RECORD_DEFAULT_FIELD_TAGS);
};

const getCreateAuthorityMarcRecordDefaultFields = (instanceRecord) => {
  const contentMap = {
    '001': instanceRecord.hrid,
    '008': fillEmptyFixedFieldValues(MARC_TYPES.AUTHORITY),
    '100': '$a ',
    '999': '',
  };

  const indicatorMap = {
    '100': ['\\', '\\'],
    '999': ['f', 'f'],
  };

  return getCreateMarcRecordDefaultFields(contentMap, indicatorMap, CREATE_AUTHORITY_RECORD_DEFAULT_FIELD_TAGS);
};

export const getCreateHoldingsMarcRecordResponse = (instanceResponse) => {
  const instanceId = instanceResponse.id;

  return {
    externalId: instanceId,
    leader: CREATE_HOLDINGS_RECORD_DEFAULT_LEADER_VALUE,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: CREATE_HOLDINGS_RECORD_DEFAULT_LEADER_VALUE,
        id: LEADER_TAG,
      },
      ...getCreateHoldingsMarcRecordDefaultFields(instanceResponse),
    ],
    parsedRecordDtoId: instanceId,
  };
};

export const getCreateBibMarcRecordResponse = (instanceResponse) => {
  const instanceId = '00000000-0000-0000-0000-000000000000'; // For create we need to send any UUID

  return {
    externalId: instanceId,
    leader: CREATE_BIB_RECORD_DEFAULT_LEADER_VALUE,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: CREATE_BIB_RECORD_DEFAULT_LEADER_VALUE,
        id: LEADER_TAG,
      },
      ...getCreateBibMarcRecordDefaultFields(instanceResponse),
    ],
    parsedRecordDtoId: instanceId,
  };
};

export const getCreateAuthorityMarcRecordResponse = (instanceResponse) => {
  const instanceId = '00000000-0000-0000-0000-000000000000'; // For create we need to send any UUID

  return {
    externalId: instanceId,
    leader: CREATE_AUTHORITY_RECORD_DEFAULT_LEADER_VALUE,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: CREATE_AUTHORITY_RECORD_DEFAULT_LEADER_VALUE,
        id: LEADER_TAG,
      },
      ...getCreateAuthorityMarcRecordDefaultFields(instanceResponse),
    ],
    parsedRecordDtoId: instanceId,
  };
};

const fieldMatchesDescription = (field, descriptionArray) => {
  let match = false;

  descriptionArray.forEach(description => {
    if (field.tag !== description.tag) {
      match = match || false;

      return;
    }

    if (field.indicators && description.indicators) {
      match = match || (field.indicators[0] === description.indicators[0]
        && field.indicators[1] === description.indicators[1]);

      return;
    }

    match = match || true;
  });

  return match;
};

const getEmptyContent = (field) => {
  if (field.tag === '035' || field.tag === '019') {
    return '$a';
  }

  return '';
};

export const removeDuplicateSystemGeneratedFields = (marcRecord) => {
  return {
    ...marcRecord,
    records: marcRecord.records.filter(field => {
      if (field.tag === '001' && field._isAdded) {
        return false;
      }

      return true;
    }),
  };
};

const removeMarcRecordFieldContentForDerive = marcRecord => {
  return {
    ...marcRecord,
    records: marcRecord.records.map((field) => (fieldMatchesDescription(field, FIELD_TAGS_TO_REMOVE)
      ? {
        ...field,
        content: getEmptyContent(field),
      }
      : field
    )),
  };
};

export const formatMarcRecordByQuickMarcAction = (marcRecord, action, marcType) => {
  if (action === QUICK_MARC_ACTIONS.DERIVE) {
    return {
      ...removeMarcRecordFieldContentForDerive(marcRecord),
      updateInfo: {
        recordState: RECORD_STATUS_NEW,
      },
    };
  }

  if (action === QUICK_MARC_ACTIONS.CREATE) {
    return {
      ...marcRecord,
      relatedRecordVersion: 1,
      marcFormat: marcType.toUpperCase(),
      suppressDiscovery: false,
      updateInfo: {
        recordState: RECORD_STATUS_NEW,
      },
    };
  }

  return marcRecord;
};

export const addInternalFieldProperties = (marcRecord) => {
  return {
    ...marcRecord,
    records: marcRecord.records.map(record => ({
      ...record,
      _isDeleted: false,
      _isLinked: !!record.linkDetails?.authorityId,
    })),
  };
};

export const hydrateMarcRecord = marcRecord => ({
  ...marcRecord,
  leader: marcRecord.records[0].content,
  fields: marcRecord.records.slice(1).map(record => ({
    tag: record.tag,
    content: record.content,
    indicators: record.indicators,
    linkDetails: record.linkDetails,
  })),
  records: undefined,
});

export const addNewRecord = (index, state) => {
  const records = [...state.formState.values.records];
  const newIndex = index + 1;
  const emptyRow = {
    id: uuidv4(),
    tag: '',
    content: '$a ',
    indicators: ['\\', '\\'],
    _isAdded: true,
  };

  records.splice(newIndex, 0, emptyRow);

  return records;
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

const validateLeaderPositions = (leader, marcType) => {
  const failedPositions = getInvalidLeaderPositions(leader, marcType);
  const joinedPositions = joinFailedPositions(failedPositions);

  if (failedPositions.length) {
    return (
      <FormattedMessage
        id="ui-quick-marc.record.error.leader.invalidPositionValue"
        values={{
          positions: joinedPositions,
          link: (
            <Link
              to={{
                pathname: LEADER_DOCUMENTATION_LINKS[marcType],
              }}
              target="_blank"
            >
              {LEADER_DOCUMENTATION_LINKS[marcType]}
            </Link>
          ),
        }}
      />
    );
  }

  return undefined;
};

export const validateLeader = (prevLeader = '', leader = '', marcType = MARC_TYPES.BIB) => {
  const cutEditableBytes = (str) => (
    LEADER_EDITABLE_BYTES[marcType].reduce((acc, byte, idx) => {
      const position = byte - idx;

      return `${acc.slice(0, position)}${acc.slice(position + 1, acc.length)}`;
    }, str)
  );

  if (leader.length !== 24) {
    return <FormattedMessage id="ui-quick-marc.record.error.leader.length" />;
  }

  if (cutEditableBytes(prevLeader) !== cutEditableBytes(leader)) {
    return <FormattedMessage id={`ui-quick-marc.record.error.leader.forbiddenBytes.${marcType}`} />;
  }

  const leaderValidationError = validateLeaderPositions(leader, marcType);

  if (leaderValidationError) {
    return leaderValidationError;
  }

  return undefined;
};

export const validateFixedField = (marcRecords) => {
  const fixedFields = marcRecords.filter(isFixedFieldRow);

  if (!fixedFields.length) {
    return <FormattedMessage id="ui-quick-marc.record.error.008.empty" />;
  }

  if (fixedFields.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.008.multiple" />;
  }

  return undefined;
};

export const getLocationValue = (value) => {
  const matches = value?.match(/\$b\s+([^$\s]+\/?)+/) || [];

  return matches[0] || '';
};

export const validateLocationSubfield = (field, locations) => {
  const [, locationValue] = getLocationValue(field.content)?.replace(/\s+/, ' ').split(' ') || '';

  return !!locations.find(location => location.code === locationValue);
};

export const validateRecordTag = marcRecords => {
  if (marcRecords.some(({ tag }) => !tag || tag.length !== 3)) {
    return <FormattedMessage id="ui-quick-marc.record.error.tag.length" />;
  }

  const marcRecordsWithoutLDR = marcRecords.filter(record => record.tag !== LEADER_TAG);

  if (marcRecordsWithoutLDR.some(({ tag }) => !tag.match(/\d{3}/))) {
    return <FormattedMessage id="ui-quick-marc.record.error.tag.nonDigits" />;
  }

  return undefined;
};

export const checkIsInitialRecord = (field) => {
  return !field._isAdded;
};

export const checkControlFieldLength = (formValues) => {
  const marcRecords = formValues.records || [];
  const controlFieldRecords = marcRecords.filter(({ tag }) => tag === '001');

  if (controlFieldRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.controlField.multiple" />;
  }

  return undefined;
};

export const checkDuplicate010Field = (marcRecords) => {
  const marc010Records = marcRecords.filter(({ tag }) => tag === '010');

  if (marc010Records.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.010.multiple" />;
  }

  return undefined;
};

export const isRecordForManualLinking = (stripes, marcType, linkableBibFields, tag) => (
  stripes.hasPerm('ui-quick-marc.quick-marc-authority-records.linkUnlink') &&
  marcType === MARC_TYPES.BIB &&
  linkableBibFields.includes(tag)
);

export const isRecordForAutoLinking = (field, autoLinkableBibFields) => (
  !field._isDeleted
  && !field._isLinked
  && autoLinkableBibFields.includes(field.tag)
  && getContentSubfieldValue(field.content).$0?.[0]
);

export const isFieldLinked = (field) => Boolean(field.linkDetails?.linkingRuleId);

export const recordHasLinks = (fields) => fields.some(isFieldLinked);

export const validateSubfield = (marcRecords) => {
  const marcRecordsWithSubfields = marcRecords.filter(marcRecord => marcRecord.indicators);
  const isEmptySubfield = marcRecordsWithSubfields.some(marcRecord => {
    return !marcRecord.content && checkIsInitialRecord(marcRecord);
  });

  if (isEmptySubfield) {
    return <FormattedMessage id="ui-quick-marc.record.error.subfield" />;
  }

  return undefined;
};

const validate$9InLinkable = (marcRecords, linkableBibFields, uncontrolledSubfields) => {
  const fieldsToCheck = marcRecords.filter(field => linkableBibFields.includes(field.tag));

  const hasEntered$9 = fieldsToCheck.some(field => {
    if (!field.subfieldGroups) {
      return '$9' in getContentSubfieldValue(field.content);
    }

    return uncontrolledSubfields.some(subfield => {
      return field.subfieldGroups[subfield] && '$9' in getContentSubfieldValue(field.subfieldGroups[subfield]);
    });
  });

  if (hasEntered$9) {
    return <FormattedMessage id="ui-quick-marc.record.error.$9" />;
  }

  return null;
};

export const getControlledSubfields = (linkingRule) => {
  // include transformed subfields into list of controlled subfields
  return linkingRule.authoritySubfields.map(subfield => {
    if (!linkingRule.subfieldModifications) {
      return subfield;
    }

    const subfieldTransformation = linkingRule.subfieldModifications
      .find(transformation => transformation.source === subfield);

    if (!subfieldTransformation) {
      return subfield;
    }

    return subfieldTransformation.target;
  });
};

const validateSubfieldsThatCanBeControlled = (marcRecords, uncontrolledSubfields, linkingRules) => {
  const linkedFields = marcRecords.filter(field => field.subfieldGroups);

  const linkedFieldsWithEnteredSubfieldsThatCanBeControlled = linkedFields.filter(linkedField => {
    return uncontrolledSubfields.some(subfield => {
      if (linkedField.subfieldGroups[subfield]) {
        const contentSubfieldValue = getContentSubfieldValue(linkedField.subfieldGroups[subfield]);
        const linkingRule = linkingRules.find(rule => rule.id === linkedField.linkDetails?.linkingRuleId);
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

  if (uniqueTags.length > 1) {
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
  }

  return null;
};

const validateMarcBibRecord = (marcRecords, linkableBibFields, linkingRules) => {
  const titleRecords = marcRecords.filter(({ tag }) => tag === '245');

  if (titleRecords.length === 0) {
    return <FormattedMessage id="ui-quick-marc.record.error.title.empty" />;
  }

  if (titleRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.title.multiple" />;
  }

  const duplicate010FieldError = checkDuplicate010Field(marcRecords);

  if (duplicate010FieldError) {
    return duplicate010FieldError;
  }

  const uncontrolledSubfields = [UNCONTROLLED_ALPHA, UNCONTROLLED_NUMBER];

  const $9Error = validate$9InLinkable(marcRecords, linkableBibFields, uncontrolledSubfields);

  if ($9Error) {
    return $9Error;
  }

  const subfieldsThatCanBeControlledError = validateSubfieldsThatCanBeControlled(
    marcRecords,
    uncontrolledSubfields,
    linkingRules,
  );

  if (subfieldsThatCanBeControlledError) {
    return subfieldsThatCanBeControlledError;
  }

  return undefined;
};

const validateMarcHoldingsRecord = (marcRecords, locations) => {
  const instanceHridRecords = marcRecords.filter(({ tag }) => tag === '004');

  if (instanceHridRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.instanceHrid.multiple" />;
  }

  const locationRecords = marcRecords.filter(({ tag }) => tag === '852');

  if (!locationRecords.length) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.empty" />;
  }

  if (locationRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.multiple" />;
  }

  if (locationRecords.length) {
    if (getContentSubfieldValue(locationRecords[0].content).$b?.length > 1) {
      return <FormattedMessage id="ui-quick-marc.record.error.field.onlyOneSubfield" values={{ fieldTag: '852', subField: '$b' }} />;
    }
  }

  if (!validateLocationSubfield(marcRecords.find(({ tag }) => tag === '852'), locations)) {
    return <FormattedMessage id="ui-quick-marc.record.error.location.invalid" />;
  }

  return undefined;
};

const getIs$tRemoved = (content) => {
  const contentSubfieldValue = getContentSubfieldValue(content);

  return !('$t' in contentSubfieldValue) || !contentSubfieldValue.$t[0];
};

const validateMarcAuthority1xxField = (initialRecords, formValuesToSave) => {
  const is1xx = field => field.tag.startsWith('1');
  const { tag: initialTag, content: initialContent } = initialRecords.find(is1xx);
  const { tag: tagToSave, content: contentToSave } = formValuesToSave.find(is1xx);

  if (initialTag !== tagToSave) {
    return <FormattedMessage id="ui-quick-marc.record.error.1xx.change" values={{ tag: initialTag }} />;
  }

  const hasInitially$t = !!getContentSubfieldValue(initialContent).$t?.[0];
  const has$tToSave = '$t' in getContentSubfieldValue(contentToSave);
  const is$tAdded = !hasInitially$t && has$tToSave;
  const is$tRemoved = hasInitially$t && getIs$tRemoved(contentToSave);

  if (is$tAdded) {
    return <FormattedMessage id="ui-quick-marc.record.error.1xx.add$t" values={{ tag: initialTag }} />;
  }

  if (is$tRemoved) {
    return <FormattedMessage id="ui-quick-marc.record.error.1xx.remove$t" values={{ tag: initialTag }} />;
  }

  return undefined;
};

const validateLinkedAuthority010Field = (field010, initialRecords, records, naturalId) => {
  if (is010LinkedToBibRecord(initialRecords, naturalId)) {
    if (!field010) {
      return <FormattedMessage id="ui-quick-marc.record.error.010.removed" />;
    }

    const is010$aRemoved = !getContentSubfieldValue(field010.content).$a?.[0];

    if (is010$aRemoved) {
      return <FormattedMessage id="ui-quick-marc.record.error.010.$aRemoved" />;
    }

    return undefined;
  }

  if (
    is001LinkedToBibRecord(initialRecords, naturalId)
      && (is010$aCreated(initialRecords, records) || is010$aUpdated(initialRecords, records))
  ) {
    return <FormattedMessage id="ui-quick-marc.record.error.010.edit$a" />;
  }

  return undefined;
};

const validateAuthority010Field = (initialRecords, records, naturalId, marcRecords, isLinked) => {
  const duplicate010FieldError = checkDuplicate010Field(marcRecords);

  if (duplicate010FieldError) {
    return duplicate010FieldError;
  }

  const field010 = records.find(field => field.tag === '010');

  if (field010) {
    const subfieldCount = getContentSubfieldValue(field010.content).$a?.length ?? 0;

    if (subfieldCount > 1) {
      return <FormattedMessage id="ui-quick-marc.record.error.010.$aOnlyOne" />;
    }
  }

  if (isLinked) {
    return validateLinkedAuthority010Field(field010, initialRecords, records, naturalId);
  }

  return undefined;
};

const validateMarcAuthorityRecord = (marcRecords, linksCount, initialRecords, naturalId) => {
  const correspondingHeadingTypeTags = new Set(CORRESPONDING_HEADING_TYPE_TAGS);

  const headingRecords = marcRecords.filter(recordRow => correspondingHeadingTypeTags.has(recordRow.tag));

  if (!headingRecords.length) {
    return <FormattedMessage id="ui-quick-marc.record.error.heading.empty" />;
  }

  if (headingRecords.length > 1) {
    return <FormattedMessage id="ui-quick-marc.record.error.heading.multiple" />;
  }

  if (linksCount) {
    const errorIn1xxField = validateMarcAuthority1xxField(initialRecords, marcRecords);

    if (errorIn1xxField) {
      return errorIn1xxField;
    }
  }

  const errorIn010Field = validateAuthority010Field(initialRecords, marcRecords, naturalId, marcRecords, linksCount);

  if (errorIn010Field) {
    return errorIn010Field;
  }

  return undefined;
};

export const validateMarcRecord = ({
  marcRecord,
  initialValues,
  marcType = MARC_TYPES.BIB,
  locations = [],
  linksCount,
  naturalId,
  linkableBibFields = [],
  linkingRules = [],
}) => {
  const marcRecords = marcRecord.records || [];
  const initialMarcRecords = initialValues.records;
  const recordLeader = marcRecords[0];

  const leaderError = validateLeader(marcRecord?.leader, recordLeader?.content, marcType);

  if (leaderError) {
    return leaderError;
  }

  const fixedFieldError = validateFixedField(marcRecords);

  if (fixedFieldError) {
    return fixedFieldError;
  }

  let validationResult;

  if (marcType === MARC_TYPES.BIB) {
    validationResult = validateMarcBibRecord(marcRecords, linkableBibFields, linkingRules);
  } else if (marcType === MARC_TYPES.HOLDINGS) {
    validationResult = validateMarcHoldingsRecord(marcRecords, locations);
  } else if (marcType === MARC_TYPES.AUTHORITY) {
    validationResult = validateMarcAuthorityRecord(marcRecords, linksCount, initialMarcRecords, naturalId);
  }

  if (validationResult) {
    return validationResult;
  }

  const tagError = validateRecordTag(marcRecords);

  if (tagError) {
    return tagError;
  }

  const subfieldError = validateSubfield(marcRecords);

  if (subfieldError) {
    return subfieldError;
  }

  return undefined;
};

export const deleteRecordByIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records.splice(index, 1);

  return records;
};

export const markDeletedRecordByIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...records[index],
    _isDeleted: true,
  };

  return records;
};

export const markLinkedRecordByIndex = (index, field, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...field,
    _isLinked: true,
  };

  return records;
};

export const markLinkedRecords = (fields) => {
  return fields.map(field => {
    if (field.linkDetails && !field._isLinked) {
      return {
        ...field,
        _isLinked: true,
      };
    }

    return field;
  });
};

export const markUnlinkedRecordByIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...records[index],
    _isLinked: false,
  };

  return records;
};

export const reorderRecords = (index, indexToSwitch, state) => {
  const records = [...state.formState.values.records];

  [records[index], records[indexToSwitch]] = [records[indexToSwitch], records[index]];

  return records;
};

export const restoreRecordAtIndex = (index, state) => {
  const records = [...state.formState.values.records];

  records[index] = {
    ...records[index],
    _isDeleted: false,
  };

  return records;
};

export const updateRecordAtIndex = (index, field, state) => {
  const records = [...state.formState.values.records];

  records[index] = field;

  return records;
};

export const removeDeletedRecords = (formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.filter(record => !record._isDeleted),
  };
};

export const removeEnteredDate = (formValues) => {
  const { records } = formValues;

  const fixedField = records.find(isFixedFieldRow);

  if (!fixedField) {
    return formValues;
  }

  delete fixedField.content[ENTERED_KEY];

  return formValues;
};

export const removeFieldsForDerive = (formValues) => {
  const { records } = formValues;

  const filteredRecords = records.filter(recordRow => {
    const idFields = [{ tag: '001' }, { tag: '005' }];

    if (isLastRecord(recordRow) || fieldMatchesDescription(recordRow, idFields)) {
      return false;
    }

    if (!recordRow.content) {
      return false;
    }

    return true;
  });

  return {
    ...omit(formValues, 'updateInfo'),
    records: filteredRecords,
  };
};

const checkIsEmptyContent = (field) => {
  if (typeof field.content === 'string') {
    return compact(field.content.split(' ')).every(content => /^\$[a-z0-9]?$/.test(content));
  }

  return false;
};

export const autopopulateIndicators = (formValues) => {
  const { records } = formValues;

  const recordsWithIndicators = records.reduce((acc, field) => {
    if (!field.indicators || field.indicators?.every(value => !!value)) {
      return [...acc, field];
    }

    const autopopulatedIndicators = field.indicators.map(indicator => indicator || '\\');

    return [...acc, {
      ...field,
      indicators: autopopulatedIndicators,
    }];
  }, []);

  return {
    ...formValues,
    records: recordsWithIndicators,
  };
};

export const autopopulateMaterialCharsField = (formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.map(field => {
      if (!isMaterialCharsRecord(field)) {
        return field;
      }

      const type = field.content?.Type;

      return {
        ...field,
        content: fillEmptyMaterialCharsFieldValues(type, field),
      };
    }),
  };
};

export const autopopulatePhysDescriptionField = (formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.map(field => {
      if (!isPhysDescriptionRecord(field)) {
        return field;
      }

      const type = field.content?.Category;

      return {
        ...field,
        content: fillEmptyPhysDescriptionFieldValues(type, field),
      };
    }),
  };
};

export const autopopulateFixedField = (formValues, marcType) => {
  const { records } = formValues;

  const leader = records.find(field => field.tag === LEADER_TAG);
  const type = leader.content[6];
  const blvl = leader.content[7];

  return {
    ...formValues,
    records: records.map(field => {
      if (!isFixedFieldRow(field)) {
        return field;
      }

      return {
        ...field,
        content: fillEmptyFixedFieldValues(marcType, type, blvl, field),
      };
    }),
  };
};

export const autopopulateSubfieldSection = (formValues, marcType = MARC_TYPES.BIB) => {
  const { records } = formValues;

  const recordsWithSubfields = records.reduce((acc, field) => {
    if (!field.content && field.indicators && field.indicators.every(value => !value)) {
      return acc;
    }

    if (!field.content && !checkIsInitialRecord(field)) {
      return acc;
    }

    if (checkIsEmptyContent(field)) {
      return acc;
    }

    if (fieldMatchesDescription(field, FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS[marcType])) {
      return [...acc, field];
    }

    const fieldContentWithoutLeadingSpaces = field.content.trimStart();

    const contentHasSubfield = /^\$[a-z0-9]*/.test(fieldContentWithoutLeadingSpaces);

    return [...acc, {
      ...field,
      content: contentHasSubfield
        ? fieldContentWithoutLeadingSpaces
        : `$a ${fieldContentWithoutLeadingSpaces}`,
    }];
  }, []);

  return {
    ...formValues,
    records: recordsWithSubfields,
  };
};

export const cleanBytesFields = (formValues, marcType) => {
  const { records } = formValues;

  const cleanedRecords = records.map((field) => {
    if (isString(field.content)) {
      return field;
    }

    let fieldConfigByType;

    if (isMaterialCharsRecord(field)) {
      fieldConfigByType = getMaterialCharsFieldConfig(field.content.Type);
    }

    if (isPhysDescriptionRecord(field)) {
      fieldConfigByType = getPhysDescriptionFieldConfig(field.content.Category);
    }

    if (isFixedFieldRow(field)) {
      fieldConfigByType = FixedFieldFactory
        .getFixedFieldByType(marcType, field.content.Type, field.content.BLvl)?.configFields ?? [];
    }

    const content = Object.entries(field.content).reduce((acc, [key, value]) => {
      if (isString(value)) {
        if (key === ELVL_BYTE) {
          return acc;
        }

        return {
          ...acc,
          [key]: value,
        };
      }

      if (isNumber(value)) {
        return {
          ...acc,
          [key]: `${value}`,
        };
      }

      const fieldConfig = fieldConfigByType.find(({ name }) => (name === key));

      if (fieldConfig) {
        const updatedValue = value.map(item => item || '\\');

        updatedValue.length = fieldConfig.bytes;

        return {
          ...acc,
          [key]: updatedValue,
        };
      }

      return acc;
    }, {});

    return {
      ...field,
      content,
    };
  });

  return {
    ...formValues,
    records: cleanedRecords,
  };
};

export const combineSplitFields = (formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.map(record => ({
      ...record,
      content: record._isLinked
        ? Object.values(record.subfieldGroups).reduce((content, subfield) => [content, subfield].join(' ').trim(), '')
        : record.content,
    })),
  };
};

export const getCorrespondingMarcTag = (records) => {
  const correspondingHeadingTypeTags = new Set(CORRESPONDING_HEADING_TYPE_TAGS);

  return records.find(recordRow => correspondingHeadingTypeTags.has(recordRow.tag))?.tag;
};

export const groupSubfields = (field, authorityControlledSubfields = []) => {
  const subfields = toPairs(getContentSubfieldValue(field.content));

  return subfields.reduce((groups, subfield) => {
    const isControlled = authorityControlledSubfields.includes(subfield[0].replace('$', ''));
    const isNum = /\$\d/.test(subfield[0]);
    const isZero = /\$0/.test(subfield[0]);
    const isNine = /\$9/.test(subfield[0]);

    const fieldContent = subfield[1].reduce((content, value) => [content, `${subfield[0]} ${value}`].join(' ').trimStart(), '');

    const formattedSubfield = {
      content: fieldContent,
      code: subfield[0],
    };

    if (isControlled) {
      groups.controlled = [groups.controlled, formattedSubfield.content].join(' ').trim();

      return groups;
    }

    if (!isControlled && !isNum) {
      groups[UNCONTROLLED_ALPHA] = [groups[UNCONTROLLED_ALPHA], formattedSubfield.content].join(' ').trim();

      return groups;
    }

    if (isZero) {
      groups.zeroSubfield = [groups.zeroSubfield, formattedSubfield.content].join(' ').trim();

      return groups;
    }

    if (isNine) {
      groups.nineSubfield = [groups.nineSubfield, formattedSubfield.content].join(' ').trim();

      return groups;
    }

    if (isNum) {
      groups[UNCONTROLLED_NUMBER] = [groups[UNCONTROLLED_NUMBER], formattedSubfield.content].join(' ').trim();

      return groups;
    }

    return groups;
  }, {
    controlled: '',
    [UNCONTROLLED_ALPHA]: '',
    zeroSubfield: '',
    nineSubfield: '',
    [UNCONTROLLED_NUMBER]: '',
  });
};

export const splitFields = (marcRecord, linkingRules) => {
  return {
    ...marcRecord,
    records: marcRecord.records.map(record => {
      if (!record._isLinked) {
        return record;
      }

      const linkingRule = linkingRules.find(rule => rule.id === record.linkDetails?.linkingRuleId);
      const controlledSubfields = getControlledSubfields(linkingRule);
      const subfieldGroups = groupSubfields(record, controlledSubfields);

      return {
        ...record,
        subfieldGroups,
      };
    }),
  };
};

export const is1XXUpdated = (initial, updated) => {
  const initial1xxRecords = initial.filter(rec => rec.tag[0] === '1');
  const updated1xxRecords = updated.filter(rec => rec.tag[0] === '1');

  const updated1xxArr = [];

  initial1xxRecords.forEach(recI => {
    const updatedRec = updated1xxRecords.find(recU => recU.id === recI.id);

    if (updatedRec && updatedRec.content !== recI.content) {
      updated1xxArr.push(updatedRec);
    }
  });

  return !!updated1xxArr.length;
};

export const are010Or1xxUpdated = (initial, updated) => {
  return is010$aUpdated(initial, updated) || is1XXUpdated(initial, updated);
};

const DELETE_EXCEPTION_ROWS = {
  [MARC_TYPES.AUTHORITY]: new Set([LEADER_TAG, '001', '003', '005', '008']),
  [MARC_TYPES.HOLDINGS]: new Set([LEADER_TAG, '001', '003', '004', '005', '008', '852']),
  [MARC_TYPES.BIB]: new Set([LEADER_TAG, '001', '003', '005', '008', '245']),
};

const is1XXField = (tag) => tag && tag[0] === '1';

export const hasDeleteException = (recordRow, marcType = MARC_TYPES.BIB, authority, initialValues, linksCount) => {
  const rows = DELETE_EXCEPTION_ROWS[marcType];

  if (marcType === MARC_TYPES.AUTHORITY) {
    if (
      is1XXField(recordRow.tag) ||
      (recordRow.tag === '010' && linksCount && is010LinkedToBibRecord(initialValues.records, authority.naturalId))
    ) {
      return true;
    }
  }

  return rows.has(recordRow.tag) || isLastRecord(recordRow);
};

const READ_ONLY_ROWS = new Set(['001', '005']);

const READ_ONLY_ROWS_FOR_DERIVE = new Set(['001', '005']);

const READ_ONLY_ROWS_FOR_HOLDINGS = new Set(['001', '004', '005']);

const READ_ONLY_ROWS_FOR_AUTHORITIES = new Set(['001', '005']);

export const isReadOnly = (
  recordRow,
  action = QUICK_MARC_ACTIONS.EDIT,
  marcType = MARC_TYPES.BIB,
) => {
  let rows;

  if (marcType === MARC_TYPES.BIB && recordRow._isLinked) {
    return true;
  }

  if (marcType === MARC_TYPES.BIB) {
    rows = action === QUICK_MARC_ACTIONS.DERIVE
      ? READ_ONLY_ROWS_FOR_DERIVE
      : READ_ONLY_ROWS;
  } else if (marcType === MARC_TYPES.HOLDINGS) {
    rows = READ_ONLY_ROWS_FOR_HOLDINGS;
  } else {
    rows = READ_ONLY_ROWS_FOR_AUTHORITIES;
  }

  return rows.has(recordRow.tag) || isLastRecord(recordRow);
};

const addLeaderFieldAndIdToRecords = (marcRecordResponse) => ({
  ...marcRecordResponse,
  fields: undefined,
  records: [
    {
      tag: LEADER_TAG,
      content: marcRecordResponse.leader,
      id: LEADER_TAG,
    },
    ...marcRecordResponse.fields.map(record => ({
      ...record,
      id: uuidv4(),
    })),
  ],
});

export const dehydrateMarcRecordResponse = (marcRecordResponse, marcType) => (
  flow(
    addLeaderFieldAndIdToRecords,
    marcRecord => autopopulateFixedField(marcRecord, marcType),
    autopopulatePhysDescriptionField,
    autopopulateMaterialCharsField,
  )(marcRecordResponse)
);

export const hydrateForLinkSuggestions = (marcRecord, fields) => ({
  leader: marcRecord.records[0].content,
  fields: fields.map(record => ({
    tag: record.tag,
    content: record.content,
  })),
  marcFormat: marcRecord.marcFormat,
  _actionType: 'view',
});

const CONSORTIUM_PREFIX = 'CONSORTIUM-';

export const checkIfSharedInstance = (stripes, instance) => {
  return instance.source?.includes(CONSORTIUM_PREFIX) || checkIfUserInCentralTenant(stripes);
};

export const getHeaders = (tenant, token, locale, method = 'GET') => {
  // This is taken from stripes-connect/OkapiResource.js
  const headers = {
    POST: {
      Accept: 'application/json',
    },
    DELETE: {
      Accept: 'text/plain',
    },
    GET: {
      Accept: 'application/json',
    },
    PUT: {
      Accept: 'text/plain',
    },
  };

  return {
    ...headers[method],
    'Accept-Language': locale,
    'Content-Type': 'application/json',
    'X-Okapi-Tenant': tenant,
    ...(token && { 'X-Okapi-Token': token }),
  };
};

export const changeTenantHeader = (ky, tenantId) => {
  return ky.extend({
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set(OKAPI_TENANT_HEADER, tenantId);
        },
      ],
    },
  });
};

export const applyCentralTenantInHeaders = (location, stripes, marcType, cb = () => true) => {
  const searchParams = new URLSearchParams(location.search);
  const isSharedRecord = searchParams.get('shared') === 'true';

  return (
    isSharedRecord
    && [MARC_TYPES.BIB].includes(marcType)
    && cb()
    && checkIfUserInMemberTenant(stripes)
  );
};
