import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useLinkSuggestions from './useLinkSuggestions';

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

const mockPost = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({ fields: [] }),
});

const body = {
  _actionType: 'view',
  fields: [],
};

const ky = {
  post: mockPost,
};

describe('Given useLinkSuggestions', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue(ky);
  });

  it('should fetch link suggestions', async () => {
    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await act(async () => { result.current.fetchLinkSuggestions({ body }); });

    expect(mockPost).toHaveBeenCalledWith('records-editor/links/suggestion', {
      json: body,
      searchParams: '',
    });
  });

  it('should fetch link suggestions with both authoritySearchParameter and ignoreAutoLinkingEnabled', async () => {
    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await act(async () => {
      result.current.fetchLinkSuggestions({
        body,
        isSearchByAuthorityId: true,
        ignoreAutoLinkingEnabled: true,
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      'records-editor/links/suggestion',
      {
        searchParams: 'authoritySearchParameter=ID&ignoreAutoLinkingEnabled=true',
        json: body,
      },
    );
  });

  it('should fetch link suggestions with ignoreAutoLinkingEnabled only', async () => {
    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await act(async () => {
      result.current.fetchLinkSuggestions({
        body,
        ignoreAutoLinkingEnabled: true,
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      'records-editor/links/suggestion',
      {
        searchParams: 'ignoreAutoLinkingEnabled=true',
        json: body,
      },
    );
  });
});
