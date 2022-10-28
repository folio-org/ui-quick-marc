import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';
import { useOkapiKy } from '@folio/stripes/core';

import { useMarcSource } from './useMarcSource';

const mockGet = jest.fn().mockReturnValue();

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn().mockReturnValue(['ui-quick-marc-test']),
  useOkapiKy: jest.fn(),
}));

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

    renderHook(() => useMarcSource(fieldId, recordId, { onSuccess: jest.fn() }), { wrapper });

    expect(mockGet).toHaveBeenCalledWith('records-editor/records?externalId=record-id');
  });
});
