import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

const KEY = 'lccn-duplicate-check';
const SCOPE = 'ui-quick-marc.lccn-duplicate-check';

const useLccnDuplicateConfig = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'lccn-duplicate-config' });

  const { data, isFetching } = useQuery(
    [namespace],
    () => ky.get('settings/entries', {
      searchParams: {
        key: KEY,
        scope: SCOPE,
      },
    }).json(),
    {
      enabled: true,
    },
  );

  return {
    isLoading: isFetching,
    duplicateLccnCheckingEnabled: data?.items[0]?.value.duplicateLccnCheckingEnabled,
  };
};

export { useLccnDuplicateConfig };
