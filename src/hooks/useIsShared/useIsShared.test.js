import {
  useHistory,
} from 'react-router-dom';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import { useIsShared } from './useIsShared';
import Harness from '../../../test/jest/helpers/harness';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn().mockReturnValue({
    replace: jest.fn(),
  }),
}));

const getWrapper = (extraProps = {}) => props => (
  <Harness
    {...props}
    {...extraProps}
  />
);

describe('useIsShared', () => {
  describe('when there is "shared=true" in the url', () => {
    beforeEach(() => {
      useHistory.mockClear().mockReturnValue({
        location: {
          search: '?shared=true',
        },
      });
    });

    it('should return isShared=true', () => {
      const { result } = renderHook(() => useIsShared(), {
        wrapper: getWrapper(),
      });

      expect(result.current.isShared).toBeTruthy();
    });
  });

  describe('when there is "shared=false" in the url', () => {
    beforeEach(() => {
      useHistory.mockClear().mockReturnValue({
        location: {
          search: '?shared=false',
        },
      });
    });

    it('should return isShared=false', () => {
      const { result } = renderHook(() => useIsShared(), {
        wrapper: getWrapper(),
      });

      expect(result.current.isShared).toBeFalsy();
    });
  });

  describe('when setIsShared is called', () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
      useHistory.mockClear().mockReturnValue({
        location: {
          pathname: '/',
          search: '?shared=false',
        },
        replace: mockReplace,
      });
    });

    it('should update isShared value', () => {
      const { result } = renderHook(() => useIsShared(), {
        wrapper: getWrapper(),
      });

      expect(result.current.isShared).toBeFalsy();

      result.current.setIsShared(true);

      waitFor(() => expect(result.current.isShared).toBeTruthy());
    });

    it('should call replace url parameter with updated shared value', () => {
      const { result } = renderHook(() => useIsShared(), {
        wrapper: getWrapper(),
      });

      expect(result.current.isShared).toBeFalsy();

      result.current.setIsShared(true);

      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/',
        search: 'shared=true',
      });
    });
  });
});
