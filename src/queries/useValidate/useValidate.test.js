import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useValidate } from './useValidate';

const mockPost = jest.fn().mockReturnValue({ json: jest.fn().mockResolvedValue({}) });

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Given useValidate', () => {
  it('should make a request to correct url', () => {
    useOkapiKy.mockReturnValue({
      post: mockPost,
    });

    const body = {};

    const { result } = renderHook(() => useValidate(), { wrapper });

    result.current.validate({ body });

    waitFor(() => expect(mockPost).toHaveBeenCalledWith('records-editor/validate', { json: body }));
  });
});
