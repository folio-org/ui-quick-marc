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
        <QuickMarcEditorContainer
          onClose={onClose}
        />
    );
  }, [onClose]);

  return (
    <div data-test-quick-marc>
      <Switch>
        <IfPermission perm="records-editor.records.item.get">
          <Route
            path={`${basePath}/edit/:instanceId`}
            component={QuickMarcEdit}
          />
        </IfPermission>
      </Switch>
    </div>
  );
};

QuickMarc.propTypes = {
  basePath: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuickMarc;
