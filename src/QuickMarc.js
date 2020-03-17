import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { QuickMarcEditorContainer } from './QuickMarcEditor';

const QuickMarc = ({ basePath, onClose }) => {
  const QuickMarcEdit = useCallback(() => {
    return (
      <QuickMarcEditorContainer
        onClose={onClose}
      />
    );
  }, [onClose]);

  return (
    <div data-test-quick-marc>
      <Switch>
        <Route
          path={`${basePath}/edit/:instanceId`}
          component={QuickMarcEdit}
        />
      </Switch>
    </div>
  );
};

QuickMarc.propTypes = {
  basePath: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuickMarc;
