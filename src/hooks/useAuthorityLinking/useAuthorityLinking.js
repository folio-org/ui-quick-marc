import { useCallback } from 'react';

import { useAuthoritySourceFiles } from '@folio/stripes-authority-components';

import { getContentSubfieldValue } from '../../QuickMarcEditor/utils';

const useAuthorityLinking = () => {
  const { sourceFiles } = useAuthoritySourceFiles();

  const linkAuthority = useCallback((authority, field) => {
    const subfields = getContentSubfieldValue(field.content);
    const sourceFile = sourceFiles.find(file => file.id === authority.sourceFileId);

    if (!sourceFile) {
      return field;
    }

    const newZeroSubfield = [sourceFile.baseUrl, authority.naturalId].join('');

    if (!subfields.$0 || subfields.$0 !== authority.naturalId) {
      subfields.$0 = newZeroSubfield;
      subfields.$9 = authority.id;

      return {
        ...field,
        content: Object.keys(subfields).reduce((content, key) => [content, `${key} ${subfields[key]}`].join(' '), '').trim(),
      };
    }

    return field;
  }, [sourceFiles]);

  return {
    linkAuthority,
  };
};

export default useAuthorityLinking;
