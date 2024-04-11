import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

const CQL_ALL = 'cql.allRecords=1';

const useAuthoritySourceFiles = ({ searchParams, tenantId } = {}) => {
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: 'authority-source-files' });

  const queryString = new URLSearchParams(searchParams).toString();

  const _searchParams = {
    limit: 100,
    query: `${queryString || CQL_ALL} sortby name`,
  };

  const { isFetching, data } = useQuery(
    [namespace, tenantId, queryString],
    async () => {
      return ky.get('authority-source-files', { searchParams: _searchParams }).json();
    },
  );

  return ({
    sourceFiles: data?.authoritySourceFiles || [],
    isLoading: isFetching,
  });
};

export default useAuthoritySourceFiles;
