import {
  useCallback,
  useMemo,
} from 'react';
import get from 'lodash/get';

import {
  useAuthoritySourceFiles,
  useAuthorityLinkingRules,
} from '../../queries';

import {
  getContentSubfieldValue,
  groupSubfields,
  getControlledSubfields,
  isRecordForAutoLinking,
  findIndexFrom,
} from '../../QuickMarcEditor/utils';

const joinSubfields = (subfields) => Object.keys(subfields).reduce((content, key) => {
  const subfield = subfields[key].join(` ${key} `);

  return [content, `${key} ${subfield}`].join(' ');
}, '').trim();

const formatSubfieldCode = (code) => { return code.startsWith('$') ? code : `$${code}`; };

const useAuthorityLinking = () => {
  const { sourceFiles } = useAuthoritySourceFiles();
  const { linkingRules } = useAuthorityLinkingRules();

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

  const autoLinkAuthority = useCallback((fields, suggestedFields) => {
    let startIndex = 0;

    const isSuggestionThatCanBeLinked = (suggestedField) => (
      suggestedField.linkDetails
      && suggestedField.linkDetails?.status !== 'ERROR'
    );

    suggestedFields
      .filter(isSuggestionThatCanBeLinked)
      .forEach(suggestedField => {
        const fieldIndex = findIndexFrom(fields, startIndex, (field) => (
          field.tag === suggestedField.tag
          && isRecordForAutoLinking(field, autoLinkableBibFields)
        ));

        if (fieldIndex !== -1) {
          startIndex = fieldIndex + 1;

          const linkingRule = linkingRules.find(rule => rule.id === suggestedField.linkDetails?.linkingRuleId);
          const controlledSubfields = getControlledSubfields(linkingRule);

          fields[fieldIndex] = {
            ...fields[fieldIndex],
            ...suggestedField,
            subfieldGroups: groupSubfields(suggestedField, controlledSubfields),
          };
        }
      });

    return fields;
  }, [linkingRules, autoLinkableBibFields]);

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

  return {
    linkAuthority,
    unlinkAuthority,
    linkableBibFields,
    sourceFiles,
    autoLinkingEnabled,
    autoLinkableBibFields,
    autoLinkAuthority,
  };
};

export default useAuthorityLinking;
