import { useCallback } from 'react';

import { useAuthoritySourceFiles } from '../useAuthoritySourceFiles';

import {
  getContentSubfieldValue,
  groupSubfields,
} from '../../QuickMarcEditor/utils';
import { LINKED_BIB_TO_AUTHORITY_FIELDS } from '../../common/constants';

const useAuthorityLinking = () => {
  const { sourceFiles } = useAuthoritySourceFiles();

  const joinSubfields = (subfields) => Object.keys(subfields).reduce((content, key) => [content, `${key} ${subfields[key]}`].join(' '), '').trim();

  const copySubfieldsFromAuthority = (bibSubfields, authField) => {
    const authSubfields = getContentSubfieldValue(authField.content);

    Object.keys(authSubfields).forEach(key => {
      bibSubfields[key] = authSubfields[key];
    });

    return bibSubfields;
  };

  const linkAuthority = useCallback((authority, authoritySource, field) => {
    const linkedAuthorityField = authoritySource.fields
      .find(authorityField => authorityField.tag === LINKED_BIB_TO_AUTHORITY_FIELDS[field.tag]);

    if (!linkedAuthorityField) {
      // TODO: will handle validation here. Requirements are yet to be defined
      return field;
    }

    const bibSubfields = getContentSubfieldValue(field.content);
    const sourceFile = sourceFiles.find(file => file.id === authority.sourceFileId);

    let newZeroSubfield = '';

    if (sourceFile?.baseUrl) {
      newZeroSubfield = ['http://', sourceFile?.baseUrl, authority.naturalId].join('').trim();
    } else {
      newZeroSubfield = authority.naturalId;
    }

    if (!bibSubfields.$0 || bibSubfields.$0 !== authority.naturalId) {
      bibSubfields.$0 = newZeroSubfield;
    }

    bibSubfields.$9 = authority.id;
    copySubfieldsFromAuthority(bibSubfields, linkedAuthorityField);
    field.content = joinSubfields(bibSubfields);

    const controlledSubfields = Object.keys(getContentSubfieldValue(linkedAuthorityField.content)).map(key => key.replace('$', ''));

    return {
      ...field,
      authorityNaturalId: authority.naturalId,
      authorityId: authority.id,
      subfieldGroups: groupSubfields(field, controlledSubfields),
      authorityControlledSubfields: controlledSubfields,
    };
  }, [sourceFiles]);

  const unlinkAuthority = (field) => {
    const bibSubfields = getContentSubfieldValue(field.content);

    delete bibSubfields.$9;
    delete field.authorityNaturalId;
    delete field.authorityId;

    field.content = joinSubfields(bibSubfields);

    return {
      ...field,
      subfieldGroups: null,
      authorityControlledSubfields: [],
    };
  };

  return {
    linkAuthority,
    unlinkAuthority,
  };
};

export default useAuthorityLinking;
