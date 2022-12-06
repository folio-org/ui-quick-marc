import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';

const useAuthorityLinkingRules = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'authority-linking-rules' });

  const { isFetching, data } = useQuery(
    [namespace],
    async () => {
      return ky.get('linking-rules/instance-authority').json();
    },
  );

  return ({
    linkingRules: data || [],
    isLoading: isFetching,
  });
};

export default useAuthorityLinkingRules;
