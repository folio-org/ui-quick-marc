import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
  useStripes,
} from '@folio/stripes/core';
import { processTenantHeader } from '../../QuickMarcEditor/utils';

const useAuthoritySourceFiles = ({ tenantId, marcType } = {}) => {
  const ky = useOkapiKy({ tenantId, marcType });
  const stripes = useStripes();
  const location = useLocation();
  const [namespace] = useNamespace({ key: 'authority-source-files' });

  const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });

  const { isFetching, data } = useQuery(
    [namespace],
    async () => {
      return api.get('authority-source-files?limit=100').json();
    },
  );

  return ({
    sourceFiles: data?.authoritySourceFiles || [],
    isLoading: isFetching,
  });
};

export default useAuthoritySourceFiles;
