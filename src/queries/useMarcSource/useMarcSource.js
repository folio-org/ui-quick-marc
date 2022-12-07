import { useQuery } from 'react-query';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';

import { MARC_RECORD_API } from '../../common/constants';

const MARC_SOURCE_API = (id) => `${MARC_RECORD_API}?externalId=${id}`;

export const useMarcSource = (fieldId, recordId, { onSuccess } = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'MARC_SOURCE' });

  const { isFetching, data, refetch } = useQuery(
    [namespace, fieldId, recordId],
    async () => {
      return ky.get(MARC_SOURCE_API(recordId)).json();
    }, {
      enabled: !!recordId,
      onSuccess,
    },
  );

  return ({
    refetch,
    data,
    isLoading: isFetching,
  });
};
