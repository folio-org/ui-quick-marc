import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { IfPermission } from '@folio/stripes/core';
import {
  QuickMarcEditorContainer,
  QuickMarcDuplicateWrapper,
  QuickMarcCreateWrapper,
  QuickMarcEditWrapper,
} from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';
import { MARC_TYPES } from './common/constants';

const QuickMarc = ({ basePath, onClose }) => {
  const routesConfig = [
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
        action: QUICK_MARC_ACTIONS.DUPLICATE,
        wrapper: QuickMarcDuplicateWrapper,
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
  ];

  return (
    <div data-test-quick-marc>
      <Switch>
        {
          routesConfig.map(({
            path,
            permission,
            props: routeProps = {},
          }) => (
            <Route
              path={path}
              key={path}
              render={() => (
                <IfPermission perm={permission}>
                  <QuickMarcEditorContainer
                    onClose={onClose}
                    {...routeProps}
                  />
                </IfPermission>
              )}
            />
          ))
        }
      </Switch>
    </div>
  );
};

QuickMarc.propTypes = {
  basePath: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuickMarc;
