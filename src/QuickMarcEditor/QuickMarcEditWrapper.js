import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import flow from 'lodash/flow';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';

import { useStripes } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';
import { getHeaders } from '@folio/stripes-marc-components';

import QuickMarcEditor from './QuickMarcEditor';
import {
  useAuthorityLinking,
  useValidation,
} from '../hooks';
import { useMarcRecordMutation } from '../queries';
import { QuickMarcContext } from '../contexts';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  EXTERNAL_INSTANCE_APIS,
  MARC_TYPES,
  ERROR_TYPES,
} from '../common/constants';
import {
  hydrateMarcRecord,
  formatLeaderForSubmit,
  autopopulateIndicators,
  autopopulateSubfieldSection,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
  combineSplitFields,
  are010Or1xxUpdated,
  removeDuplicateSystemGeneratedFields,
  autopopulateFixedField,
  autopopulatePhysDescriptionField,
  autopopulateMaterialCharsField,
  applyCentralTenantInHeaders,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  linksCount: PropTypes.number,
  refreshPageData: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  fixedFieldSpec: PropTypes.object.isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCheckCentralTenantPerm: PropTypes.func,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  onSave,
  initialValues,
  mutator,
  marcType,
  fixedFieldSpec,
  linksCount,
  locations,
  refreshPageData,
  externalRecordPath,
  onCheckCentralTenantPerm,
}) => {
  const stripes = useStripes();
  const showCallout = useShowCallout();
  const location = useLocation();
  const [httpError, setHttpError] = useState(null);
  const { validationErrorsRef, relatedRecordVersion } = useContext(QuickMarcContext);

  const { token, locale } = stripes.okapi;
  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

  const { linkableBibFields, actualizeLinks, linkingRules } = useAuthorityLinking({ marcType, action });
  const { updateMarcRecord } = useMarcRecordMutation({ tenantId });

  const validationContext = useMemo(() => ({
    initialValues,
    marcType,
    action: QUICK_MARC_ACTIONS.EDIT,
    locations,
    linksCount,
    naturalId: instance.naturalId,
    linkableBibFields,
    linkingRules,
    fixedFieldSpec,
    instanceId: instance.id,
  }), [
    initialValues,
    marcType,
    locations,
    linkableBibFields,
    linkingRules,
    fixedFieldSpec,
    linksCount,
    instance.naturalId,
    instance.id,
  ]);
  const { validate } = useValidation(validationContext, tenantId);

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesToSave = flow(
      removeDeletedRecords,
      removeDuplicateSystemGeneratedFields,
      marcRecord => formatLeaderForSubmit(marcType, marcRecord),
      autopopulateIndicators,
      marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
      autopopulatePhysDescriptionField,
      autopopulateMaterialCharsField,
      marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
      marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec, marcType),
      combineSplitFields,
    )(formValues);

    return formValuesToSave;
  }, [marcType, fixedFieldSpec]);

  const runValidation = useCallback(async (formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);

    return validate(formValuesForValidation.records);
  }, [validate, prepareForSubmit]);

  const onSubmit = useCallback(async (formValues, _api, complete) => {
    let is1xxOr010Updated = false;

    // if validation has any issues - cancel submit
    if (!isEmpty(validationErrorsRef.current)) {
      return complete();
    }

    if (marcType === MARC_TYPES.AUTHORITY && linksCount > 0) {
      is1xxOr010Updated = are010Or1xxUpdated(initialValues.records, formValues.records);
    }

    const formValuesToProcess = prepareForSubmit(formValues);

    const path = EXTERNAL_INSTANCE_APIS[marcType];

    const fetchInstance = async () => {
      const fetchedInstance = await mutator.quickMarcEditInstance.GET({
        path: `${path}/${formValuesToProcess.externalId}`,
        ...(isRequestToCentralTenantFromMember && { headers: getHeaders(centralTenantId, token, locale) }),
      });

      return fetchedInstance;
    };

    let formValuesToHydrate;
    let instanceResponse;

    try {
      const actualizeLinksPromise = marcType === MARC_TYPES.BIB
        ? actualizeLinks(formValuesToProcess)
        : Promise.resolve(formValuesToProcess);

      const [
        formValuesWithActualizedLinkedFields,
        instanceData,
      ] = await Promise.all([
        actualizeLinksPromise,
        fetchInstance(),
      ]);

      formValuesToHydrate = formValuesWithActualizedLinkedFields;
      instanceResponse = instanceData;
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return undefined;
    }

    const prevVersion = instance._version;
    const lastVersion = instanceResponse._version;

    if (!isNil(prevVersion) && !isNil(lastVersion) && prevVersion !== lastVersion) {
      setHttpError({
        errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
        message: 'ui-quick-marc.record.save.error.derive',
      });

      return null;
    }

    formValuesToHydrate._actionType = 'edit';
    formValuesToHydrate.relatedRecordVersion = marcType === MARC_TYPES.AUTHORITY
      ? instance._version
      : relatedRecordVersion;

    const formValuesToSave = hydrateMarcRecord(formValuesToHydrate);

    return updateMarcRecord(formValuesToSave)
      .then(async () => {
        if (is1xxOr010Updated) {
          const values = {
            count: linksCount,
          };

          showCallout({
            messageId: 'ui-quick-marc.record.save.updatingLinkedBibRecords',
            values,
          });
        } else {
          showCallout({
            messageId: 'ui-quick-marc.record.save.success.processing',
          });
        }

        const fieldIds = formValuesToHydrate.records.slice(1).map(field => field.id);

        await refreshPageData(fieldIds);

        return { version: parseInt(formValuesToSave.relatedRecordVersion, 10) + 1 };
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [
    showCallout,
    refreshPageData,
    initialValues,
    instance,
    marcType,
    mutator,
    linksCount,
    prepareForSubmit,
    actualizeLinks,
    centralTenantId,
    token,
    locale,
    updateMarcRecord,
    isRequestToCentralTenantFromMember,
    validationErrorsRef,
    relatedRecordVersion,
  ]);

  return (
    <QuickMarcEditor
      mutator={mutator}
      instance={instance}
      onClose={onClose}
      onSave={onSave}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      fixedFieldSpec={fixedFieldSpec}
      locations={locations}
      httpError={httpError}
      externalRecordPath={externalRecordPath}
      linksCount={linksCount}
      onCheckCentralTenantPerm={onCheckCentralTenantPerm}
      validate={runValidation}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;
QuickMarcEditWrapper.defaultProps = {
  onCheckCentralTenantPerm: noop,
};

export default QuickMarcEditWrapper;
