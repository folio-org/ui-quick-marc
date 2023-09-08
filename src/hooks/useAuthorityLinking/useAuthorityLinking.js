import {
  useCallback,
  useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import {
  checkIfUserInMemberTenant,
  useStripes,
} from '@folio/stripes/core';

import {
  useAuthoritySourceFiles,
  useAuthorityLinkingRules,
  useLinkSuggestions,
} from '../../queries';

import {
  getContentSubfieldValue,
  groupSubfields,
  getControlledSubfields,
  isRecordForAutoLinking,
  hydrateForLinkSuggestions,
  recordHasLinks,
  isFieldLinked,
  checkIfRecordWithCentralAndMemberSuggestions,
  applyCentralTenantInHeaders,
} from '../../QuickMarcEditor/utils';
import {
  AUTOLINKING_STATUSES,
  AUTOLINKING_ERROR_CODES,
  UNCONTROLLED_ALPHA,
  UNCONTROLLED_NUMBER,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';

const joinSubfields = (subfields) => Object.keys(subfields).reduce((content, key) => {
  const subfield = subfields[key].join(` ${key} `);

  return [content, `${key} ${subfield}`].join(' ');
}, '').trim();

const formatSubfieldCode = (code) => { return code.startsWith('$') ? code : `$${code}`; };

const useAuthorityLinking = ({ tenantId, marcType, action } = {}) => {
  const stripes = useStripes();
  const location = useLocation();
  const { search } = location;

  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const isMemberTenant = checkIfUserInMemberTenant(stripes);
  const isCentralTenantInHeaders = applyCentralTenantInHeaders(location, stripes, marcType, () => (
    action === QUICK_MARC_ACTIONS.EDIT
  ));

  // tenantId for linking functionality must be with the member tenant id when user derives shared record
  const _tenantId = tenantId || (isCentralTenantInHeaders && centralTenantId) || '';

  const { sourceFiles } = useAuthoritySourceFiles({ tenantId: _tenantId });
  const { linkingRules } = useAuthorityLinkingRules({ tenantId: _tenantId });

  const {
    fetchLinkSuggestions: fetchMemberLinkSuggestions,
    isLoading: isLoadingLinkSuggestions,
  } = useLinkSuggestions({ tenantId: _tenantId });
  const {
    fetchLinkSuggestions: fetchCentralLinkSuggestions,
  } = useLinkSuggestions({ tenantId: centralTenantId });

  const linkableBibFields = useMemo(() => linkingRules.map(rule => rule.bibField), [linkingRules]);
  const autoLinkableBibFields = useMemo(() => {
    return linkingRules.filter(rule => rule.autoLinkingEnabled).map(rule => rule.bibField);
  }, [linkingRules]);
  const autoLinkingEnabled = linkingRules.some(rule => rule.autoLinkingEnabled);

  const findLinkingRule = useCallback((bibTag, authorityTag) => {
    return linkingRules.find(rule => rule.bibField === bibTag && rule.authorityField === authorityTag);
  }, [linkingRules]);

  const copySubfieldsFromAuthority = useCallback((bibSubfields, authField, bibTag) => {
    const linkingRule = findLinkingRule(bibTag, authField.tag);
    const authSubfields = getContentSubfieldValue(authField.content);

    linkingRule.authoritySubfields.forEach(subfieldCode => {
      const subfieldModification = linkingRule.subfieldModifications?.find(mod => mod.source === subfieldCode);

      if (subfieldModification) {
        bibSubfields[formatSubfieldCode(subfieldModification.target)] = authSubfields[formatSubfieldCode(subfieldCode)];
      } else if (authSubfields[formatSubfieldCode(subfieldCode)]?.[0]) {
        bibSubfields[formatSubfieldCode(subfieldCode)] = authSubfields[formatSubfieldCode(subfieldCode)];
      } else {
        delete bibSubfields[formatSubfieldCode(subfieldCode)];
      }
    });

    return bibSubfields;
  }, [findLinkingRule]);

  const getLinkableAuthorityField = useCallback((authoritySource, bibField) => {
    const linkableTags = linkingRules.filter(rule => rule.bibField === bibField.tag).map(rule => rule.authorityField);

    // one bib field may be linked to one of several authority fields so we need to check all available linking options
    const linkableField = authoritySource.fields.find(field => linkableTags.includes(field.tag));

    return linkableField;
  }, [linkingRules]);

  const validateLinkage = useCallback((linkedAuthorityField, bibField) => {
    if (!linkedAuthorityField) {
      return 'ui-quick-marc.record.link.validation.invalidHeading';
    }

    const authoritySubfields = getContentSubfieldValue(linkedAuthorityField.content);

    const linkingRule = findLinkingRule(bibField.tag, linkedAuthorityField.tag);

    const failedExistence = !get(linkingRule, 'validation.existence', []).every(rule => {
      const ruleSubfield = Object.keys(rule)[0];
      const subfieldShouldExist = rule[ruleSubfield];

      // should be valid when subfield exists and rule requires it
      // and not valid when subfield doesn't exist and rule requires it to be empty
      const isValid = Boolean(authoritySubfields[formatSubfieldCode(ruleSubfield)]?.[0]) === subfieldShouldExist;

      return isValid;
    });

    if (failedExistence) {
      return 'ui-quick-marc.record.link.validation.invalidHeading';
    }

    return null;
  }, [findLinkingRule]);

  const updateBibFieldWithLinkingData = useCallback((bibField, linkedAuthorityField, authorityRecord) => {
    const bibSubfields = getContentSubfieldValue(bibField.content);
    const sourceFile = sourceFiles.find(file => file.id === authorityRecord.sourceFileId);

    let newZeroSubfield = '';

    if (sourceFile?.baseUrl) {
      newZeroSubfield = [sourceFile?.baseUrl, authorityRecord.naturalId].join('').trim();
    } else {
      newZeroSubfield = authorityRecord.naturalId;
    }

    bibSubfields.$0 = [newZeroSubfield];

    copySubfieldsFromAuthority(bibSubfields, linkedAuthorityField, bibField.tag);

    bibSubfields.$9 = [authorityRecord.id];
    bibField.prevContent = bibField.content;
    bibField.content = joinSubfields(bibSubfields);
  }, [copySubfieldsFromAuthority, sourceFiles]);

  const getSubfieldGroups = useCallback((field, suggestedField) => {
    const linkingRule = linkingRules.find(rule => rule.id === suggestedField.linkDetails?.linkingRuleId);
    const controlledSubfields = getControlledSubfields(linkingRule);

    // take controlled subfields from the suggested field and uncontrolled ones from the current field
    return {
      ...groupSubfields(suggestedField, controlledSubfields),
      ...pick(groupSubfields(field, controlledSubfields), UNCONTROLLED_ALPHA, UNCONTROLLED_NUMBER),
    };
  }, [linkingRules]);

  const updateLinkedField = useCallback((field) => {
    const uncontrolledNumberSubfields = getContentSubfieldValue(field.subfieldGroups?.[UNCONTROLLED_NUMBER]);
    const uncontrolledAlphaSubfields = getContentSubfieldValue(field.subfieldGroups?.[UNCONTROLLED_ALPHA]);

    const uncontrolledNumber = uncontrolledNumberSubfields.$9?.[0]
      ? joinSubfields(omit(uncontrolledNumberSubfields, '$9'))
      : field.subfieldGroups[UNCONTROLLED_NUMBER];

    const uncontrolledAlpha = uncontrolledAlphaSubfields.$9?.[0]
      ? joinSubfields(omit(uncontrolledAlphaSubfields, '$9'))
      : field.subfieldGroups[UNCONTROLLED_ALPHA];

    return {
      ...field,
      subfieldGroups: {
        ...field.subfieldGroups,
        [UNCONTROLLED_NUMBER]: uncontrolledNumber,
        [UNCONTROLLED_ALPHA]: uncontrolledAlpha,
      },
    };
  }, []);

  const updateAutoLinkableField = useCallback((field, suggestedField) => {
    if (
      suggestedField.linkDetails?.status === AUTOLINKING_STATUSES.ERROR
      && getContentSubfieldValue(field.content).$9?.[0]
    ) {
      const subfields = getContentSubfieldValue(field.content);

      return {
        ...field,
        content: joinSubfields(omit(subfields, '$9')),
      };
    }

    if (
      suggestedField.linkDetails
      && suggestedField.linkDetails.status !== AUTOLINKING_STATUSES.ERROR
    ) {
      const subfieldGroups = getSubfieldGroups(field, suggestedField);

      return {
        ...field,
        ...suggestedField,
        content: Object.values(subfieldGroups).filter(Boolean).join(' '),
        subfieldGroups,
        prevContent: field.content,
      };
    }

    return field;
  }, [getSubfieldGroups]);

  const autoLinkAuthority = useCallback((fields, suggestedFields) => {
    let suggestedFieldIndex = 0;

    return fields.map(field => {
      if (field._isLinked && !field._isDeleted) {
        return updateLinkedField(field);
      }

      if (isRecordForAutoLinking(field, autoLinkableBibFields)) {
        const suggestedField = suggestedFields[suggestedFieldIndex];

        suggestedFieldIndex += 1;

        return updateAutoLinkableField(field, suggestedField);
      }

      return field;
    });
  }, [autoLinkableBibFields, updateAutoLinkableField, updateLinkedField]);

  const linkAuthority = useCallback((authority, authoritySource, field) => {
    const linkedAuthorityField = getLinkableAuthorityField(authoritySource, field);

    const validationError = validateLinkage(linkedAuthorityField, field);

    if (validationError) {
      throw new Error(validationError);
    }

    const linkingRule = findLinkingRule(field.tag, linkedAuthorityField.tag);

    updateBibFieldWithLinkingData(field, linkedAuthorityField, authority);

    const controlledSubfields = getControlledSubfields(linkingRule);

    return {
      ...field,
      linkDetails: {
        authorityNaturalId: authority.naturalId,
        authorityId: authority.id,
        linkingRuleId: linkingRule.id,
      },
      subfieldGroups: groupSubfields(field, controlledSubfields),
    };
  }, [
    updateBibFieldWithLinkingData,
    getLinkableAuthorityField,
    validateLinkage,
    findLinkingRule,
  ]);

  const unlinkAuthority = useCallback((field) => {
    const bibSubfields = getContentSubfieldValue(field.content);

    delete bibSubfields.$9;
    delete field.linkDetails;
    delete field.subfieldGroups;

    field.content = field.prevContent ?? joinSubfields(bibSubfields);
    delete field.prevContent;

    return {
      ...field,
    };
  }, []);

  const actualizeLinks = useCallback(async (formValues) => {
    if (!recordHasLinks(formValues.records)) {
      return formValues;
    }

    const linkedFields = formValues.records.filter(isFieldLinked);
    const payload = hydrateForLinkSuggestions(formValues, linkedFields);
    const isRecordWithCentralAndMemberSuggestions = checkIfRecordWithCentralAndMemberSuggestions({
      search,
      marcType,
      isMemberTenant,
      action,
    });

    const requestArgs = {
      body: payload,
      isSearchByAuthorityId: true,
      ignoreAutoLinkingEnabled: true,
    };

    const memberLinkSuggestionsPromise = fetchMemberLinkSuggestions(requestArgs);
    const centralLinkSuggestionsPromise = isRecordWithCentralAndMemberSuggestions
      ? fetchCentralLinkSuggestions(requestArgs)
      : Promise.resolve({ fields: [] });

    const [
      { fields: suggestedFields },
      { fields: suggestedFieldsFromCentralTenant },
    ] = await Promise.all([
      memberLinkSuggestionsPromise,
      centralLinkSuggestionsPromise,
    ]);

    const actualizedLinks = formValues.records.map(field => {
      if (!isFieldLinked(field)) {
        return field;
      }

      const suggestedField = suggestedFields.shift();
      const suggestedFieldFromCentralTenant = suggestedFieldsFromCentralTenant.shift();

      const getActualizedField = (proposedField) => {
        const subfieldGroups = getSubfieldGroups(field, proposedField);

        return {
          ...field,
          ...proposedField,
          content: Object.values(subfieldGroups).filter(Boolean).join(' '),
        };
      };

      if (suggestedField.linkDetails?.status === AUTOLINKING_STATUSES.ERROR) {
        const shouldTakeSuggestedFieldFromCentralTenant = (
          isRecordWithCentralAndMemberSuggestions
          && suggestedField.linkDetails.errorCause === AUTOLINKING_ERROR_CODES.AUTHORITY_NOT_FOUND
          && suggestedFieldFromCentralTenant?.linkDetails.status !== AUTOLINKING_STATUSES.ERROR
          && suggestedField.tag === suggestedFieldFromCentralTenant?.tag
          && suggestedField.content === suggestedFieldFromCentralTenant?.content
        );

        if (shouldTakeSuggestedFieldFromCentralTenant) {
          return getActualizedField(suggestedFieldFromCentralTenant);
        }

        return unlinkAuthority(field);
      }

      return getActualizedField(suggestedField);
    });

    return {
      ...formValues,
      records: actualizedLinks,
    };
  }, [
    fetchMemberLinkSuggestions,
    fetchCentralLinkSuggestions,
    getSubfieldGroups,
    unlinkAuthority,
    isMemberTenant,
    search,
    marcType,
    action,
  ]);

  return {
    linkAuthority,
    unlinkAuthority,
    linkableBibFields,
    sourceFiles,
    autoLinkingEnabled,
    autoLinkableBibFields,
    autoLinkAuthority,
    actualizeLinks,
    linkingRules,
    fetchLinkSuggestions: fetchMemberLinkSuggestions,
    isLoadingLinkSuggestions,
  };
};

export default useAuthorityLinking;
