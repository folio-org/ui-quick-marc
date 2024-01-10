import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import useMarcRecordMutation from './useMarcRecordMutation';
import { MARC_RECORD_API } from '../../common/constants';

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

const mockPut = jest.fn();

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
  });

  it('should update the record', async () => {
    const { result } = renderHook(() => useMarcRecordMutation(), { wrapper });

    await act(async () => { result.current.updateMarcRecord(body); });

    expect(mockPut).toHaveBeenCalledWith(`${MARC_RECORD_API}/${body.parsedRecordId}`, { json: body });
  });

  describe('when there is an error', () => {
    it('should throw a http response', async () => {
      const response = { json: jest.fn() };

      ky.put.mockRejectedValueOnce({
        code: 409,
        response,
      });

      const { result } = renderHook(() => useMarcRecordMutation(), { wrapper });

      expect(() => result.current.updateMarcRecord(body)).rejects.toEqual(response);
    });
  });
});
