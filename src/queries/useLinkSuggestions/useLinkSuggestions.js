import { useMutation } from 'react-query';

import {
  useOkapiKy,
} from '@folio/stripes/core';

import { changeTenantHeader } from '../../QuickMarcEditor/utils';

const useLinkSuggestions = (tenantId) => {
  const ky = useOkapiKy();
  const api = tenantId ? changeTenantHeader(ky, tenantId) : ky;

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled }) => {
      const searchParams = new URLSearchParams();

      if (isSearchByAuthorityId) {
        searchParams.append('authoritySearchParameter', 'ID');
      }

      if (ignoreAutoLinkingEnabled) {
        searchParams.append('ignoreAutoLinkingEnabled', 'true');
      }

      return api.post('records-editor/links/suggestion', {
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
