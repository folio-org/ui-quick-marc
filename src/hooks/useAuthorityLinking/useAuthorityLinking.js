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
} from '../../QuickMarcEditor/utils';

const joinSubfields = (subfields) => Object.keys(subfields).reduce((content, key) => {
  const subfield = Array.isArray(subfields[key])
    ? subfields[key].join(` ${key} `) // if the subfield is repeatable - join the items with subfield key
    : subfields[key];

  return [content, `${key} ${subfield}`].join(' ');
}, '').trim();

const formatSubfieldCode = (code) => { return code.startsWith('$') ? code : `$${code}`; };

const useAuthorityLinking = () => {
  const { sourceFiles } = useAuthoritySourceFiles();
  const { linkingRules } = useAuthorityLinkingRules();

  const linkableBibFields = useMemo(() => linkingRules.map(rule => rule.bibField), [linkingRules]);

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
      } else if (authSubfields[formatSubfieldCode(subfieldCode)]) {
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

  const getControlledSubfields = useCallback((linkingRule) => {
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
  }, []);

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
      const isValid = Boolean(authoritySubfields[formatSubfieldCode(ruleSubfield)]) === subfieldShouldExist;

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
      newZeroSubfield = ['http://', sourceFile?.baseUrl, authorityRecord.naturalId].join('').trim();
    } else {
      newZeroSubfield = authorityRecord.naturalId;
    }

    copySubfieldsFromAuthority(bibSubfields, linkedAuthorityField, bibField.tag);

    if (!bibSubfields.$0 || bibSubfields.$0 !== authorityRecord.naturalId) {
      bibSubfields.$0 = newZeroSubfield;
    }

    bibSubfields.$9 = authorityRecord.id;
    bibField.prevContent = bibField.content;
    bibField.content = joinSubfields(bibSubfields);
  }, [copySubfieldsFromAuthority, sourceFiles]);

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
      authorityNaturalId: authority.naturalId,
      authorityId: authority.id,
      subfieldGroups: groupSubfields(field, controlledSubfields),
      authorityControlledSubfields: controlledSubfields,
    };
  }, [
    updateBibFieldWithLinkingData,
    getLinkableAuthorityField,
    validateLinkage,
    findLinkingRule,
    getControlledSubfields,
  ]);

  const unlinkAuthority = (field) => {
    const bibSubfields = getContentSubfieldValue(field.content);

    delete bibSubfields.$9;
    delete field.authorityNaturalId;
    delete field.authorityId;

    field.content = field.prevContent ?? joinSubfields(bibSubfields);
    delete field.prevContent;

    return {
      ...field,
      subfieldGroups: null,
      authorityControlledSubfields: [],
    };
  };

  return {
    linkAuthority,
    unlinkAuthority,
    linkableBibFields,
    sourceFiles,
  };
};

export default useAuthorityLinking;
