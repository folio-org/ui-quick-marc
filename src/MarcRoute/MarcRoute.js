import { useCallback } from 'react';
import {
  Route,
  useLocation,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { LoadingPane } from '@folio/stripes/components';
import {
  useStripes,
  useUserTenantPermissions,
} from '@folio/stripes/core';

import { QuickMarcEditorContainer } from '../QuickMarcEditor';
import { applyCentralTenantInHeaders } from '../QuickMarcEditor/utils';
import { QUICK_MARC_ACTIONS } from '../QuickMarcEditor/constants';
import { QuickMarcProvider } from '../contexts';

const MarcRoute = ({
  externalRecordPath,
  path,
  permission,
  routeProps,
  basePath,
  onClose,
  onSave,
}) => {
  const stripes = useStripes();
  const location = useLocation();

  const {
    marcType,
    action,
  } = routeProps;
  const centralTenantId = stripes.user.user?.consortium?.centralTenantId;

  const searchParams = new URLSearchParams(location.search);

  // in the rest of the code we get `isShared` from context, but this components is where we first
  // use the QuickMarcProvider, so we can't access it yet. just get the value from the url
  const isSharedRecord = searchParams.get('shared') === 'true';

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(isSharedRecord, stripes, marcType)
    && action !== QUICK_MARC_ACTIONS.CREATE;

  const {
    userPermissions: centralTenantPermissions,
    isFetching: isCentralTenantPermissionsLoading,
  } = useUserTenantPermissions({
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
        <QuickMarcProvider
          action={action}
          marcType={marcType}
          basePath={basePath}
        >
          <QuickMarcEditorContainer
            onClose={onClose}
            onSave={onSave}
            externalRecordPath={externalRecordPath}
            onCheckCentralTenantPerm={checkCentralTenantPerm}
          />
        </QuickMarcProvider>
      )}
    />
  );
};

MarcRoute.propTypes = {
  externalRecordPath: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  permission: PropTypes.string,
  routeProps: PropTypes.object.isRequired,
  basePath: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MarcRoute;
