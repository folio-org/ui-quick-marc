import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { IfPermission } from '@folio/stripes/core';
import { CommandList } from '@folio/stripes/components';

import {
  QuickMarcEditorContainer,
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
      permission: 'ui-quick-marc.quick-marc-editor.duplicate',
      props: {
        action: QUICK_MARC_ACTIONS.DERIVE,
        wrapper: QuickMarcDeriveWrapper,
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
};

export default QuickMarc;
