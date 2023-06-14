import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

const useLinkSuggestions = () => {
  const ky = useOkapiKy();

  const { mutateAsync, isLoading } = useMutation(
    body => ky.post('records-editor/links/suggestion', { json: body }).json(),
  );

  return {
    fetchLinkSuggestions: mutateAsync,
    isLoading,
  };
};

export default useLinkSuggestions;
