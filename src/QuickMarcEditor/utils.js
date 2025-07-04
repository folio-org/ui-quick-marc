/* eslint-disable max-lines */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';
import omit from 'lodash/omit';
import compact from 'lodash/compact';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import flatten from 'lodash/flatten';
import flow from 'lodash/flow';
import assignWith from 'lodash/assignWith';

import {
  checkIfUserInMemberTenant,
} from '@folio/stripes/core';

import {
  LEADER_TAG,
  FIELDS_TO_CLEAR_FOR_DERIVE,
  FIELDS_TAGS_WITHOUT_DEFAULT_SUBFIELDS,
  QUICK_MARC_ACTIONS,
  CREATE_HOLDINGS_RECORD_DEFAULT_FIELD_TAGS,
  HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
  CORRESPONDING_HEADING_TYPE_TAGS,
  ELVL_BYTE,
  CREATE_BIB_RECORD_DEFAULT_FIELD_TAGS,
  BIB_FIXED_FIELD_DEFAULT_TYPE,
  BIB_FIXED_FIELD_DEFAULT_BLVL,
  ENTERED_KEY,
  CREATE_AUTHORITY_RECORD_DEFAULT_FIELD_TAGS,
  UNCONTROLLED_ALPHA,
  UNCONTROLLED_NUMBER,
  AUTHORITY_FIXED_FIELD_DEFAULT_TYPE,
} from './constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import { SUBFIELD_TYPES } from './QuickMarcEditorRows/BytesField';
import getMaterialCharsFieldConfig from './QuickMarcEditorRows/MaterialCharsField/getMaterialCharsFieldConfig';
import getPhysDescriptionFieldConfig from './QuickMarcEditorRows/PhysDescriptionField/getPhysDescriptionFieldConfig';
import { FixedFieldFactory } from './QuickMarcEditorRows/FixedField';
import { MarcFieldContent } from '../common';
import {
  MARC_TYPES,
  ERROR_TYPES,
  EXTERNAL_INSTANCE_APIS,
  SOURCES,
} from '../common/constants';
import { leaderConfig } from './QuickMarcEditorRows/LeaderField/leaderConfig';

export const isLastRecord = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[1] === 'f'
  );
};

export const isLeaderRow = recordRow => recordRow.tag === LEADER_TAG;
export const isControlNumberRow = recordRow => recordRow.tag === '001';
export const isFixedFieldRow = recordRow => recordRow.tag === '008';
export const isMaterialCharsRecord = recordRow => recordRow.tag === '006';
export const isPhysDescriptionRecord = recordRow => recordRow.tag === '007';
export const isLocationRow = (recordRow, marcType) => marcType === MARC_TYPES.HOLDINGS && recordRow.tag === '852';
export const isContentRow = (recordRow, marcType) => {
  return !(isLocationRow(recordRow, marcType)
    || isLeaderRow(recordRow)
    || isFixedFieldRow(recordRow)
    || isMaterialCharsRecord(recordRow)
    || isPhysDescriptionRecord(recordRow)
    || isControlNumberRow(recordRow));
};

// returns an object with subfields values. order of subfields is not kept
// '$a valueA1 $a value A2 $b valueB' -> { '$a': ['valueA1', 'valueA2'], '$b': ['valueB'] }

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

export const is010LinkedToBibRecord = (initialRecords, naturalId, linksCount) => {
  if (!linksCount) {
    return false;
  }

  const initial010Field = initialRecords.find(record => record.tag === '010');

  if (!initial010Field) {
    return false;
  }

  const initial010$a = getContentSubfieldValue(initial010Field.content).$a?.[0];

  return naturalId === initial010$a?.replaceAll(' ', '');
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
      jsonError = await httpError.json?.() || httpError;
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

  return Promise.all([instancePromise, marcPromise]).then(([{ _version }, derivedRecord]) => {
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
    } else if (fieldConfig.type === SUBFIELD_TYPES.SELECT) {
      return { ...acc, [fieldConfig.name]: new Array(fieldConfig.length).fill('\\').join('') };
    } else if (fieldConfig.type === SUBFIELD_TYPES.SELECTS) {
      return { ...acc, [fieldConfig.name]: new Array(fieldConfig.bytes).fill('\\') };
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

export const fillEmptyFixedFieldValues = (marcType, marcSpec, type, blvl, field) => {
  const fieldConfigByType = FixedFieldFactory
    .getConfigFixedField(
      marcSpec,
      type,
      blvl,
    )?.fields ?? [];

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

const getCreateBibMarcRecordDefaultFields = (instanceRecord, fixedFieldSpec) => {
  const contentMap = {
    '001': instanceRecord.hrid,
    '008': fillEmptyFixedFieldValues(MARC_TYPES.BIB, fixedFieldSpec, BIB_FIXED_FIELD_DEFAULT_TYPE, BIB_FIXED_FIELD_DEFAULT_BLVL),
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

const getCreateAuthorityMarcRecordDefaultFields = (instanceRecord, fixedFieldSpec) => {
  const contentMap = {
    '001': instanceRecord.hrid,
    '008': fillEmptyFixedFieldValues(MARC_TYPES.AUTHORITY, fixedFieldSpec, AUTHORITY_FIXED_FIELD_DEFAULT_TYPE),
    '999': '',
  };

  const indicatorMap = {
    '999': ['f', 'f'],
  };

  return getCreateMarcRecordDefaultFields(contentMap, indicatorMap, CREATE_AUTHORITY_RECORD_DEFAULT_FIELD_TAGS);
};

const getDefaultLeaderContent = (marcType) => {
  return leaderConfig[marcType].reduce((acc, fieldConfig) => {
    acc[fieldConfig.name] = fieldConfig.defaultValue;

    return acc;
  }, {});
};

export const getCreateHoldingsMarcRecordResponse = (instanceResponse) => {
  const instanceId = instanceResponse.id;
  const leader = getDefaultLeaderContent(MARC_TYPES.HOLDINGS);

  return {
    externalId: instanceId,
    leader,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: leader,
        id: LEADER_TAG,
      },
      ...getCreateHoldingsMarcRecordDefaultFields(instanceResponse),
    ],
    parsedRecordDtoId: instanceId,
  };
};

export const getCreateBibMarcRecordResponse = (instanceResponse, fixedFieldSpec) => {
  const instanceId = '00000000-0000-0000-0000-000000000000'; // For create we need to send any UUID
  const leader = getDefaultLeaderContent(MARC_TYPES.BIB);

  return {
    externalId: instanceId,
    leader,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: leader,
        id: LEADER_TAG,
      },
      ...getCreateBibMarcRecordDefaultFields(instanceResponse, fixedFieldSpec),
    ],
    parsedRecordDtoId: instanceId,
  };
};

export const getCreateAuthorityMarcRecordResponse = (instanceResponse, fixedFieldSpec) => {
  const instanceId = '00000000-0000-0000-0000-000000000000'; // For create we need to send any UUID
  const leader = getDefaultLeaderContent(MARC_TYPES.AUTHORITY);

  return {
    externalId: instanceId,
    leader,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: leader,
        id: LEADER_TAG,
      },
      ...getCreateAuthorityMarcRecordDefaultFields(instanceResponse, fixedFieldSpec),
    ],
    parsedRecordDtoId: instanceId,
  };
};

export const fieldMatchesDescription = (field, descriptionArray) => {
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

const getEmptyContent = (field) => {
  if (['010', '019', '035'].includes(field.tag)) {
    return '$a';
  }

  return '';
};

const removeMarcRecordFieldContentForDerive = (marcRecord, marcType) => {
  return {
    ...marcRecord,
    records: marcRecord.records.map((field) => (fieldMatchesDescription(field, FIELDS_TO_CLEAR_FOR_DERIVE[marcType])
      ? {
        ...field,
        content: getEmptyContent(field),
      }
      : field
    )),
  };
};

const moveIdentifierFieldsAfterLeader = marcRecord => {
  return {
    ...marcRecord,
    records: [
      marcRecord.records.find(field => field.tag === LEADER_TAG),
      ...marcRecord.records.filter(field => field.tag === '001'),
      ...marcRecord.records.filter(field => field.tag === '005'),
      ...marcRecord.records.filter(field => ![LEADER_TAG, '001', '005'].includes(field.tag)),
    ],
  };
};

export const formatMarcRecordByQuickMarcAction = (marcRecord, action, marcType) => {
  if (action === QUICK_MARC_ACTIONS.DERIVE) {
    return {
      ...flow(
        (formValues) => removeMarcRecordFieldContentForDerive(formValues, marcType),
        moveIdentifierFieldsAfterLeader,
      )(marcRecord),
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

export const convertLeaderToObject = (marcType, leader) => {
  let start = 0;

  return leaderConfig[marcType].reduce((acc, fieldConfig) => {
    const boxValueLength = fieldConfig.defaultValue.length;
    const end = start + boxValueLength;

    acc[fieldConfig.name] = leader.substring(start, end);

    start += boxValueLength;

    return acc;
  }, {});
};

export const convertLeaderToString = (marcType, leaderField) => {
  if (!leaderField || !marcType) {
    return '';
  }

  if (typeof leaderField.content === 'string') {
    return leaderField.content;
  }

  return leaderConfig[marcType].reduce((acc, fieldConfig) => {
    const value = leaderField.content[fieldConfig.name] || fieldConfig.defaultValue;

    return `${acc}${value}`;
  }, '');
};

export const getLeaderPositions = (marcType, records) => {
  const leaderField = records.find(field => field.tag === LEADER_TAG);
  const leaderContent = convertLeaderToString(marcType, leaderField);

  return {
    type: leaderContent[6] || '',
    position7: leaderContent[7] || '',
  };
};

export const hydrateMarcRecord = marcRecord => {
  const leader = marcRecord.records[0];

  return ({
    ...marcRecord,
    leader: leader.content,
    fields: marcRecord.records.slice(1).map(record => ({
      tag: record.tag,
      content: record.content,
      indicators: record.indicators,
      linkDetails: record.linkDetails,
    })),
    records: undefined,
  });
};

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

export const getLocationValue = (value) => {
  const fieldContent = new MarcFieldContent(value);

  return fieldContent.$b?.[0] || '';
};

export const checkIsEmptyContent = (field) => {
  if (typeof field.content === 'string') {
    return compact(field.content.split(' ')).every(content => /^\$[a-z0-9]?$/.test(content));
  }

  return false;
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

export const isRecordForManualLinking = (
  stripes,
  marcType,
  linkableBibFields,
  tag,
  isRequestToCentralTenantFromMember,
  onCheckCentralTenantPerm,
) => {
  const permission = 'ui-quick-marc.quick-marc-authority-records.link-unlink.execute';

  return (
    marcType === MARC_TYPES.BIB
    && (isRequestToCentralTenantFromMember ? onCheckCentralTenantPerm(permission) : stripes.hasPerm(permission))
    && linkableBibFields.includes(tag)
  );
};

export const isRecordForAutoLinking = (field, autoLinkableBibFields) => (
  !field._isDeleted
  && !field._isLinked
  && autoLinkableBibFields.includes(field.tag)
  && getContentSubfieldValue(field.content).$0?.[0]
);

export const isFieldLinked = (field) => Boolean(field.linkDetails?.linkingRuleId);

export const recordHasLinks = (fields) => fields.some(isFieldLinked);

export const getControlledSubfields = (linkingRule) => {
  // include transformed subfields into list of controlled subfields
  return linkingRule?.authoritySubfields?.map(subfield => {
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

export const getIsSubfieldRemoved = (content, subfield) => {
  const contentSubfieldValue = getContentSubfieldValue(content);

  return !(subfield in contentSubfieldValue) || !contentSubfieldValue[subfield][0];
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

export const formatLeaderForSubmit = (marcType, formValues) => {
  const { records } = formValues;

  return {
    ...formValues,
    leader: convertLeaderToString(marcType, records.find(isLeaderRow)),
    records: formValues.records.map(record => {
      if (!isLeaderRow(record)) {
        return record;
      }

      return {
        ...record,
        content: convertLeaderToString(marcType, record),
      };
    }),
  };
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

export const removeRowsWithoutContent = (formValues) => {
  return {
    ...formValues,
    records: formValues.records.filter(recordRow => recordRow.content),
  };
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

export const autopopulateFixedField = (formValues, marcType, fixedFieldSpec) => {
  const { records } = formValues;

  return {
    ...formValues,
    records: records.map(field => {
      if (!isFixedFieldRow(field)) {
        return field;
      }

      const { type, position7 } = getLeaderPositions(marcType, records);

      return {
        ...field,
        content: fillEmptyFixedFieldValues(marcType, fixedFieldSpec, type, position7, field),
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

export const cleanBytesFields = (formValues, marcSpec, marcType) => {
  const { records } = formValues;

  const cleanedRecords = records.map((field) => {
    if (isString(field.content) || field.tag === LEADER_TAG) {
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
      const { type, position7 } = getLeaderPositions(marcType, records);

      fieldConfigByType = FixedFieldFactory
        .getConfigFixedField(marcSpec, type, position7)?.fields ?? [];
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
  const subfields = new MarcFieldContent(field.content);

  return subfields.reduce((groups, subfield) => {
    const isControlled = authorityControlledSubfields.includes(subfield.code.replace('$', ''));
    const isNum = /\$\d/.test(subfield.code);
    const isZero = /\$0/.test(subfield.code);
    const isNine = /\$9/.test(subfield.code);

    const subfieldCodeAndValue = `${subfield.code} ${subfield.value}`;

    if (isControlled) {
      groups.controlled = [groups.controlled, subfieldCodeAndValue].join(' ').trim();

      return groups;
    }

    if (!isControlled && !isNum) {
      groups[UNCONTROLLED_ALPHA] = [groups[UNCONTROLLED_ALPHA], subfieldCodeAndValue].join(' ').trim();

      return groups;
    }

    if (isZero) {
      groups.zeroSubfield = [groups.zeroSubfield, subfieldCodeAndValue].join(' ').trim();

      return groups;
    }

    if (isNine) {
      groups.nineSubfield = [groups.nineSubfield, subfieldCodeAndValue].join(' ').trim();

      return groups;
    }

    if (isNum) {
      groups[UNCONTROLLED_NUMBER] = [groups[UNCONTROLLED_NUMBER], subfieldCodeAndValue].join(' ').trim();

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
      (recordRow.tag === '010' && is010LinkedToBibRecord(initialValues.records, authority.naturalId, linksCount))
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

const addLeaderFieldAndIdToRecords = (marcRecordResponse, fieldIds) => {
  const marcType = marcRecordResponse.marcFormat.toLowerCase();
  const leader = convertLeaderToObject(marcType, marcRecordResponse.leader);

  return {
    ...marcRecordResponse,
    leader,
    fields: undefined,
    records: [
      {
        tag: LEADER_TAG,
        content: leader,
        id: LEADER_TAG,
      },
      ...marcRecordResponse.fields.map((record, index) => ({
        ...record,
        id: fieldIds?.[index] || uuidv4(),
      })),
    ],
  };
};

export const dehydrateMarcRecordResponse = (marcRecordResponse, marcType, fixedFieldSpec, fieldIds) => (
  flow(
    marcRecord => addLeaderFieldAndIdToRecords(marcRecord, fieldIds),
    marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
    autopopulatePhysDescriptionField,
    autopopulateMaterialCharsField,
  )(marcRecordResponse)
);

export const hydrateForLinkSuggestions = (marcRecord, marcType, fields) => {
  return ({
    leader: convertLeaderToString(marcType, marcRecord.records.find(isLeaderRow)),
    fields: fields.map(record => ({
      tag: record.tag,
      content: record.content,
    })),
    marcFormat: marcRecord.marcFormat,
    _actionType: 'view',
  });
};

export const applyCentralTenantInHeaders = (isShared, stripes, marcType) => {
  return (
    isShared
    && [MARC_TYPES.BIB, MARC_TYPES.AUTHORITY].includes(marcType)
    && checkIfUserInMemberTenant(stripes)
  );
};

export const isFolioSourceFileNotSelected = ({ selectedSourceFile }) => {
  return selectedSourceFile?.source !== SOURCES.FOLIO;
};

export const joinErrors = (errorsA, errorsB) => {
  return assignWith({}, errorsA, errorsB, (objValue = [], srcValue = []) => objValue.concat(srcValue));
};

export const isDiacritic = (char) => {
  const specialDiactrics = 'łŁøß';

  if (specialDiactrics.includes(char)) return true;

  return char.normalize('NFD') !== char;
};

export const getVisibleNonSelectable008Subfields = (fixedFieldType) => {
  if (!fixedFieldType) {
    return [];
  }

  return fixedFieldType.items
    .filter(field => !field.readOnly)
    .filter(field => !field.isArray);
};

export const getFixedFieldStringPositions = (type, subtype, field, fixedFieldSpec) => {
  if (isFixedFieldRow(field)) {
    const fixedFieldType = FixedFieldFactory.getFixedFieldType(fixedFieldSpec, type, subtype);
    const nonSelectableSubfields = getVisibleNonSelectable008Subfields(fixedFieldType);

    return nonSelectableSubfields;
  }

  if (isMaterialCharsRecord(field)) {
    const materialCharsConfig = getMaterialCharsFieldConfig(field.content.Type);

    return materialCharsConfig.filter(item => item.type === SUBFIELD_TYPES.STRING);
  }

  if (isPhysDescriptionRecord(field)) {
    const materialCharsConfig = getPhysDescriptionFieldConfig(field.content.Category);

    return materialCharsConfig.filter(item => item.type === SUBFIELD_TYPES.STRING);
  }

  return [];
};

export const getFieldIds = (formValues) => {
  return formValues.records
    .slice(1)
    .filter(field => !field._isDeleted)
    .map(field => field.id);
};
