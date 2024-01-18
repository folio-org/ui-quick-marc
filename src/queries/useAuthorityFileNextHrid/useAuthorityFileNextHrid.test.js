import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  act,
} from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useAuthorityFileNextHrid } from './useAuthorityFileNextHrid';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const id = '123';
const hrid = 'n1';

const mockPost = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({ hrid }),
});

const ky = {
  post: mockPost,
};

describe('Given useAuthorityFileNextHrid', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue(ky);
  });

  it('should return HRID', async () => {
    const { result } = renderHook(() => useAuthorityFileNextHrid(), { wrapper });

    let response;

    await act(async () => {
      response = await result.current.getAuthorityFileNextHrid(id);
    });

    expect(mockPost).toHaveBeenCalledWith(`authority-source-files/${id}/hrid`);
    expect(response).toEqual({ hrid });
  });
});
