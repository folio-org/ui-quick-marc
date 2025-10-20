import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  useLocation,
} from 'react-router-dom';
import noop from 'lodash/noop';

import { CommandList } from '@folio/stripes/components';

import { MarcRoute } from './MarcRoute';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import {
  MARC_TYPES,
  keyboardCommands,
} from './common/constants';
import { QuickMarcProvider } from './contexts';
import { QuickMarcEditorContainer } from './QuickMarcEditor';
import { useCheckCentralTenantPermission } from './hooks';

const QuickMarc = ({
  basePath,
  externalRecordPath,
  action,
  marcType,
  instanceId,
  externalId,
  isShared,
  onClose,
  onSave,
  initialValues,
  onCreateAndKeepEditing = noop,
  useRoutes = true,
  isPreEdited = false,
}) => {
  const location = useLocation();

  // this call is only needed for non-route approach.
  // for route-based quickMARC this hook will be called in <MarcRoute>
  const { checkCentralTenantPermission } = useCheckCentralTenantPermission({
    isShared,
    marcType,
    action,
    enabled: !useRoutes,
  });

  const permissionsMap = {
    'create-bibliographic': 'ui-quick-marc.quick-marc-editor.create',
    'edit-bibliographic': 'ui-quick-marc.quick-marc-editor.all',
    'derive-bibliographic': 'ui-quick-marc.quick-marc-editor.derive.execute',
    'create-authority': 'ui-quick-marc.quick-marc-authorities-editor.create',
    'edit-authority': '', // ui-quick-marc.quick-marc-authorities-editor.all
  };

  // .../some-path/create-bibliographic => [, create-bibliographic, create, bibliographic]
  const [, page, actionFromRoute] = location.pathname.match(/\/((edit|create|derive)-(bibliographic|authority|holdings))/) || [];

  const editorRoutesConfig = [
    {
      path: `${basePath}/:action-bibliographic/:externalId?`,
      permission: permissionsMap[page],
      props: {
        action: actionFromRoute,
        marcType: MARC_TYPES.BIB,
      },
    },
    {
      path: `${basePath}/:action-authority/:externalId?`,
      permission: permissionsMap[page],
      props: {
        action: actionFromRoute,
        marcType: MARC_TYPES.AUTHORITY,
      },
    },
    {
      path: `${basePath}/create-holdings/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.create',
      props: {
        action: QUICK_MARC_ACTIONS.CREATE,
        marcType: MARC_TYPES.HOLDINGS,
      },
    },
    {
      path: `${basePath}/edit-holdings/:instanceId/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.all',
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        marcType: MARC_TYPES.HOLDINGS,
      },
    },
  ];

  return (
    <div data-test-quick-marc>
      <CommandList
        commands={keyboardCommands}
      >
        {useRoutes ? (
          <Switch>
            {
              editorRoutesConfig.map(({
                path,
                permission,
                props: routeProps = {},
              }) => (
                <MarcRoute
                  externalRecordPath={externalRecordPath}
                  key={path}
                  path={path}
                  permission={permission}
                  routeProps={routeProps}
                  basePath={basePath}
                  onClose={onClose}
                  onSave={onSave}
                  onCreateAndKeepEditing={onCreateAndKeepEditing}
                />
              ))
            }
          </Switch>
        ) : (
          <QuickMarcProvider
            action={action}
            marcType={marcType}
            basePath={basePath}
            isShared={isShared}
          >
            <QuickMarcEditorContainer
              onClose={onClose}
              onSave={onSave}
              onCreateAndKeepEditing={onCreateAndKeepEditing}
              externalRecordPath={externalRecordPath}
              onCheckCentralTenantPerm={checkCentralTenantPermission}
              externalId={externalId}
              instanceId={instanceId}
              initialValues={initialValues}
              isPreEdited={isPreEdited}
            />
          </QuickMarcProvider>
        )}
      </CommandList>
    </div>
  );
};

QuickMarc.propTypes = {
  basePath: PropTypes.string.isRequired,
  externalRecordPath: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  action: PropTypes.string,
  marcType: PropTypes.string,
  instanceId: PropTypes.string,
  externalId: PropTypes.string,
  isShared: PropTypes.bool,
  useRoutes: PropTypes.bool,
  initialValues: PropTypes.shape({
    leader: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
      tag: PropTypes.string.isRequired,
      indicators: PropTypes.arrayOf(PropTypes.string),
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      isProtected: PropTypes.bool.isRequired,
    })).isRequired,
    marcFormat: PropTypes.string.isRequired,
    sourceVersion: PropTypes.number.isRequired,
    externalId: PropTypes.string.isRequired,
    updateInfo: PropTypes.shape({
      recordState: PropTypes.string.isRequired,
      updatedDate: PropTypes.string.isRequired,
      updatedBy: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        username: PropTypes.string,
        lastName: PropTypes.string,
        firstName: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }),
};

export default QuickMarc;
