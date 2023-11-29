import { useQuery } from 'react-query';

import { useNamespace } from '@folio/stripes/core';

import { useTenantKy } from '../../temp';

const useAuthorityLinksCount = ({ id, tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });
  const [namespace] = useNamespace();

  const searchParams = {
    query: `(id==${id} and authRefType==("Authorized"))`, // only Authorized records have links counts, so we need to get them
  };

  const { data = {}, isLoading } = useQuery(
    [namespace, 'authority', id],
    () => ky.get('search/authorities', { searchParams }).json(),
    {
      keepPreviousData: true,
    },
  );

  return {
    linksCount: data.authorities?.[0]?.numberOfTitles || 0,
    isLoading,
  };
};

export default useAuthorityLinksCount;
