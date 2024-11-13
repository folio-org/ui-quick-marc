import React, { useMemo } from 'react';
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
import { useMarcCreate } from './QuickMarcEditor/useMarcCreate';
import { useMarcEdit } from './QuickMarcEditor/useMarcEdit';
import { useMarcDerive } from './QuickMarcEditor/useMarcDerive';

const createUseMarcActionHandler = (action) => {
  const marcActionHooks = {
    [QUICK_MARC_ACTIONS.CREATE]: useMarcCreate,
    [QUICK_MARC_ACTIONS.EDIT]: useMarcEdit,
    [QUICK_MARC_ACTIONS.DERIVE]: useMarcDerive,
  };

  return marcActionHooks[action];
};

const QuickMarc = ({
  basePath,
  externalRecordPath,
  onClose,
  onSave,
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
  const [, page, action] = location.pathname.match(/\/((edit|create|derive)-(bibliographic|authority|holdings))/) || [];

  const useMarcActionHandler = useMemo(() => createUseMarcActionHandler(action), [action]);

  const editorRoutesConfig = [
    {
      path: `${basePath}/:action-bibliographic/:externalId?`,
      permission: permissionsMap[page],
      props: {
        action,
        marcType: MARC_TYPES.BIB,
        useMarcActionHandler,
      },
    },
    {
      path: `${basePath}/:action-authority/:externalId?`,
      permission: permissionsMap[page],
      props: {
        action,
        marcType: MARC_TYPES.AUTHORITY,
        useMarcActionHandler,
      },
    },
    {
      path: `${basePath}/create-holdings/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.create',
      props: {
        action,
        marcType: MARC_TYPES.HOLDINGS,
        useMarcActionHandler,
      },
    },
    {
      path: `${basePath}/edit-holdings/:instanceId/:externalId`,
      permission: 'ui-quick-marc.quick-marc-holdings-editor.all',
      props: {
        action,
        marcType: MARC_TYPES.HOLDINGS,
        useMarcActionHandler,
      },
    },
  ];

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
