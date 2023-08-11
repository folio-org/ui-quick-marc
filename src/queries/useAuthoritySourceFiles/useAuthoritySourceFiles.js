import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';
import { changeTenantHeader } from '../../QuickMarcEditor/utils';

const useAuthoritySourceFiles = (tenantId) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'authority-source-files' });

  const api = tenantId ? changeTenantHeader(ky, tenantId) : ky;

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
