import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useUserTenantPermissions } from '@folio/stripes-core';

import { useCheckCentralTenantPermission } from './useCheckCentralTenantPermission';

jest.mock('@folio/stripes-core', () => ({
  stripes: {
    user: {
      user: {
        consortium: {
          centralTenantId: 'consortium',
        },
      },
    },
  },
  useUserTenantPermissions: jest.fn(),
}));

jest.mock('../../QuickMarcEditor/utils', () => ({
  applyCentralTenantInHeaders: jest.fn().mockReturnValue(true),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useCheckCentralTenantPermission', () => {
  beforeEach(() => {
    useUserTenantPermissions.mockClear().mockReturnValue({
      isFetching: false,
      userPermissions: [{
        permissionName: 'test-permission',
      }],
    });
  });

  describe('when passing enabled: false', () => {
    it('should not load permissions', () => {
      renderHook(() => useCheckCentralTenantPermission({
        enabled: false,
      }), { wrapper });

      expect(useUserTenantPermissions).toHaveBeenCalledWith({ tenantId: 'consortia' }, expect.objectContaining({ enabled: false }));
    });
  });

  describe('when we need to make calls to central tenant', () => {
    it('should load permissions', async () => {
      const { result } = renderHook(() => useCheckCentralTenantPermission({
        enabled: true,
      }), { wrapper });

      await waitFor(() => !result.current.isCentralTenantPermissionsLoading);

      expect(result.current.centralTenantPermissions).toEqual([{ permissionName: 'test-permission' }]);
    });
  });

  describe('when calling checkCentralTenantPerm', () => {
    describe('and permission is present', () => {
      it('should return true', async () => {
        const { result } = renderHook(() => useCheckCentralTenantPermission({
          enabled: true,
        }), { wrapper });

        await waitFor(() => !result.current.isCentralTenantPermissionsLoading);

        expect(result.current.checkCentralTenantPermission('test-permission')).toEqual(true);
      });
    });

    describe('and permission is not present', () => {
      it('should return false', async () => {
        const { result } = renderHook(() => useCheckCentralTenantPermission({
          enabled: true,
        }), { wrapper });

        await waitFor(() => !result.current.isCentralTenantPermissionsLoading);

        expect(result.current.checkCentralTenantPermission('missing-permission')).toEqual(false);
      });
    });
  });
});
