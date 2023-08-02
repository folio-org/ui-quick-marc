import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

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
    const { result } = renderHook(() => useAuthoritySourceFiles(), { wrapper });

    await act(async () => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalled();
  });
});
