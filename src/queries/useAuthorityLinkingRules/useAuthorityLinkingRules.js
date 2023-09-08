import { useQuery } from 'react-query';

import { useNamespace } from '@folio/stripes/core';

import { LINKING_RULES_API } from '../../common/constants';
import { useTenantKy } from '../../temp';

const useAuthorityLinkingRules = ({ tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });
  const [namespace] = useNamespace({ key: 'authority-linking-rules' });

  const { isFetching, data } = useQuery(
    [namespace],
    async () => {
      return ky.get(LINKING_RULES_API).json();
    },
  );

  return ({
    linkingRules: data || [],
    isLoading: isFetching,
  });
};

export default useAuthorityLinkingRules;
