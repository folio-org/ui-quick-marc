import { useMutation } from 'react-query';

import {
  useOkapiKy,
} from '@folio/stripes/core';

import { OKAPI_TENANT_HEADER } from '../../common/constants';

const useLinkSuggestions = () => {
  const ky = useOkapiKy();

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled, tenantId }) => {
      const api = tenantId
        ? ky.extend({
          hooks: {
            beforeRequest: [
              request => {
                request.headers.set(OKAPI_TENANT_HEADER, tenantId);
              },
            ],
          },
        })
        : ky;

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
