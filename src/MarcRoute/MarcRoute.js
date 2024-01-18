import { useCallback } from 'react';
import {
  Route,
  useLocation,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { LoadingPane } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { QuickMarcEditorContainer } from '../QuickMarcEditor';
import { applyCentralTenantInHeaders } from '../QuickMarcEditor/utils';
import { useUserTenantPermissions } from '../queries';
import { QUICK_MARC_ACTIONS } from '../QuickMarcEditor/constants';

const MarcRoute = ({
  externalRecordPath,
  path,
  permission,
  routeProps,
  onClose,
  onSave,
}) => {
  const stripes = useStripes();
  const location = useLocation();

  const {
    marcType,
    action,
  } = routeProps;
  const userId = stripes?.user?.user?.id;
  const centralTenantId = stripes.user.user?.consortium?.centralTenantId;
  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType)
    && action !== QUICK_MARC_ACTIONS.CREATE;

  const {
    userPermissions: centralTenantPermissions,
    isFetching: isCentralTenantPermissionsLoading,
  } = useUserTenantPermissions({
    userId,
    tenantId: centralTenantId,
  }, {
    enabled: isRequestToCentralTenantFromMember,
  });

  const checkCentralTenantPerm = useCallback((perm) => {
    return centralTenantPermissions.some(({ permissionName }) => permissionName === perm);
  }, [centralTenantPermissions]);

  if (isCentralTenantPermissionsLoading) {
    return <LoadingPane />;
  }

  const hasPermission = permission
    ? isRequestToCentralTenantFromMember ? checkCentralTenantPerm(permission) : stripes.hasPerm(permission)
    : true;

  if (!hasPermission) {
    return null;
  }

  return (
    <Route
      path={path}
      key={path}
      render={() => (
        <QuickMarcEditorContainer
          onClose={onClose}
          onSave={onSave}
          externalRecordPath={externalRecordPath}
          onCheckCentralTenantPerm={checkCentralTenantPerm}
          {...routeProps}
        />
      )}
    />
  );
};

MarcRoute.propTypes = {
  externalRecordPath: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  permission: PropTypes.string,
  routeProps: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MarcRoute;
