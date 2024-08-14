import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { MARC_TYPES } from '../../common/constants';

const KEY = 'lccn-duplicate-check';
const SCOPE = 'ui-quick-marc.lccn-duplicate-check';

const useLccnDuplicateConfig = ({ marcType }) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'lccn-duplicate-config' });

  const { data, isFetching } = useQuery(
    [namespace],
    () => ky.get('settings/entries', {
      searchParams: {
        query: `(key==${KEY} and scope==${SCOPE})`,
      },
    }).json(),
    {
      enabled: [MARC_TYPES.BIB, MARC_TYPES.AUTHORITY].includes(marcType),
      cacheTime: 0, // to avoid having irrelevant flag after the permission was revoked.
    },
  );

  return {
    isLoading: isFetching,
    duplicateLccnCheckingEnabled: data?.items[0]?.value.duplicateLccnCheckingEnabled || false,
  };
};

export { useLccnDuplicateConfig };
