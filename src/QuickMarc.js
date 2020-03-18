import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { IfPermission } from '@folio/stripes/core';

import { QuickMarcEditorContainer } from './QuickMarcEditor';

const QuickMarc = ({ basePath, onClose }) => {
  const QuickMarcEdit = useCallback(() => {
    return (
      <IfPermission perm="records-editor.records.collection.get">
        <QuickMarcEditorContainer
          onClose={onClose}
        />
      </IfPermission>
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
