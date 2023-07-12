import {
  useCallback,
  useMemo,
} from 'react';
import get from 'lodash/get';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

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
} from '../../QuickMarcEditor/utils';
import { AUTOLINKING_STATUSES } from '../../QuickMarcEditor/constants';

const joinSubfields = (subfields) => Object.keys(subfields).reduce((content, key) => {
  const subfield = subfields[key].join(` ${key} `);

  return [content, `${key} ${subfield}`].join(' ');
}, '').trim();

const formatSubfieldCode = (code) => { return code.startsWith('$') ? code : `$${code}`; };

const useAuthorityLinking = () => {
  const { sourceFiles } = useAuthoritySourceFiles();
  const { linkingRules } = useAuthorityLinkingRules();
  const { fetchLinkSuggestions } = useLinkSuggestions();

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
      ...pick(groupSubfields(field, controlledSubfields), 'uncontrolledAlpha', 'uncontrolledNumber'),
    };
  }, [linkingRules]);

  const updateLinkedField = useCallback((field) => {
    const uncontrolledNumberSubfields = getContentSubfieldValue(field.subfieldGroups?.uncontrolledNumber);
    const uncontrolledAlphaSubfields = getContentSubfieldValue(field.subfieldGroups?.uncontrolledAlpha);

    const uncontrolledNumber = uncontrolledNumberSubfields.$9?.[0]
      ? joinSubfields(omit(uncontrolledNumberSubfields, '$9'))
      : field.subfieldGroups.uncontrolledNumber;

    const uncontrolledAlpha = uncontrolledAlphaSubfields.$9?.[0]
      ? joinSubfields(omit(uncontrolledAlphaSubfields, '$9'))
      : field.subfieldGroups.uncontrolledAlpha;

    return {
      ...field,
      subfieldGroups: {
        ...field.subfieldGroups,
        uncontrolledNumber,
        uncontrolledAlpha,
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
        status: AUTOLINKING_STATUSES.NEW,
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

  const actualizeNewLinkedFields = useCallback(async (formValues) => {
    const isNewLinkedField = (field) => field.linkDetails?.status === AUTOLINKING_STATUSES.NEW;
    const hasNewLinkedField = formValues.fields.some(isNewLinkedField);

    if (!hasNewLinkedField) {
      return formValues;
    }

    const newLinkedFields = formValues.fields.filter(isNewLinkedField);
    const payload = hydrateForLinkSuggestions(formValues, newLinkedFields);
    const { fields: suggestedFields } = await fetchLinkSuggestions({
      body: payload,
      isSearchByAuthorityId: true,
    });

    let suggestedFieldIndex = 0;

    const actualizedFields = formValues.fields.map(field => {
      if (isNewLinkedField(field)) {
        const suggestedField = suggestedFields[suggestedFieldIndex];

        suggestedFieldIndex += 1;

        if (suggestedField.linkDetails?.status === AUTOLINKING_STATUSES.ERROR) {
          return unlinkAuthority(field);
        }

        if (suggestedField.linkDetails && suggestedField.linkDetails.status !== AUTOLINKING_STATUSES.ERROR) {
          const subfieldGroups = getSubfieldGroups(field, suggestedField);

          return {
            ...field,
            ...suggestedField,
            content: Object.values(subfieldGroups).filter(Boolean).join(' '),
          };
        }
      }

      return field;
    });

    return {
      ...formValues,
      fields: actualizedFields,
    };
  }, [fetchLinkSuggestions, getSubfieldGroups, unlinkAuthority]);

  return {
    linkAuthority,
    unlinkAuthority,
    linkableBibFields,
    sourceFiles,
    autoLinkingEnabled,
    autoLinkableBibFields,
    autoLinkAuthority,
    actualizeNewLinkedFields,
  };
};

export default useAuthorityLinking;
