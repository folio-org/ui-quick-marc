import { useMutation } from 'react-query';
import { useLocation } from 'react-router-dom';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import {
  MARC_RECORD_API,
} from '../../common/constants';
import { processTenantHeader } from '../../QuickMarcEditor/utils';

const useMarcRecordMutation = ({ tenantId, marcType } = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const location = useLocation();

  const api = processTenantHeader({ ky, tenantId, marcType, stripes, location });

  const { mutateAsync: updateMarcRecord, isLoading: isUpdating } = useMutation(body => {
    return api.put(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });

  return {
    updateMarcRecord,
    isLoading: isUpdating,
  };
};

export default useMarcRecordMutation;
