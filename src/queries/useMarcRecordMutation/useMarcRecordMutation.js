import { useMutation } from 'react-query';
import {
  MARC_RECORD_API,
} from '../../common/constants';
import { useTenantKy } from '../../temp';

const useMarcRecordMutation = ({ tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });

  const { mutateAsync: updateMarcRecord, isLoading: isUpdating } = useMutation(body => {
    return ky.put(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });

  return {
    updateMarcRecord,
    isLoading: isUpdating,
  };
};

export default useMarcRecordMutation;
