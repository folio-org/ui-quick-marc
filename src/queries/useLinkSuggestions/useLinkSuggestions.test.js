import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useLinkSuggestions from './useLinkSuggestions';
import { OKAPI_TENANT_HEADER } from '../../common/constants';

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

describe('Given useLinkSuggestions', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      post: mockPost,
    });
  });

  it('should fetch link suggestions with the current tenant', async () => {
    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await act(async () => { result.current.fetchLinkSuggestions({ body }); });

    expect(mockPost).toHaveBeenCalledWith('records-editor/links/suggestion', {
      headers: {
        [OKAPI_TENANT_HEADER]: 'diku',
      },
      json: body,
      searchParams: '',
    });
  });

  it('should fetch link suggestions with the pointed tenant', async () => {
    const tenantId = 'consortia';

    const { result } = renderHook(() => useLinkSuggestions(), { wrapper });

    await act(async () => { result.current.fetchLinkSuggestions({ body, tenantId }); });

    expect(mockPost).toHaveBeenCalledWith('records-editor/links/suggestion', {
      headers: {
        [OKAPI_TENANT_HEADER]: tenantId,
      },
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
        headers: {
          [OKAPI_TENANT_HEADER]: 'diku',
        },
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
        headers: {
          [OKAPI_TENANT_HEADER]: 'diku',
        },
        searchParams: 'ignoreAutoLinkingEnabled=true',
        json: body,
      },
    );
  });
});
