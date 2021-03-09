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
  QuickMarcEditWrapper,
} from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './QuickMarcEditor/constants';

const QuickMarc = ({ basePath, onClose }) => {
  const routesConfig = [
    {
      path: `${basePath}/edit/:instanceId`,
      permission: 'records-editor.records.item.put',
      props: {
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
      },
    },
    {
      path: `${basePath}/duplicate/:instanceId`,
      permission: 'records-editor.records.item.post',
      props: {
        action: QUICK_MARC_ACTIONS.DUPLICATE,
        wrapper: QuickMarcDuplicateWrapper,
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
