import {
  Route,
  useHistory,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import { LoadingPane } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import { QuickMarcEditorContainer } from '../QuickMarcEditor';
import { applyCentralTenantInHeaders } from '../QuickMarcEditor/utils';
import { QUICK_MARC_ACTIONS } from '../QuickMarcEditor/constants';
import { QuickMarcProvider } from '../contexts';
import { getIsSharedFromUrl } from '../contexts/QuickMarcContext/utils';
import { useCheckCentralTenantPermission } from '../hooks';

const MarcRoute = ({
  externalRecordPath,
  path,
  permission,
  routeProps,
  basePath,
  onClose,
  onSave,
  onCreateAndKeepEditing = noop,
  fetchExternalRecord,
  locations,
}) => {
  const stripes = useStripes();
  const history = useHistory();

  const isShared = getIsSharedFromUrl(history.location.search);

  const {
    marcType,
    action,
  } = routeProps;

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(isShared, stripes, marcType)
    && action !== QUICK_MARC_ACTIONS.CREATE;

  const {
    isCentralTenantPermissionsLoading,
    checkCentralTenantPermission,
  } = useCheckCentralTenantPermission({
    isShared,
    marcType,
    action,
    enabled: true,
  });

  if (isCentralTenantPermissionsLoading) {
    return <LoadingPane />;
  }

  const hasPermission = permission
    ? isRequestToCentralTenantFromMember ? checkCentralTenantPermission(permission) : stripes.hasPerm(permission)
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
          isUsingRouter
        >
          <QuickMarcEditorContainer
            onClose={onClose}
            onSave={onSave}
            onCreateAndKeepEditing={onCreateAndKeepEditing}
            externalRecordPath={externalRecordPath}
            onCheckCentralTenantPerm={checkCentralTenantPermission}
            fetchExternalRecord={fetchExternalRecord}
            locations={locations}
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
  routeProps: PropTypes.shape({
    marcType: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
  }).isRequired,
  basePath: PropTypes.string.isRequired,
  fetchExternalRecord: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCreateAndKeepEditing: PropTypes.func,
};

export default MarcRoute;
