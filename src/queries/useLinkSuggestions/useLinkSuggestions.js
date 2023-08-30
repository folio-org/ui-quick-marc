import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { processTenantHeader } from '../../QuickMarcEditor/utils';

const useLinkSuggestions = ({ marcType } = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const location = useLocation();

  const { mutateAsync, isLoading } = useMutation(
    ({ body, isSearchByAuthorityId, ignoreAutoLinkingEnabled, tenantId }) => {
      const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });
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
