import { useOkapiKy } from '@folio/stripes/core';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useLccnDuplicationCheck } from './useLccnDuplicationCheck';
import { useLccnDuplicateConfig } from '../../queries';
import { MARC_TYPES } from '../../common/constants';

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useLccnDuplicateConfig: jest.fn(),
}));

describe('useLccnDuplicationCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when marc type is bib', () => {
    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is already used in a record', () => {
      it('should return error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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
          },
        });

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).toHaveBeenCalledWith(
          'search/instances?limit=1&query=(lccn=="123" or lccn=="456" and source=="MARC")',
        );
        expect(error).toEqual({
          [fieldId]: { id: 'ui-quick-marc.record.error.010.lccnDuplicated' },
        });
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is not used in any record', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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
          },
        });

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).toHaveBeenCalledWith(
          'search/instances?limit=1&query=(lccn=="123" or lccn=="456" and source=="MARC")',
        );
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is disabled', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });
  });

  describe('when marc type is authority', () => {
    describe('when 010 field is absent', () => {
      it('should not return an error', async () => {
        const formValues = {
          records: [{}],
        };
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

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is already used in a record', () => {
      it('should return error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).toHaveBeenCalledWith('search/authorities?limit=1&query=(lccn=="123" or lccn=="456")');
        expect(error).toEqual({
          [fieldId]: { id: 'ui-quick-marc.record.error.010.lccnDuplicated' },
        });
      });
    });

    describe('when duplicateLccnCheckingEnabled is enabled and LCCN is not used in any record', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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
          },
        });

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).toHaveBeenCalledWith('search/authorities?limit=1&query=(lccn=="123" or lccn=="456")');
        expect(error).toBeUndefined();
      });
    });

    describe('when duplicateLccnCheckingEnabled is disabled', () => {
      it('should not return an error', async () => {
        const fieldId = 'field-id';
        const formValues = {
          records: [{
            id: fieldId,
            tag: '010',
            content: '$a 123 $a 456 $z 789',
          }],
        };
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

        const error = await result.current.validateLccnDuplication(formValues);

        expect(mockGet).not.toHaveBeenCalled();
        expect(error).toBeUndefined();
      });
    });
  });
});
