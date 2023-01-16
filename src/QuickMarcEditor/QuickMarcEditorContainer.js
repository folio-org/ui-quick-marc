import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
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
  getCreateMarcRecordResponse,
  formatMarcRecordByQuickMarcAction,
  addInternalFieldProperties,
  splitFields,
} from './utils';
import { QUICK_MARC_ACTIONS } from './constants';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  onClose: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  resources: PropTypes.object.isRequired,
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
  externalRecordPath,
  resources,
}) => {
  const {
    externalId,
    instanceId,
  } = match.params;
  const [instance, setInstance] = useState();
  const [marcRecord, setMarcRecord] = useState();
  const [locations, setLocations] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const relatedRecordVersion = searchParams.get('relatedRecordVersion');

  const showCallout = useShowCallout();

  const closeEditor = useCallback(() => {
    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      onClose(`${instanceId}/${externalId}`);
    } else {
      onClose(externalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalId, onClose]);

  const externalRecordUrl = useMemo(() => {
    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      return `${externalRecordPath}/${instanceId}/${externalId}`;
    }

    return `${externalRecordPath}/${externalId}`;
  }, [externalRecordPath, marcType, externalId, instanceId, action]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const path = action === QUICK_MARC_ACTIONS.CREATE
      ? EXTERNAL_INSTANCE_APIS[MARC_TYPES.BIB]
      : EXTERNAL_INSTANCE_APIS[marcType];

    const instancePromise = mutator.quickMarcEditInstance.GET({ path: `${path}/${externalId}` });
    const marcRecordPromise = action === QUICK_MARC_ACTIONS.CREATE
      ? Promise.resolve({})
      : mutator.quickMarcEditMarcRecord.GET({ params: { externalId } });
    const locationsPromise = mutator.locations.GET();

    await Promise.all([instancePromise, marcRecordPromise, locationsPromise])
      .then(([instanceResponse, marcRecordResponse, locationsResponse]) => {
        if (action !== QUICK_MARC_ACTIONS.CREATE) {
          searchParams.set('relatedRecordVersion', instanceResponse._version);

          history.replace({
            search: searchParams.toString(),
          });
        }

        const dehydratedMarcRecord = action === QUICK_MARC_ACTIONS.CREATE
          ? getCreateMarcRecordResponse(instanceResponse)
          : dehydrateMarcRecordResponse(marcRecordResponse);

        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, action);
        const marcRecordWithInternalProps = addInternalFieldProperties(formattedMarcRecord);
        const marcRecordWithSplitFields = splitFields(marcRecordWithInternalProps);

        setInstance(instanceResponse);
        setMarcRecord(marcRecordWithSplitFields);
        setLocations(locationsResponse);
        setIsLoading(false);
      })
      .catch(() => {
        showCallout({ messageId: 'ui-quick-marc.record.load.error', type: 'error' });
        closeEditor();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalId, relatedRecordVersion, history]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      refreshPageData={loadData}
      externalRecordPath={externalRecordUrl}
      resources={resources}
    />
  );
};

QuickMarcEditorContainer.manifest = Object.freeze({
  quickMarcEditInstance: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
  },
  quickMarcEditMarcRecord: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: MARC_RECORD_API,
    pk: 'parsedRecordId',
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
