import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
  useLocation,
} from 'react-router-dom';

import {
  IfPermission,
  checkIfUserInMemberTenant,
} from '@folio/stripes/core';
import {
  CommandList,
  LoadingPane,
} from '@folio/stripes/components';

import {
  QuickMarcEditorContainer,
  QuickMarcDeriveWrapper,
  QuickMarcCreateWrapper,
  QuickMarcEditWrapper,
} from './QuickMarcEditor';
import { useUserTenantPermissions } from './queries';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import {
  MARC_TYPES,
  keyboardCommands,
} from './common/constants';

const INVALID_PERMISSION = 'invalid-permission';

const QuickMarc = ({
  basePath,
  externalRecordPath,
  onClose,
  stripes,
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isShared = searchParams.get('shared') === 'true';

  const userId = stripes?.user?.user?.id;
  const centralTenantId = stripes.user.user?.consortium?.centralTenantId;
  const action = location.pathname.split('/')[3];

  const editMarcRecordPerm = 'ui-quick-marc.quick-marc-editor.all';

  const considerCentralTenantPerm = (
    isShared
    && ['edit-bib'].includes(action)
    && userId
    && centralTenantId
    && checkIfUserInMemberTenant(stripes)
  );

  const {
    userPermissions: centralTenantPermissions,
    isFetching: isCentralTenantPermissionsLoading,
  } = useUserTenantPermissions({
    userId,
    tenantId: centralTenantId,
  }, {
    enabled: considerCentralTenantPerm,
  });

  const hasCentralTenantPerm = (perm) => {
    return centralTenantPermissions.some(({ permissionName }) => permissionName === perm);
  };

  const editorRoutesConfig = [
    {
      path: `${basePath}/edit-bib/:externalId`,
      permission: considerCentralTenantPerm
        ? hasCentralTenantPerm(editMarcRecordPerm) ? '' : INVALID_PERMISSION
        : editMarcRecordPerm,
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
        marcType: MARC_TYPES.BIB,
      },
    },
    {
      path: `${basePath}/duplicate-bib/:externalId`,
      permission: 'ui-quick-marc.quick-marc-editor.duplicate',
      props: {
        action: QUICK_MARC_ACTIONS.DERIVE,
        wrapper: QuickMarcDeriveWrapper,
        marcType: MARC_TYPES.BIB,
      },
    },
    {
      path: `${basePath}/create-bib`,
      permission: 'ui-quick-marc.quick-marc-editor.create',
      props: {
        action: QUICK_MARC_ACTIONS.CREATE,
        wrapper: QuickMarcCreateWrapper,
        marcType: MARC_TYPES.BIB,
      },
    },
    {
      path: `${basePath}/create-holdings/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.create',
      props: {
        action: QUICK_MARC_ACTIONS.CREATE,
        wrapper: QuickMarcCreateWrapper,
        marcType: MARC_TYPES.HOLDINGS,
      },
    },
    {
      path: `${basePath}/edit-holdings/:instanceId/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.all',
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
        marcType: MARC_TYPES.HOLDINGS,
      },
    },
    {
      path: `${basePath}/create-authority`,
      permission: 'ui-quick-marc.quick-marc-authorities-editor.create',
      props: {
        action: QUICK_MARC_ACTIONS.CREATE,
        wrapper: QuickMarcCreateWrapper,
        marcType: MARC_TYPES.AUTHORITY,
      },
    },
    {
      path: `${basePath}/edit-authority/:externalId`,
      // permission: 'ui-quick-marc.quick-marc-authorities-editor.all',
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
        marcType: MARC_TYPES.AUTHORITY,
      },
    },
  ];

  if (isCentralTenantPermissionsLoading) {
    return <LoadingPane />;
  }

  return (
    <div data-test-quick-marc>
      <CommandList
        commands={keyboardCommands}
      >
        <Switch>
          {
            editorRoutesConfig.map(({
              path,
              permission,
              props: routeProps = {},
            }) => (
              <Route
                path={path}
                key={path}
                render={() => (permission
                  ? (
                    <IfPermission perm={permission}>
                      <QuickMarcEditorContainer
                        onClose={onClose}
                        externalRecordPath={externalRecordPath}
                        {...routeProps}
                      />
                    </IfPermission>
                  )
                  : (
                    <QuickMarcEditorContainer
                      onClose={onClose}
                      externalRecordPath={externalRecordPath}
                      {...routeProps}
                    />
                  )
                )}
              />
            ))
          }
        </Switch>
      </CommandList>
    </div>
  );
};

QuickMarc.propTypes = {
  basePath: PropTypes.string.isRequired,
  externalRecordPath: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  stripes: PropTypes.object.isRequired,
};

export default QuickMarc;
