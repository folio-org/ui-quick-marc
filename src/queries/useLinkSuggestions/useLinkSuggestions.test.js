import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import '../../../test/jest/__mock__';

import { useOkapiKy } from '@folio/stripes/core';

import useLinkSuggestions from './useLinkSuggestions';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockPost = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({ fields: [] }),
});

describe('Given useLinkSuggestions', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      post: mockPost,
    });
  });

  it('should fetch link suggestions', async () => {
    const body = {
      _actionType: 'view',
      fields: [],
    };
    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await result.current.fetchLinkSuggestions(body);

    expect(mockPost).toHaveBeenCalledWith('records-editor/links/suggestion', { json: body });
  });
});
