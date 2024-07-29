import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

const KEY = 'lccn-duplicate-check';
const SCOPE = 'ui-quick-marc.lccn-duplicate-check';

const useLccnDuplicateConfig = () => {
  const stripes = useStripes();
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
      enabled: Boolean(stripes.hasPerm('ui-quick-marc.settings.lccn-duplicate-check.view')),
      cacheTime: 0, // to avoid having irrelevant flag after the permission was revoked.
    },
  );

  return {
    isLoading: isFetching,
    duplicateLccnCheckingEnabled: data?.items[0]?.value.duplicateLccnCheckingEnabled || false,
  };
};

export { useLccnDuplicateConfig };
