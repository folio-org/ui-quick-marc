import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useMarcSource } from './useMarcSource';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

const mockGet = jest.fn().mockReturnValue();

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Given useMarcSource', () => {
  it('should make a request to correct url', () => {
    useOkapiKy.mockReturnValue({
      get: mockGet,
    });
    const fieldId = 'marc-record-id';
    const recordId = 'record-id';

    renderHook(() => useMarcSource({ fieldId, recordId, onSuccess: jest.fn() }), { wrapper });

    expect(mockGet).toHaveBeenCalledWith('records-editor/records?externalId=record-id');
  });
});
