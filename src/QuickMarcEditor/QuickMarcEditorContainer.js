import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  stripesConnect,
  checkIfUserInMemberTenant,
} from '@folio/stripes/core';

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
  LINKING_RULES_API,
  OKAPI_TENANT_HEADER,
} from '../common/constants';

import {
  dehydrateMarcRecordResponse,
  getCreateHoldingsMarcRecordResponse,
  formatMarcRecordByQuickMarcAction,
  addInternalFieldProperties,
  splitFields,
  getCreateBibMarcRecordResponse,
  getCreateAuthorityMarcRecordResponse,
} from './utils';
import { QUICK_MARC_ACTIONS } from './constants';
import { useAuthorityLinksCount } from '../queries';

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
  stripes: PropTypes.object.isRequired,
  wrapper: PropTypes.func.isRequired,
};

const createRecordDefaults = {
  [MARC_TYPES.BIB]: getCreateBibMarcRecordResponse,
  [MARC_TYPES.HOLDINGS]: getCreateHoldingsMarcRecordResponse,
  [MARC_TYPES.AUTHORITY]: getCreateAuthorityMarcRecordResponse,
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
  stripes,
}) => {
  const {
    externalId,
    instanceId,
  } = match.params;
  const [instance, setInstance] = useState();
  const [marcRecord, setMarcRecord] = useState();
  const [locations, setLocations] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [linksCount, setLinksCount] = useState(0);

  const searchParams = new URLSearchParams(location.search);
  const isSharedRecord = searchParams.get('shared') === 'true';

  const showCallout = useShowCallout();
  const { fetchLinksCount } = useAuthorityLinksCount();

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

    const path = action === QUICK_MARC_ACTIONS.CREATE && marcType === MARC_TYPES.HOLDINGS
      ? EXTERNAL_INSTANCE_APIS[MARC_TYPES.BIB]
      : EXTERNAL_INSTANCE_APIS[marcType];
    const centralTenantId = stripes.user.user.consortium?.centralTenantId;

    const requestOptions = {};

    if (
      isSharedRecord
      && [MARC_TYPES.BIB].includes(marcType)
      && [QUICK_MARC_ACTIONS.DERIVE, QUICK_MARC_ACTIONS.EDIT].includes(action)
      && checkIfUserInMemberTenant(stripes)
    ) {
      requestOptions.headers = {
        [OKAPI_TENANT_HEADER]: centralTenantId,
      };
    }

    const instancePromise = action === QUICK_MARC_ACTIONS.CREATE && marcType !== MARC_TYPES.HOLDINGS
      ? Promise.resolve({})
      : mutator.quickMarcEditInstance.GET({
        path: `${path}/${externalId}`,
        ...requestOptions,
      });

    const marcRecordPromise = action === QUICK_MARC_ACTIONS.CREATE
      ? Promise.resolve({})
      : mutator.quickMarcEditMarcRecord.GET({
        params: { externalId },
        ...requestOptions,
      });

    const locationsPromise = mutator.locations.GET();
    const linkingRulesPromise = mutator.linkingRules.GET(requestOptions);

    const linksCountPromise = marcType === MARC_TYPES.AUTHORITY
      ? fetchLinksCount([externalId])
      : Promise.resolve();

    await Promise.all([instancePromise, marcRecordPromise, locationsPromise, linksCountPromise, linkingRulesPromise])
      .then(([instanceResponse, marcRecordResponse, locationsResponse, linksCountResponse, linkingRulesResponse]) => {
        if (marcType === MARC_TYPES.AUTHORITY) {
          setLinksCount(linksCountResponse.links[0].totalLinks);
        }

        if (action !== QUICK_MARC_ACTIONS.CREATE) {
          searchParams.set('relatedRecordVersion', instanceResponse._version);

          history.replace({
            search: searchParams.toString(),
          });
        }

        let dehydratedMarcRecord;

        if (action === QUICK_MARC_ACTIONS.CREATE) {
          dehydratedMarcRecord = createRecordDefaults[marcType](instanceResponse);
        } else {
          dehydratedMarcRecord = dehydrateMarcRecordResponse(marcRecordResponse, marcType);
        }

        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, action, marcType);
        const marcRecordWithInternalProps = addInternalFieldProperties(formattedMarcRecord);
        const marcRecordWithSplitFields = splitFields(marcRecordWithInternalProps, linkingRulesResponse);

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
  }, [
    externalId,
    history,
    marcType,
    fetchLinksCount,
    stripes,
    isSharedRecord,
  ]);

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
      linksCount={linksCount}
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
  linkingRules: {
    type: 'okapi',
    fetch: false,
    accumulate: true,
    path: LINKING_RULES_API,
    throwErrors: false,
  },
});

QuickMarcEditorContainer.propTypes = propTypes;

export default withRouter(stripesConnect(QuickMarcEditorContainer));
