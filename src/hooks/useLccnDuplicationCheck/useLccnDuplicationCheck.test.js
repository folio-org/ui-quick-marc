import { useOkapiKy } from '@folio/stripes/core';
import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useLccnDuplicationCheck } from './useLccnDuplicationCheck';
import { useLccnDuplicateConfig } from '../../queries';
import { MARC_TYPES } from '../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useLccnDuplicateConfig: jest.fn(),
}));

const id = 'record-id';

describe('useLccnDuplicationCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: false });
  });

  describe('when marc type is bib', () => {
    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is already used in another record', () => {
      it('should return error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];

        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ instances: [{ id: 'id' }] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.BIB,
            action: QUICK_MARC_ACTIONS.EDIT,
            id,
          },
        });

        const error = await act(() => result.current.validateLccnDuplication(marcRecords));

        expect(mockGet).toHaveBeenCalledWith(
          'search/instances',
          {
            searchParams: {
              limit: 1,
              query: '(lccn=="123" or lccn=="456") not id=="record-id"',
            },
          },
        );
        expect(error).toEqual({
          [fieldId]: [{ id: 'ui-quick-marc.record.error.010.lccnDuplicated' }],
        });
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is not used in any record', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ instances: [] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.BIB,
            action: QUICK_MARC_ACTIONS.DERIVE,
            id,
          },
        });

        const error = await act(() => result.current.validateLccnDuplication(marcRecords));

        expect(mockGet).toHaveBeenCalledWith(
          'search/instances',
          {
            searchParams: {
              limit: 1,
              query: '(lccn=="123" or lccn=="456")',
            },
          },
        );
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is disabled', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ instances: [{ id: 'id' }] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: false });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.BIB,
          },
        });

        const error = await result.current.validateLccnDuplication(marcRecords);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });
  });

  describe('when marc type is authority', () => {
    describe('when 010 field is absent', () => {
      it('should not return an error', async () => {
        const marcRecords = [{}];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ authorities: [{ id: 'id' }] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.AUTHORITY,
          },
        });

        const error = await result.current.validateLccnDuplication(marcRecords);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is already used in another record', () => {
      it('should return error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ authorities: [{ id: 'id' }] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.AUTHORITY,
            action: QUICK_MARC_ACTIONS.CREATE,
          },
        });

        const error = await act(() => result.current.validateLccnDuplication(marcRecords));

        expect(mockGet).toHaveBeenCalledWith(
          'search/authorities',
          {
            searchParams: {
              limit: 1,
              query: '(lccn=="123" or lccn=="456")',
            },
          },
        );
        expect(error).toEqual({
          [fieldId]: [{ id: 'ui-quick-marc.record.error.010.lccnDuplicated' }],
        });
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is not used in any record', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ authorities: [] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.AUTHORITY,
            action: QUICK_MARC_ACTIONS.EDIT,
            id,
          },
        });

        const error = await act(() => result.current.validateLccnDuplication(marcRecords));

        expect(mockGet).toHaveBeenCalledWith(
          'search/authorities',
          {
            searchParams: {
              limit: 1,
              query: `(lccn=="123" or lccn=="456") not id=="${id}"`,
            },
          },
        );
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is disabled', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const marcRecords = [{
          id: fieldId,
          tag: '010',
          content: '$a 123 $a 456 $z 789',
        }];
        const mockGet = jest.fn(() => ({
          json: () => Promise.resolve({ authorities: [{ id: 'id' }] }),
        }));

        useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: false });

        useOkapiKy.mockReturnValue({
          get: mockGet,
        });

        const { result } = renderHook(useLccnDuplicationCheck, {
          initialProps: {
            marcType: MARC_TYPES.AUTHORITY,
          },
        });

        const error = await result.current.validateLccnDuplication(marcRecords);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });
  });

  describe('when request is rejected', () => {
    it('should display the generic error', async () => {
      const fieldId = 'field-id';
      const marcRecords = [{
        id: fieldId,
        tag: '010',
        content: '$a 123 $a 456 $z 789',
      }];
      const mockGet = jest.fn(() => ({
        json: jest.fn().mockRejectedValue({}),
      }));

      useLccnDuplicateConfig.mockReturnValue({ duplicateLccnCheckingEnabled: true });

      useOkapiKy.mockReturnValue({
        get: mockGet,
      });

      const { result } = renderHook(useLccnDuplicationCheck, {
        initialProps: {
          marcType: MARC_TYPES.AUTHORITY,
          action: QUICK_MARC_ACTIONS.CREATE,
        },
      });

      const error = await act(() => result.current.validateLccnDuplication(marcRecords));

      expect(error).toEqual({
        [fieldId]: [{
          id: 'ui-quick-marc.record.error.generic',
        }],
      });
    });
  });
});
