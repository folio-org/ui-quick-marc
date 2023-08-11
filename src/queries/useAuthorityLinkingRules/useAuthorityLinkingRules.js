import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';

import { LINKING_RULES_API } from '../../common/constants';
import { changeTenantHeader } from '../../QuickMarcEditor/utils';

const useAuthorityLinkingRules = (tenantId) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'authority-linking-rules' });

  const api = tenantId ? changeTenantHeader(ky, tenantId) : ky;

  const { isFetching, data } = useQuery(
    [namespace],
    async () => {
      return api.get(LINKING_RULES_API).json();
    },
  );

  return ({
    linkingRules: data || [],
    isLoading: isFetching,
  });
};

export default useAuthorityLinkingRules;
