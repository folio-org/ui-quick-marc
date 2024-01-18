import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

export const useAuthorityFileNextHrid = () => {
  const ky = useOkapiKy();

  const { mutateAsync: getAuthorityFileNextHrid, isLoading } = useMutation(
    id => ky.post(`authority-source-files/${id}/hrid`).json(),
  );

  return {
    getAuthorityFileNextHrid,
    isLoading,
  };
};
