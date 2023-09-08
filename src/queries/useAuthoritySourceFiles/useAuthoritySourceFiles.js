import { useQuery } from 'react-query';

import {
  useNamespace,
} from '@folio/stripes/core';

import { useTenantKy } from '../../temp';

const useAuthoritySourceFiles = ({ tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });
  const [namespace] = useNamespace({ key: 'authority-source-files' });

  const { isFetching, data } = useQuery(
    [namespace],
    async () => {
      return ky.get('authority-source-files?limit=100').json();
    },
  );

  return ({
    sourceFiles: data?.authoritySourceFiles || [],
    isLoading: isFetching,
  });
};

export default useAuthoritySourceFiles;
