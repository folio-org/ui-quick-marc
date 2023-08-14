import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { processTenantHeader } from '../../QuickMarcEditor/utils';

const useAuthorityLinksCount = ({ tenantId, marcType } = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const location = useLocation();

  const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ids => api.post('links/authorities/bulk/count', { json: { ids } }).json(),
  });

  return {
    fetchLinksCount: mutateAsync,
    isLoading,
  };
};

export default useAuthorityLinksCount;
