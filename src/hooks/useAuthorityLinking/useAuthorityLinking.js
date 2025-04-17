import {
  useCallback,
  useContext,
  useMemo,
} from 'react';
import get from 'lodash/get';
import pick from 'lodash/pick';

import { useStripes } from '@folio/stripes/core';
import { useAuthorityLinkingRules } from '@folio/stripes-marc-components';

import {
  useAuthoritySourceFiles,
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
  applyCentralTenantInHeaders,
} from '../../QuickMarcEditor/utils';
import { MarcFieldContent } from '../../common';
import {
  AUTOLINKING_STATUSES,
  UNCONTROLLED_ALPHA,
  UNCONTROLLED_NUMBER,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';
import { QuickMarcContext } from '../../contexts';

const formatSubfieldCode = (code) => { return code.startsWith('$') ? code : `$${code}`; };

const useAuthorityLinking = ({ tenantId, marcType, action } = {}) => {
  const stripes = useStripes();
  const { isSharedRef } = useContext(QuickMarcContext);

  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const isCentralTenantInHeaders = applyCentralTenantInHeaders(isSharedRef.current, stripes, marcType)
    && action === QUICK_MARC_ACTIONS.EDIT;

  // tenantId for linking functionality must be with the member tenant id when user derives shared record
  const _tenantId = tenantId || (isCentralTenantInHeaders && centralTenantId) || null;

  const { sourceFiles } = useAuthoritySourceFiles({ tenantId: _tenantId });
  const { linkingRules } = useAuthorityLinkingRules({ tenantId: _tenantId });

  const {
    fetchLinkSuggestions,
    isLoading: isLoadingLinkSuggestions,
  } = useLinkSuggestions({ tenantId: _tenantId });

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
    const authSubfields = new MarcFieldContent(authField.content);
    const subfieldsAfterLinking = new MarcFieldContent();

    const isSubfieldControlled = (subfieldLetter) => {
      return linkingRule.authoritySubfields.includes(subfieldLetter)
        || linkingRule.subfieldModifications.find(mod => mod.target === subfieldLetter);
    };

    /*
      Rules for linking fields are:
      1. Iterate over authority subfields.
      2. If a subfield is not controlled - don't add it to linked field
      3. If a subfield is modified - apply the modification rule and add it to linked field
      4. If a subfield is a target of modification - don't add it to linked field
      5. If a subfield is not modified - add it to linked field
      6. Iterate over bib subfields
      7. If a subfield is controlled - don't add it to linked field
      8. If a subfield is uncontrolled - add it to linked field
    */

    authSubfields.forEach(subfield => {
      const subfieldLetter = subfield.code.replace('$', '');
      const isControlled = isSubfieldControlled(subfieldLetter);
      const subfieldModification = linkingRule.subfieldModifications
        ?.find(mod => mod.source === subfieldLetter);

      // if authority subfield is a target of modification then don't add it to linked field
      const isSubfieldTarget = linkingRule.subfieldModifications
        ?.find(mod => mod.target === subfieldLetter);

      if (isSubfieldTarget) {
        return;
      }

      if (!isControlled) {
        return;
      }

      if (subfieldModification) {
        // special case of modification, where $t becomes $a and should therefore be the first subfield
        // in this case we'll pre-pend the subfield
        if (bibTag === '240' && subfieldLetter === 't' && subfieldModification.source === 't' && subfieldModification.target === 'a') {
          subfieldsAfterLinking.removeByCode('$a');
          subfieldsAfterLinking.prepend('$a', subfield.value);
        } else {
          subfieldsAfterLinking.append(formatSubfieldCode(subfieldModification.target), subfield.value);
        }
      } else {
        subfieldsAfterLinking.append(subfield.code, subfield.value);
      }
    });

    bibSubfields.forEach(subfield => {
      const subfieldLetter = subfield.code.replace('$', '');
      const isControlled = isSubfieldControlled(subfieldLetter);

      if (isControlled) {
        return;
      }

      subfieldsAfterLinking.append(subfield.code, subfield.value);
    });

    return subfieldsAfterLinking;
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
    const bibSubfields = new MarcFieldContent(bibField.content);
    const sourceFile = sourceFiles.find(file => file.id === authorityRecord.sourceFileId);

    let newZeroSubfield = '';

    if (sourceFile?.baseUrl) {
      newZeroSubfield = [sourceFile?.baseUrl, authorityRecord.naturalId].join('').trim();
    } else {
      newZeroSubfield = authorityRecord.naturalId;
    }

    bibSubfields.removeByCode('$0');
    bibSubfields.append('$0', newZeroSubfield);

    const updatedBibSubfields = copySubfieldsFromAuthority(bibSubfields, linkedAuthorityField, bibField.tag);

    updatedBibSubfields.removeByCode('$9');
    updatedBibSubfields.append('$9', authorityRecord.id);
    bibField.prevContent = bibField.content;
    bibField.content = updatedBibSubfields.toContentString();
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
    const uncontrolledNumberSubfields = new MarcFieldContent(field.subfieldGroups?.[UNCONTROLLED_NUMBER]);
    const uncontrolledAlphaSubfields = new MarcFieldContent(field.subfieldGroups?.[UNCONTROLLED_ALPHA]);

    const uncontrolledNumber = uncontrolledNumberSubfields.$9?.[0]
      ? uncontrolledNumberSubfields.removeByCode('$9').toContentString()
      : field.subfieldGroups[UNCONTROLLED_NUMBER];

    const uncontrolledAlpha = uncontrolledAlphaSubfields.$9?.[0]
      ? uncontrolledAlphaSubfields.removeByCode('$9').toContentString()
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
    const subfields = new MarcFieldContent(field.content);

    if (
      suggestedField.linkDetails?.status === AUTOLINKING_STATUSES.ERROR
      && subfields.$9?.[0]
    ) {
      return {
        ...field,
        content: subfields.removeByCode('$9').toContentString(),
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

  const getSuggestedFields = useCallback(async (formValues, fieldsToHydrate, extraRequestArgs = {}) => {
    const payload = hydrateForLinkSuggestions(formValues, marcType, fieldsToHydrate);

    const requestArgs = {
      body: payload,
      ...extraRequestArgs,
    };

    const { fields: memberSuggestedFields } = await fetchLinkSuggestions(requestArgs);

    return memberSuggestedFields;
  }, [fetchLinkSuggestions, marcType]);

  const autoLinkAuthority = useCallback(async (formValues) => {
    const fieldsToLink = formValues.records.filter(record => isRecordForAutoLinking(record, autoLinkableBibFields));
    const suggestedFields = await getSuggestedFields(formValues, fieldsToLink);

    let suggestedFieldIndex = 0;

    const fields = formValues.records.map(field => {
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

    return {
      fields,
      suggestedFields,
    };
  }, [autoLinkableBibFields, updateAutoLinkableField, updateLinkedField, getSuggestedFields]);

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
    const bibSubfields = new MarcFieldContent(field.content);

    bibSubfields.removeByCode('$9');
    delete field.linkDetails;
    delete field.subfieldGroups;

    field.content = field.prevContent ?? bibSubfields.toContentString();
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

    const extraRequestArgs = {
      isSearchByAuthorityId: true,
      ignoreAutoLinkingEnabled: true,
    };

    const suggestedFields = await getSuggestedFields(formValues, linkedFields, extraRequestArgs);

    const actualizedLinks = formValues.records.map(field => {
      if (!isFieldLinked(field)) {
        return field;
      }

      const suggestedField = suggestedFields.shift();

      if (suggestedField.linkDetails?.status === AUTOLINKING_STATUSES.ERROR) {
        return unlinkAuthority(field);
      }

      const subfieldGroups = getSubfieldGroups(field, suggestedField);

      return {
        ...field,
        ...suggestedField,
        content: Object.values(subfieldGroups).filter(Boolean).join(' '),
      };
    });

    return {
      ...formValues,
      records: actualizedLinks,
    };
  }, [getSubfieldGroups, unlinkAuthority, getSuggestedFields]);

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
    fetchLinkSuggestions,
    isLoadingLinkSuggestions,
  };
};

export default useAuthorityLinking;
