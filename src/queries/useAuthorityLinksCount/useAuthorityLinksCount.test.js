import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useAuthorityLinksCount from './useAuthorityLinksCount';

import '../../../test/jest/__mock__';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockGet = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({ authorities: [{ numberOfTitles: 2 }] }),
});

describe('Given useAuthorityLinksCount', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  it('should fetch authorities', async () => {
    renderHook(() => useAuthorityLinksCount({ id: 'fakeId' }), { wrapper });

    expect(mockGet).toHaveBeenCalledWith('search/authorities', {
      searchParams: {
        query: '(id==fakeId and authRefType==("Authorized"))',
      },
    });
  });

  it('should return links count', async () => {
    const { result } = renderHook(() => useAuthorityLinksCount({ id: 'fakeId' }), { wrapper });

    expect(result.current.linksCount).toEqual(2);
  });
});
