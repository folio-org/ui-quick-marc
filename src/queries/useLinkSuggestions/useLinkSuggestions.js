import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

const useLinkSuggestions = () => {
  const ky = useOkapiKy();

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled }) => {
      let api = 'records-editor/links/suggestion';

      if (isSearchByAuthorityId) {
        api += '?authoritySearchParameter=ID';
      }

      if (ignoreAutoLinkingEnabled) {
        api += `${api.includes('?') ? '&' : '?'}ignoreAutoLinkingEnabled=true`;
      }

      return ky.post(api, { json: body }).json();
    },
  );

  return {
    fetchLinkSuggestions: mutateAsync,
    isLoading,
  };
};

export default useLinkSuggestions;
