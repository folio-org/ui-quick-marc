import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

const useLinkSuggestions = () => {
  const ky = useOkapiKy();

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled }) => {
      const searchParams = new URLSearchParams();

      if (isSearchByAuthorityId) {
        searchParams.append('authoritySearchParameter', 'ID');
      }

      if (ignoreAutoLinkingEnabled) {
        searchParams.append('ignoreAutoLinkingEnabled', 'true');
      }

      return ky.post('records-editor/links/suggestion', {
        searchParams: searchParams.toString(),
        json: body,
      }).json();
    },
  );

  return {
    fetchLinkSuggestions: mutateAsync,
    isLoading,
  };
};

export default useLinkSuggestions;
