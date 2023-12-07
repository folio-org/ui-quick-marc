import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

const useAuthorityLinksCount = ({ id } = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace();

  const searchParams = {
    query: `(id==${id} and authRefType==("Authorized"))`, // only Authorized records have links counts, so we need to get them
  };

  const { data = {}, isLoading } = useQuery(
    [namespace, 'authority', id],
    () => ky.get('search/authorities', { searchParams }).json(),
    {
      keepPreviousData: true,
      enabled: Boolean(id),
    },
  );

  return {
    linksCount: data.authorities?.[0]?.numberOfTitles || 0,
    isLoading,
  };
};

export default useAuthorityLinksCount;
