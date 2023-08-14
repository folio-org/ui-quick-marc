import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

import {
  useOkapiKy,
  useNamespace,
  useStripes,
} from '@folio/stripes/core';

import { LINKING_RULES_API } from '../../common/constants';
import { processTenantHeader } from '../../QuickMarcEditor/utils';

const useAuthorityLinkingRules = ({ tenantId, marcType } = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const location = useLocation();
  const [namespace] = useNamespace({ key: 'authority-linking-rules' });

  const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });

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
