import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';

const useAuthoritySourceFiles = () => {
  const ky = useOkapiKy();
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
