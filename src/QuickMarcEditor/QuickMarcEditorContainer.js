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
import {
  baseManifest,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  INVENTORY_INSTANCE_API,
  MARC_RECORD_API,
  MARC_RECORD_STATUS_API,
} from '../common/constants';

import {
  dehydrateMarcRecordResponse,
  formatMarcRecordByQuickMarcAction,
} from './utils';
import { QUICK_MARC_ACTIONS } from './constants';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  onClose: PropTypes.func.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  wrapper: PropTypes.func.isRequired,
};

const QuickMarcEditorContainer = ({
  action,
  mutator,
  match,
  onClose,
  wrapper: Wrapper,
  history,
}) => {
  const instanceId = match.params.instanceId;

  const [instance, setInstance] = useState();
  const [marcRecord, setMarcRecord] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const showCallout = useShowCallout();

  useEffect(() => {
    setIsLoading(true);

    const instancePromise = mutator.quickMarcEditInstance.GET();
    const marcRecordPromise = mutator.quickMarcEditMarcRecord.GET();

    Promise.all([instancePromise, marcRecordPromise])
      .then(([instanceResponse, marcRecordResponse]) => {
        const dehydratedMarcRecord = dehydrateMarcRecordResponse(marcRecordResponse);
        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, action);

        setInstance(instanceResponse);
        setMarcRecord(formattedMarcRecord);
      })
      .catch(() => {
        setInstance();
        setMarcRecord();

        showCallout({ messageId: 'ui-quick-marc.record.load.error', type: 'error' });
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
    <Wrapper
      instance={instance}
      onClose={closeEditor}
      initialValues={marcRecord}
      action={action}
      mutator={mutator}
      history={history}
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
  quickMarcEditMarcRecord: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: MARC_RECORD_API,
    pk: 'parsedRecordId',
    GET: {
      params: {
        instanceId: ':{instanceId}',
      },
    },
    headers: {
      accept: 'application/json',
    },
  },
  quickMarcRecordStatus: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: MARC_RECORD_STATUS_API,
  },
});

QuickMarcEditorContainer.propTypes = propTypes;

export default withRouter(stripesConnect(QuickMarcEditorContainer));
