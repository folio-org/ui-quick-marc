import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import '../../../test/jest/__mock__';

import { useOkapiKy } from '@folio/stripes/core';

import useAuthoritySourceFiles from './useAuthoritySourceFiles';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Given useAuthoritySourceFiles', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve({
      authoritySourceFiles: [],
    }),
  }));

  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch source files', async () => {
    const { result, waitFor } = renderHook(() => useAuthoritySourceFiles(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalled();
  });
});
