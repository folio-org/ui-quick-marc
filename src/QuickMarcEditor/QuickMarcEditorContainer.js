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
  EXTERNAL_INSTANCE_APIS,
  MARC_RECORD_API,
  MARC_RECORD_STATUS_API,
  MARC_TYPES,
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
  location: ReactRouterPropTypes.location.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
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
  location,
  marcType,
}) => {
  const {
    externalId,
    instanceId,
  } = match.params;

  const [instance, setInstance] = useState();
  const [marcRecord, setMarcRecord] = useState();
  const [locations, setLocations] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const showCallout = useShowCallout();

  useEffect(() => {
    mutator.externalInstanceApi.update({
      _path: EXTERNAL_INSTANCE_APIS[marcType],
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const instancePromise = mutator.quickMarcEditInstance.GET();
    const marcRecordPromise = mutator.quickMarcEditMarcRecord.GET();
    const locationsPromise = mutator.locations.GET();

    Promise.all([instancePromise, marcRecordPromise, locationsPromise])
      .then(([instanceResponse, marcRecordResponse, locationsResponse]) => {
        const dehydratedMarcRecord = dehydrateMarcRecordResponse(marcRecordResponse);
        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, action);

        setInstance(instanceResponse);
        setMarcRecord(formattedMarcRecord);
        setLocations(locationsResponse);
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
  }, [externalId]);

  const closeEditor = useCallback(() => {
    if (marcType === MARC_TYPES.BIB) {
      onClose(externalId);
    } else {
      onClose(`${instanceId}/${externalId}`);
    }
  }, [externalId, onClose]);

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
      location={location}
      locations={locations}
      marcType={marcType}
    />
  );
};

QuickMarcEditorContainer.manifest = Object.freeze({
  externalInstanceApi: {},
  quickMarcEditInstance: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: '%{externalInstanceApi._path}/:{externalId}',
  },
  quickMarcEditMarcRecord: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: MARC_RECORD_API,
    pk: 'parsedRecordId',
    GET: {
      params: {
        externalId: ':{externalId}',
      },
    },
    headers: {
      accept: 'application/json',
    },
  },
  quickMarcRecordStatus: {
    ...baseManifest,
    fetch: false,
    path: MARC_RECORD_STATUS_API,
    accumulate: true,
  },
  locations: {
    type: 'okapi',
    records: 'locations',
    path: 'locations?limit=1000',
    accumulate: true,
    fetch: false,
  },
});

QuickMarcEditorContainer.propTypes = propTypes;

export default withRouter(stripesConnect(QuickMarcEditorContainer));
