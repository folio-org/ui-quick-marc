import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import '../../../test/jest/__mock__';

import { useOkapiKy } from '@folio/stripes/core';

import useAuthorityLinksCount from './useAuthorityLinksCount';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockPost = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({ links: [] }),
});

describe('Given useAuthorityLinksCount', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      post: mockPost,
    });
  });

  it('should fetch links count', async () => {
    const { result } = renderHook(() => useAuthorityLinksCount(), { wrapper });

    await result.current.fetchLinksCount(['fakeId']);

    expect(mockPost).toHaveBeenCalledWith('links/authorities/bulk/count', { json: { ids: ['fakeId'] } });
  });
});
