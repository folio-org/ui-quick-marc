import { useCallback } from 'react';

import { useAuthoritySourceFiles } from '@folio/stripes-authority-components';

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
    }

    const bibSubfields = getContentSubfieldValue(field.content);
    const sourceFile = sourceFiles.find(file => file.id === authority.sourceFileId);

    if (!sourceFile) {
      return field;
    }

    const newZeroSubfield = [sourceFile.baseUrl, authority.naturalId].join('');

    if (!bibSubfields.$0 || bibSubfields.$0 !== authority.naturalId) {
      bibSubfields.$0 = newZeroSubfield;
      bibSubfields.$9 = authority.id;
      copySubfieldsFromAuthority(bibSubfields, linkedAuthorityField);

      field.content = joinSubfields(bibSubfields);
      field.authorityNaturalId = authority.naturalId;

      return {
        ...field,
        subfieldGroups: groupSubfields(field),
      };
    }

    return field;
  }, [sourceFiles]);

  const unlinkAuthority = (field) => {
    const bibSubfields = getContentSubfieldValue(field.content);

    delete bibSubfields.$9;
    delete field.authorityNaturalId;

    field.content = joinSubfields(bibSubfields);

    return {
      ...field,
      subfieldGroups: null,
    };
  };

  return {
    linkAuthority,
    unlinkAuthority,
  };
};

export default useAuthorityLinking;
