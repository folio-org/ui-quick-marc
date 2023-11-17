import { useMutation } from 'react-query';

import { useTenantKy } from '../../temp';

const useLinkSuggestions = ({ tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });

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
