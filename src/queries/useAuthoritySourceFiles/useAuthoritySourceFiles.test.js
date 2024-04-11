import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { useOkapiKy } from '@folio/stripes/core';

import useAuthoritySourceFiles from './useAuthoritySourceFiles';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

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
    jest.clearAllMocks();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch source files', async () => {
    const { result } = renderHook(() => useAuthoritySourceFiles(), { wrapper });

    await act(async () => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalled();
  });

  it('should sort by name', async () => {
    const { result } = renderHook(() => useAuthoritySourceFiles(), { wrapper });

    await act(async () => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalledWith('authority-source-files', { searchParams: { limit: 100, query: 'cql.allRecords=1 sortby name' } });
  });

  describe('when passing search parameters', () => {
    it('should include them in the url', async () => {
      const searchParams = { selectable: true };

      const { result } = renderHook(() => useAuthoritySourceFiles({ searchParams }), { wrapper });

      await act(async () => !result.current.isLoading);

      expect(mockGet).toHaveBeenCalledWith('authority-source-files', { searchParams: { limit: 100, query: 'selectable=true sortby name' } });
    });
  });
});
