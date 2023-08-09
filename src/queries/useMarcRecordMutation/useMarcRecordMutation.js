import { useMutation } from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  MARC_RECORD_API,
  OKAPI_TENANT_HEADER,
} from '../../common/constants';

const useMarcRecordMutation = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const { mutateAsync: updateMarcRecord, isLoading: isUpdating } = useMutation(({ body, tenantId }) => {
    return ky.put(`${MARC_RECORD_API}/${body.parsedRecordId}`, {
      headers: {
        [OKAPI_TENANT_HEADER]: tenantId || stripes.okapi.tenant,
      },
      json: body,
    });
  });

  return {
    updateMarcRecord,
    isLoading: isUpdating,
  };
};

export default useMarcRecordMutation;
