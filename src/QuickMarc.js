import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
} from 'react-router-dom';

import { CommandList } from '@folio/stripes/components';

import { MarcRoute } from './MarcRoute';
import {
  QuickMarcDeriveWrapper,
  QuickMarcCreateWrapper,
  QuickMarcEditWrapper,
} from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import {
  MARC_TYPES,
  keyboardCommands,
} from './common/constants';

const QuickMarc = ({
  basePath,
  externalRecordPath,
  onClose,
  onSave,
}) => {
  const editorRoutesConfig = [
    {
      path: `${basePath}/edit-bib/:externalId`,
      permission: 'ui-quick-marc.quick-marc-editor.all',
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
        marcType: MARC_TYPES.BIB,
      },
    },
    {
      path: `${basePath}/duplicate-bib/:externalId`,
      permission: 'ui-quick-marc.quick-marc-editor.duplicate.execute',
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
