import { useCallback } from 'react';

import {
  useStripes,
  useUserTenantPermissions,
} from '@folio/stripes/core';

import { applyCentralTenantInHeaders } from '../../QuickMarcEditor/utils';
import { QUICK_MARC_ACTIONS } from '../../QuickMarcEditor/constants';

export const useCheckCentralTenantPermission = ({ enabled, isShared, marcType, action }) => {
  const stripes = useStripes();

  const centralTenantId = stripes.user.user?.consortium?.centralTenantId;

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(isShared, stripes, marcType)
    && action !== QUICK_MARC_ACTIONS.CREATE;

  const {
    userPermissions: centralTenantPermissions,
    isFetching: isCentralTenantPermissionsLoading,
  } = useUserTenantPermissions({
    tenantId: centralTenantId,
  }, {
    enabled: Boolean(enabled && isRequestToCentralTenantFromMember),
  });

  const checkCentralTenantPermission = useCallback((perm) => {
    return centralTenantPermissions.some(({ permissionName }) => permissionName === perm);
  }, [centralTenantPermissions]);

  return {
    isCentralTenantPermissionsLoading,
    centralTenantPermissions,
    checkCentralTenantPermission,
  };
};
