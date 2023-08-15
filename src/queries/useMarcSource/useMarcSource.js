import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

import {
  useOkapiKy,
  useNamespace,
  useStripes,
} from '@folio/stripes/core';

import { MARC_RECORD_API } from '../../common/constants';
import { processTenantHeader } from '../../QuickMarcEditor/utils';

const MARC_SOURCE_API = (id) => `${MARC_RECORD_API}?externalId=${id}`;

export const useMarcSource = ({ fieldId, recordId, tenantId, marcType, onSuccess }) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const location = useLocation();
  const [namespace] = useNamespace({ key: 'MARC_SOURCE' });

  const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });

  const { isFetching, data, refetch } = useQuery(
    [namespace, fieldId, recordId],
    async () => {
      return api.get(MARC_SOURCE_API(recordId)).json();
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
