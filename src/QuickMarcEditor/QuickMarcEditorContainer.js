import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import ReactRouterPropTypes from 'react-router-prop-types';
import noop from 'lodash/noop';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';
import {
  baseManifest,
  useShowCallout,
} from '@folio/stripes-acq-components';
import { getHeaders } from '@folio/stripes-marc-components';

import QuickMarcEditor from './QuickMarcEditor';
import { useAuthorityLinksCount } from '../queries';
import { QuickMarcContext } from '../contexts';
import { useSaveRecord } from './useSaveRecord';
import {
  EXTERNAL_INSTANCE_APIS,
  MARC_RECORD_API,
  MARC_RECORD_STATUS_API,
  MARC_TYPES,
  LINKING_RULES_API,
  MARC_SPEC_API,
} from '../common/constants';
import {
  dehydrateMarcRecordResponse,
  getCreateHoldingsMarcRecordResponse,
  formatMarcRecordByQuickMarcAction,
  addInternalFieldProperties,
  splitFields,
  getCreateBibMarcRecordResponse,
  getCreateAuthorityMarcRecordResponse,
  applyCentralTenantInHeaders,
} from './utils';
import { QUICK_MARC_ACTIONS } from './constants';

const propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  stripes: PropTypes.object.isRequired,
  onCheckCentralTenantPerm: PropTypes.func,
};

const createRecordDefaults = {
  [MARC_TYPES.BIB]: getCreateBibMarcRecordResponse,
  [MARC_TYPES.HOLDINGS]: getCreateHoldingsMarcRecordResponse,
  [MARC_TYPES.AUTHORITY]: getCreateAuthorityMarcRecordResponse,
};

const QuickMarcEditorContainer = ({
  mutator,
  match,
  onClose,
  onSave,
  history,
  location,
  externalRecordPath,
  stripes,
  onCheckCentralTenantPerm,
}) => {
  const {
    externalId,
    instanceId,
  } = match.params;

  const {
    action,
    marcType,
    initialValues,
    instance,
    setInstance,
    setMarcRecord,
    setRelatedRecordVersion,
  } = useContext(QuickMarcContext);
  const [locations, setLocations] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [fixedFieldSpec, setFixedFieldSpec] = useState();
  const showCallout = useShowCallout();
  const { linksCount } = useAuthorityLinksCount({ id: marcType === MARC_TYPES.AUTHORITY && externalId });

  const { token, locale } = stripes.okapi;
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType)
    && action !== QUICK_MARC_ACTIONS.CREATE;

  const getCloseEditorParams = useCallback((id) => {
    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      return `${instanceId}/${externalId}`;
    }

    return id || externalId;
  }, [action, externalId, instanceId, marcType]);

  const handleClose = useCallback((id) => {
    onClose(getCloseEditorParams(id));
  }, [getCloseEditorParams, onClose]);

  const handleSave = useCallback(async (id) => {
    await onSave(getCloseEditorParams(id));
  }, [getCloseEditorParams, onSave]);

  const externalRecordUrl = useMemo(() => {
    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      return `${externalRecordPath}/${instanceId}/${externalId}`;
    }

    return `${externalRecordPath}/${externalId}`;
  }, [externalRecordPath, marcType, externalId, instanceId, action]);

  const loadData = useCallback(async (fieldIds, nextAction, nextExternalId) => {
    const _action = nextAction || action;
    const _externalId = nextExternalId || externalId;

    const path = _action === QUICK_MARC_ACTIONS.CREATE && marcType === MARC_TYPES.HOLDINGS
      ? EXTERNAL_INSTANCE_APIS[MARC_TYPES.BIB]
      : EXTERNAL_INSTANCE_APIS[marcType];

    const headers = isRequestToCentralTenantFromMember
      ? { headers: getHeaders(centralTenantId, token, locale) }
      : {};

    const instancePromise = _action === QUICK_MARC_ACTIONS.CREATE && marcType !== MARC_TYPES.HOLDINGS
      ? Promise.resolve({})
      : mutator.quickMarcEditInstance.GET({
        path: `${path}/${_externalId}`,
        ...headers,
      });

    const marcRecordPromise = _action === QUICK_MARC_ACTIONS.CREATE
      ? Promise.resolve({})
      : mutator.quickMarcEditMarcRecord.GET({
        params: { externalId: _externalId },
        ...headers,
      });

    const locationsPromise = marcType === MARC_TYPES.HOLDINGS
      ? mutator.locations.GET(headers)
      : Promise.resolve();

    // must be with the central tenant id when user derives shared record
    const linkingRulesPromise = mutator.linkingRules.GET(headers);

    const fixedFieldSpecPromise = mutator.fixedFieldSpec.GET({
      path: `${MARC_SPEC_API}/${marcType}/008`,
      ...headers,
    });

    await Promise.all([
      instancePromise,
      marcRecordPromise,
      locationsPromise,
      linkingRulesPromise,
      fixedFieldSpecPromise,
    ])
      .then(([
        instanceResponse,
        marcRecordResponse,
        locationsResponse,
        linkingRulesResponse,
        fixedFieldSpecResponse,
      ]) => {
        let dehydratedMarcRecord;

        if (_action === QUICK_MARC_ACTIONS.CREATE) {
          dehydratedMarcRecord = createRecordDefaults[marcType](instanceResponse, fixedFieldSpecResponse);
        } else {
          dehydratedMarcRecord = dehydrateMarcRecordResponse(
            marcRecordResponse,
            marcType,
            fixedFieldSpecResponse,
            fieldIds,
          );
        }

        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, _action, marcType);
        const marcRecordWithInternalProps = addInternalFieldProperties(formattedMarcRecord);
        const marcRecordWithSplitFields = splitFields(marcRecordWithInternalProps, linkingRulesResponse);

        setRelatedRecordVersion(instanceResponse?._version);
        setInstance(instanceResponse);
        setMarcRecord(marcRecordWithSplitFields);
        setLocations(locationsResponse);
        setFixedFieldSpec(fixedFieldSpecResponse);
        setIsLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        showCallout({ messageId: 'ui-quick-marc.record.load.error', type: 'error' });
        handleClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    externalId,
    history,
    action,
    marcType,
    centralTenantId,
    token,
    locale,
    isRequestToCentralTenantFromMember,
    setRelatedRecordVersion,
  ]);

  const { onSubmit, httpError, runValidation } = useSaveRecord({
    linksCount,
    locations,
    fixedFieldSpec,
    mutator,
    refreshPageData: loadData,
    onClose: handleClose,
    onSave: handleSave,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <LoadingView
        dismissible
        onClose={handleClose}
        defaultWidth="100%"
      />
    );
  }

  return (
    <QuickMarcEditor
      action={action}
      instance={instance}
      onClose={handleClose}
      onSubmit={onSubmit}
      initialValues={initialValues}
      marcType={marcType}
      fixedFieldSpec={fixedFieldSpec}
      locations={locations}
      httpError={httpError}
      externalRecordPath={externalRecordUrl}
      confirmRemoveAuthorityLinking={action === QUICK_MARC_ACTIONS.DERIVE}
      linksCount={linksCount}
      onCheckCentralTenantPerm={onCheckCentralTenantPerm}
      validate={runValidation}
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
  fixedFieldSpec: {
    type: 'okapi',
    fetch: false,
    accumulate: true,
    path: MARC_SPEC_API,
    throwErrors: false,
  },
});

QuickMarcEditorContainer.propTypes = propTypes;
QuickMarcEditorContainer.defaultProps = {
  onCheckCentralTenantPerm: noop,
};

export default withRouter(stripesConnect(QuickMarcEditorContainer));
