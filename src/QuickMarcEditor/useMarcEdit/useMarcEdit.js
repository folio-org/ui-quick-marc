import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  useLocation,
  useParams,
} from 'react-router-dom';
import flow from 'lodash/flow';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

import { useStripes } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';
import { getHeaders } from '@folio/stripes-marc-components';

import { QuickMarcContext } from '../../contexts';
import {
  useAuthorityLinking,
  useValidation,
} from '../../hooks';
import {
  applyCentralTenantInHeaders,
  are010Or1xxUpdated,
  autopopulateFixedField,
  autopopulateIndicators,
  autopopulateMaterialCharsField,
  autopopulatePhysDescriptionField,
  autopopulateSubfieldSection,
  cleanBytesFields,
  combineSplitFields,
  formatLeaderForSubmit,
  getFieldIds,
  hydrateMarcRecord,
  parseHttpError,
  redirectToRecord,
  removeDeletedRecords,
  removeDuplicateSystemGeneratedFields,
} from '../utils';
import {
  ERROR_TYPES,
  EXTERNAL_INSTANCE_APIS,
  MARC_TYPES,
} from '../../common';
import { useMarcRecordMutation } from '../../queries';

const useMarcEdit = ({
  linksCount,
  locations,
  fixedFieldSpec,
  mutator,
  refreshPageData,
  onSave,
}) => {
  const {
    externalId: _externalId,
    instanceId: _instanceId,
  } = useParams();
  const location = useLocation();
  const stripes = useStripes();
  const showCallout = useShowCallout();

  const {
    action,
    marcType,
    initialValues,
    instance,
    validationErrorsRef,
    relatedRecordVersion,
    continueAfterSave,
  } = useContext(QuickMarcContext);

  const [httpError, setHttpError] = useState(null);

  const { token, locale } = stripes.okapi;
  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

  const {
    linkableBibFields,
    linkingRules,
    sourceFiles,
    actualizeLinks,
  } = useAuthorityLinking({ marcType, action });

  const { updateMarcRecord } = useMarcRecordMutation({ tenantId });

  const validationContext = useMemo(() => ({
    initialValues,
    marcType,
    action,
    linkableBibFields,
    linkingRules,
    fixedFieldSpec,
    instanceId: instance?.id,
    sourceFiles,
    linksCount,
    naturalId: instance?.naturalId,
    locations,
  }), [
    action,
    instance?.naturalId,
    linksCount,
    initialValues,
    marcType,
    locations,
    linkableBibFields,
    linkingRules,
    sourceFiles,
    fixedFieldSpec,
    instance?.id,
  ]);

  const { validate } = useValidation(validationContext, tenantId);

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesForCreate = flow(
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

    return formValuesForCreate;
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
    const fn = () => Promise.resolve()

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

        if (continueAfterSave.current) {
          const fieldIds = getFieldIds(formValuesToHydrate);

          await refreshPageData(fieldIds);

          return;
        }

        await redirectToRecord(_externalId, _instanceId, marcType, onSave);
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
    _externalId,
    _instanceId,
    continueAfterSave,
    onSave,
  ]);

  return {
    onSubmit,
    httpError,
    runValidation,
  };
};

export { useMarcEdit };
