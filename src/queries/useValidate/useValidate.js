import { useMutation } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { VALIDATE_API } from '../../common/constants';

export const useValidate = ({ tenantId } = {}) => {
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: 'MARC_VALIDATE' });

  const { isFetching, data, mutateAsync } = useMutation(
    [namespace],
    async ({ body }) => {
      return ky.post(VALIDATE_API, { json: body }).json();
    },
  );

  return ({
    validate: mutateAsync,
    data,
    isLoading: isFetching,
  });
};
