import {
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';

import { useStripes } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';
import { getHeaders } from '@folio/stripes-marc-components';

import { ERROR_TYPES, EXTERNAL_INSTANCE_APIS, MARC_TYPES } from '../../../common';
import {
  are010Or1xxUpdated,
  getFieldIds,
  hydrateMarcRecord,
  parseHttpError,
  recordHasLinks,
  saveLinksToNewRecord,
} from '../../utils';
import getQuickMarcRecordStatus from '../../getQuickMarcRecordStatus';
import { QuickMarcContext } from '../../../contexts';
import { useAuthorityLinking } from '../../../hooks';
import { useMarcRecordMutation } from '../../../queries';
import { QUICK_MARC_ACTIONS } from '../../constants';

const useSubmitRecord = ({
  prepareForSubmit,
  mutator,
  linksCount,
  isRequestToCentralTenantFromMember,
  tenantId,
  refreshPageData,
  onClose,
  onSave,
}) => {
  const {
    externalId: _externalId,
    instanceId: _instanceId,
  } = useParams();
  const history = useHistory();
  const location = useLocation();
  const showCallout = useShowCallout();
  const stripes = useStripes();

  const {
    action,
    marcType,
    basePath,
    initialValues,
    instance,
    validationErrorsRef,
    continueAfterSave,
    relatedRecordVersion,
  } = useContext(QuickMarcContext);

  const { actualizeLinks } = useAuthorityLinking({ marcType, action });
  const { updateMarcRecord } = useMarcRecordMutation({ tenantId });

  const [httpError, setHttpError] = useState(null);

  const { token, locale } = stripes.okapi;
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;

  const redirectToRecord = useCallback(async (externalId, instanceId) => {
    if (marcType === MARC_TYPES.HOLDINGS) {
      await onSave(`${instanceId}/${externalId}`);
    } else {
      await onSave(externalId);
    }
  }, [onSave, marcType]);

  const processEditingAfterCreation = useCallback(async (formValues, externalId) => {
    const fieldIds = getFieldIds(formValues);
    const searchParams = new URLSearchParams(location.search);

    const routes = {
      [MARC_TYPES.BIB]: `${basePath}/edit-bibliographic/${externalId}`,
      [MARC_TYPES.AUTHORITY]: `${basePath}/edit-authority/${externalId}`,
      [MARC_TYPES.HOLDINGS]: `${basePath}/edit-holdings/${externalId}`,
    };

    await refreshPageData(fieldIds, QUICK_MARC_ACTIONS.EDIT, externalId);

    history.push({
      pathname: routes[marcType],
      search: searchParams.toString(),
    });
  }, [basePath, marcType, location, history, refreshPageData]);

  const onCreate = useCallback(async (formValues, _api, complete) => {
    // if validation has any issues - cancel submit
    if (!isEmpty(validationErrorsRef.current)) {
      return complete();
    }

    const formValuesToProcess = prepareForSubmit(formValues);

    let formValuesToHydrate;

    try {
      if (marcType === MARC_TYPES.BIB) {
        formValuesToHydrate = await actualizeLinks(formValuesToProcess);
      } else {
        formValuesToHydrate = formValuesToProcess;
      }
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return null;
    }

    formValuesToHydrate._actionType = 'create';

    const formValuesForCreate = hydrateMarcRecord(formValuesToHydrate);

    return mutator.quickMarcEditMarcRecord.POST(formValuesForCreate)
      .then(async ({ qmRecordId }) => {
        const instanceId = formValues.externalId;

        showCallout({ messageId: 'ui-quick-marc.record.save.success.processing' });

        try {
          const { externalId } = await getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
            qmRecordId,
            showCallout,
          });

          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

          if (marcType === MARC_TYPES.BIB && recordHasLinks(formValuesForCreate.fields)) {
            await saveLinksToNewRecord(mutator, externalId, formValuesForCreate)
              .catch(noop);
          }

          if (continueAfterSave.current) {
            await processEditingAfterCreation(formValues, externalId);

            return;
          }

          await redirectToRecord(externalId, instanceId);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          showCallout({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });
        }
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [
    showCallout,
    prepareForSubmit,
    actualizeLinks,
    validationErrorsRef,
    marcType,
    continueAfterSave,
    mutator,
    processEditingAfterCreation,
    redirectToRecord,
  ]);

  const onEdit = useCallback(async (formValues, _api, complete) => {
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

        if (continueAfterSave.current) {
          const fieldIds = getFieldIds(formValuesToHydrate);

          await refreshPageData(fieldIds);

          return;
        }

        await redirectToRecord(_externalId, _instanceId);
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
    redirectToRecord,
  ]);

  const onDerive = useCallback(async (formValues, _api, complete) => {
    // if validation has any issues - cancel submit
    if (!isEmpty(validationErrorsRef.current)) {
      return complete();
    }

    const formValuesToProcess = prepareForSubmit(formValues);

    showCallout({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

    let formValuesToHydrate;

    try {
      formValuesToHydrate = await actualizeLinks(formValuesToProcess);
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return null;
    }

    formValuesToHydrate.relatedRecordVersion = 1;
    formValuesToHydrate._actionType = 'create';

    const formValuesForDerive = hydrateMarcRecord(formValuesToHydrate);

    return mutator.quickMarcEditMarcRecord.POST(formValuesForDerive)
      .then(async ({ qmRecordId }) => {
        if (!continueAfterSave.current) {
          onClose('id'); // https://issues.folio.org/browse/UIQM-82
        }

        try {
          const { externalId } = await getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
            qmRecordId,
            showCallout,
          });

          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

          if (continueAfterSave.current) {
            if (recordHasLinks(formValuesForDerive.fields)) {
              await saveLinksToNewRecord(mutator, externalId, formValuesForDerive)
                .catch(noop);
            }

            await processEditingAfterCreation(formValues, externalId);

            return;
          }

          if (recordHasLinks(formValuesForDerive.fields)) {
            saveLinksToNewRecord(mutator, externalId, formValuesForDerive)
              .finally(() => onClose(externalId));
          } else {
            onClose(externalId);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          showCallout({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });
        }
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [
    onClose,
    showCallout,
    prepareForSubmit,
    actualizeLinks,
    validationErrorsRef,
    continueAfterSave,
    mutator,
    processEditingAfterCreation,
  ]);

  return {
    onCreate,
    onEdit,
    onDerive,
    httpError,
  };
};

export { useSubmitRecord };
