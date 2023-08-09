import { useMutation } from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { OKAPI_TENANT_HEADER } from '../../common/constants';

const useLinkSuggestions = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled, tenantId }) => {
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
        headers: {
          [OKAPI_TENANT_HEADER]: tenantId || stripes.okapi.tenant,
        },
      }).json();
    },
  );

  return {
    fetchLinkSuggestions: mutateAsync,
    isLoading,
  };
};

export default useLinkSuggestions;
