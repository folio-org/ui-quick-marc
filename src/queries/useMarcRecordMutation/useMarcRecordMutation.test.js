import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useMarcRecordMutation from './useMarcRecordMutation';
import { MARC_RECORD_API } from '../../common/constants';
import { changeTenantHeader } from '../../QuickMarcEditor/utils';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockPut = jest.fn();

jest.mock('../../QuickMarcEditor/utils', () => ({
  ...jest.requireActual('../../QuickMarcEditor/utils'),
  changeTenantHeader: jest.fn(ky => ky),
}));

const body = {
  _actionType: 'edit',
  fields: [],
  parsedRecordId: '87cab538-ca2e-44b9-82d7-defd273d127c',
};

const ky = {
  put: mockPut,
};

describe('Given useMarcRecordMutation', () => {
  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue(ky);
    changeTenantHeader.mockClear();
  });

  it('should update record for a specific tenant', async () => {
    const tenantId = 'consortia';

    const { result } = renderHook(() => useMarcRecordMutation(), { wrapper });

    await act(async () => { result.current.updateMarcRecord({ body, tenantId }); });

    expect(changeTenantHeader).toHaveBeenCalledWith(ky, tenantId);
    expect(mockPut).toHaveBeenCalledWith(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });

  it('should update the record with the current tenant in header', async () => {
    const { result } = renderHook(() => useMarcRecordMutation(), { wrapper });

    await act(async () => { result.current.updateMarcRecord({ body }); });

    expect(changeTenantHeader).not.toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalledWith(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });
});
