import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import ReactRouterPropTypes from 'react-router-prop-types';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';
import { baseManifest } from '@folio/stripes-acq-components';

import { INVENTORY_INSTANCE_API } from '../common/constants';

import QuickMarcEditor from './QuickMarcEditor';

const QuickMarcEditorContainer = ({ mutator, match, onClose }) => {
  const instanceId = match.params.instanceId;

  const [instance, setInstance] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    mutator.quickMarcEditInstance.GET()
      .then(instanceResponse => {
        setInstance(instanceResponse);
      })
      .catch(() => {
        setInstance();
      })
      .finally(() => {
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const closeEditor = useCallback(() => {
    onClose(instanceId);
  }, [instanceId, onClose]);

  if (isLoading) {
    return (
      <LoadingView
        dismissible
        onClose={closeEditor}
        defaultWidth="100%"
      />
    );
  }

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={closeEditor}
    />
  );
};

QuickMarcEditorContainer.manifest = Object.freeze({
  quickMarcEditInstance: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: `${INVENTORY_INSTANCE_API}/:{instanceId}`,
  },
});

QuickMarcEditorContainer.propTypes = {
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withRouter(stripesConnect(QuickMarcEditorContainer));
