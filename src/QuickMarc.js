import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  useLocation,
} from 'react-router-dom';

import { CommandList } from '@folio/stripes/components';

import { MarcRoute } from './MarcRoute';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import {
  MARC_TYPES,
  keyboardCommands,
} from './common/constants';
import { QuickMarcProvider } from './contexts';
import { QuickMarcEditorContainer } from './QuickMarcEditor';

const QuickMarc = ({
  action,
  marcType,
  basePath,
  externalRecordPath,
  onClose,
  onSave,
  externalId,
  initialValue,
}) => {
  const location = useLocation();

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

  const useRouting = false;

  return (
    <div data-test-quick-marc>
      <CommandList
        commands={keyboardCommands}
      >
        {useRouting ? (
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
                />
              ))
            }
          </Switch>
        ) : (
          <QuickMarcProvider
            action={action}
            marcType={marcType}
            basePath={basePath}
          >
            <QuickMarcEditorContainer
              onClose={onClose}
              onSave={onSave}
              externalRecordPath={externalRecordPath}
              onCheckCentralTenantPerm={() => true}
              externalId={externalId}
              initialValue={initialValue}
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
};

export default QuickMarc;
