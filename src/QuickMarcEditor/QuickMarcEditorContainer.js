import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import PropTypes, { object } from 'prop-types';
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
  onCreateAndKeepEditing: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  mutator: PropTypes.object.isRequired,
  stripes: PropTypes.object.isRequired,
  externalId: PropTypes.string.isRequired,
  instanceId: PropTypes.string.isRequired,
  onCheckCentralTenantPerm: PropTypes.func,
  initialValues: PropTypes.shape({
    leader: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(object).isRequired,
    marcFormat: PropTypes.string.isRequired,
    sourceVersion: PropTypes.number.isRequired,
    externalId: PropTypes.string.isRequired,
    updateInfo: PropTypes.object.isRequired,
  }),
  isPreEdited: PropTypes.bool.isRequired,
  fetchExternalRecord: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
};

const createRecordDefaults = {
  [MARC_TYPES.BIB]: getCreateBibMarcRecordResponse,
  [MARC_TYPES.HOLDINGS]: getCreateHoldingsMarcRecordResponse,
  [MARC_TYPES.AUTHORITY]: getCreateAuthorityMarcRecordResponse,
};

const QuickMarcEditorContainer = ({
  mutator,
  onClose,
  onSave,
  onCreateAndKeepEditing,
  externalRecordPath,
  stripes,
  externalId: externalIdProp,
  instanceId: instanceIdProp,
  locations = [],
  onCheckCentralTenantPerm = noop,
  fetchExternalRecord,
  match,
  initialValues: initialValuesProp,
  isPreEdited,
}) => {
  const {
    action,
    marcType,
    initialValues,
    instance,
    setInstance,
    setMarcRecord,
    setPreEditedValues,
    getIsShared,
    isUsingRouter,
  } = useContext(QuickMarcContext);
  const [isLoading, setIsLoading] = useState(true);
  const [fixedFieldSpec, setFixedFieldSpec] = useState();
  const showCallout = useShowCallout();

  const externalId = externalIdProp || match.params.externalId;
  const instanceId = instanceIdProp || match.params.instanceId;

  const { linksCount } = useAuthorityLinksCount({ id: marcType === MARC_TYPES.AUTHORITY && externalId });

  const { token, locale } = stripes.okapi;
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;

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

  const handleCreateAndKeepEditing = useCallback(async (id) => {
    await onCreateAndKeepEditing(getCloseEditorParams(id));
  }, [getCloseEditorParams, onCreateAndKeepEditing]);

  const formatInitialValues = useCallback((marcRecord, _action, linkingRulesResponse) => {
    const formattedMarcRecord = formatMarcRecordByQuickMarcAction(marcRecord, _action, marcType);
    const marcRecordWithInternalProps = addInternalFieldProperties(formattedMarcRecord);
    const marcRecordWithSplitFields = splitFields(marcRecordWithInternalProps, linkingRulesResponse);

    return marcRecordWithSplitFields;
  }, [marcType]);

  const externalRecordUrl = useMemo(() => {
    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      return `${externalRecordPath}/${instanceId}/${externalId}`;
    }

    return `${externalRecordPath}/${externalId}`;
  }, [externalRecordPath, marcType, externalId, instanceId, action]);

  const loadData = useCallback(async (fieldIds, nextAction, nextExternalId) => {
    const _action = nextAction || action;
    const _externalId = nextExternalId || externalId;

    const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(getIsShared(), stripes, marcType)
      && _action !== QUICK_MARC_ACTIONS.CREATE;

    const headers = isRequestToCentralTenantFromMember
      ? { headers: getHeaders(centralTenantId, token, locale) }
      : {};

    // need to use `isRequestInstanceFromCentralTenant` for instance requests because
    // when we're creating a MARC Holdings record for a shared Instance
    // we need to only send the Instance request to the central tenant.
    // the rest of the requests should go to a member tenant.
    // `isRequestToCentralTenantFromMember` doesn't check for a specific condition that we're creating
    // a MARC Holdings record for a shared Instance from a member tenant, so it would send an Instance request
    // to a member tenant

    const instancePromise = _action === QUICK_MARC_ACTIONS.CREATE && marcType !== MARC_TYPES.HOLDINGS
      ? Promise.resolve({})
      : fetchExternalRecord();

    const marcRecordPromise = _action === QUICK_MARC_ACTIONS.CREATE
      ? Promise.resolve({})
      : mutator.quickMarcEditMarcRecord.GET({
        params: { externalId: _externalId },
        ...headers,
      });

    // must be with the central tenant id when user derives shared record
    const linkingRulesPromise = mutator.linkingRules.GET(headers);

    const fixedFieldSpecPromise = mutator.fixedFieldSpec.GET({
      path: `${MARC_SPEC_API}/${marcType}/008`,
      ...headers,
    });

    await Promise.all([
      instancePromise,
      marcRecordPromise,
      linkingRulesPromise,
      fixedFieldSpecPromise,
    ])
      .then(([
        instanceResponse,
        marcRecordResponse,
        linkingRulesResponse,
        fixedFieldSpecResponse,
      ]) => {
        let dehydratedMarcRecord;

        const isShouldUseInitialValuesProp = initialValuesProp && !isUsingRouter && !isPreEdited;
        const isLoadingDataAfterKeepEditing = Boolean(fieldIds);

        if (_action === QUICK_MARC_ACTIONS.CREATE) {
          if (isShouldUseInitialValuesProp) {
            dehydratedMarcRecord = dehydrateMarcRecordResponse(
              initialValuesProp,
              marcType,
              fixedFieldSpecResponse,
            );
          } else {
            dehydratedMarcRecord = createRecordDefaults[marcType](instanceResponse, fixedFieldSpecResponse);
          }
        } else {
          // if we're initializing after Save&keep editing - then we need to ignore `initialValuesProp` to not initialize with old data
          // otherwise if we're just entering Edit mode - initialize with initial values or values from response
          let dataToInitializeWith = null;

          if (isLoadingDataAfterKeepEditing || !isShouldUseInitialValuesProp) {
            dataToInitializeWith = marcRecordResponse;
          } else {
            dataToInitializeWith = initialValuesProp;
          }

          dehydratedMarcRecord = dehydrateMarcRecordResponse(
            dataToInitializeWith,
            marcType,
            fixedFieldSpecResponse,
            fieldIds,
          );
        }

        setInstance(instanceResponse);
        setMarcRecord(formatInitialValues(dehydratedMarcRecord, _action, linkingRulesResponse));

        // if using pre-edited initial values - then format them the same way and save in quickMARC context
        // so we can then update form values with them
        if (!isLoadingDataAfterKeepEditing && isPreEdited) {
          const dehydratedPreEditedMarcRecord = dehydrateMarcRecordResponse(
            initialValuesProp,
            marcType,
            fixedFieldSpecResponse,
            [],
          );

          setPreEditedValues(formatInitialValues(dehydratedPreEditedMarcRecord, _action, linkingRulesResponse));
        }

        setFixedFieldSpec(fixedFieldSpecResponse);
        setIsLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        showCallout({ messageId: 'ui-quick-marc.record.load.error', type: 'error' });
        handleClose();
      });
  }, [
    externalId,
    action,
    marcType,
    centralTenantId,
    token,
    locale,
    getIsShared,
    stripes,
    fetchExternalRecord,
    handleClose,
    mutator,
    formatInitialValues,
    initialValuesProp,
    isPreEdited,
    isUsingRouter,
    setInstance,
    setMarcRecord,
    setPreEditedValues,
    showCallout,
  ]);

  const { onSubmit, httpError, runValidation } = useSaveRecord({
    linksCount,
    locations,
    fixedFieldSpec,
    mutator,
    refreshPageData: loadData,
    onClose: handleClose,
    onSave: handleSave,
    onCreateAndKeepEditing: handleCreateAndKeepEditing,
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

export default withRouter(stripesConnect(QuickMarcEditorContainer));
