import { useMutation } from 'react-query';
import { useTenantKy } from '../../temp';

const useAuthorityLinksCount = ({ tenantId } = {}) => {
  const ky = useTenantKy({ tenantId });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: ids => ky.post('links/authorities/bulk/count', { json: { ids } }).json(),
  });

  return {
    fetchLinksCount: mutateAsync,
    isLoading,
  };
};

export default useAuthorityLinksCount;
