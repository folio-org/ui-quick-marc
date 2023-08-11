import { useMutation } from 'react-query';

import {
  useOkapiKy,
} from '@folio/stripes/core';

import {
  MARC_RECORD_API,
} from '../../common/constants';
import { changeTenantHeader } from '../../QuickMarcEditor/utils';

const useMarcRecordMutation = () => {
  const ky = useOkapiKy();

  const { mutateAsync: updateMarcRecord, isLoading: isUpdating } = useMutation(({ body, tenantId }) => {
    const api = tenantId ? changeTenantHeader(ky, tenantId) : ky;

    return api.put(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });

  return {
    updateMarcRecord,
    isLoading: isUpdating,
  };
};

export default useMarcRecordMutation;
