import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';
import flow from 'lodash/flow';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { useStripes } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';

import { QuickMarcContext } from '../../contexts';
import {
  useAuthorityLinking,
  useValidation,
} from '../../hooks';
import {
  applyCentralTenantInHeaders,
  autopopulateFixedField,
  autopopulateIndicators,
  autopopulateMaterialCharsField,
  autopopulatePhysDescriptionField,
  autopopulateSubfieldSection,
  cleanBytesFields,
  combineSplitFields,
  formatLeaderForSubmit,
  hydrateMarcRecord,
  parseHttpError,
  processEditingAfterCreation,
  recordHasLinks,
  removeDeletedRecords,
  removeEnteredDate,
  removeFieldsForDerive,
  saveLinksToNewRecord,
} from '../utils';
import getQuickMarcRecordStatus from '../getQuickMarcRecordStatus';

const useMarcDerive = ({
  linksCount,
  locations,
  fixedFieldSpec,
  mutator,
  refreshPageData,
  onClose,
}) => {
  const history = useHistory();
  const location = useLocation();
  const stripes = useStripes();
  const showCallout = useShowCallout();

  const [httpError, setHttpError] = useState(null);

  const {
    action,
    marcType,
    initialValues,
    instance,
    validationErrorsRef,
    continueAfterSave,
    basePath,
  } = useContext(QuickMarcContext);

  const {
    linkableBibFields,
    linkingRules,
    sourceFiles,
    actualizeLinks,
  } = useAuthorityLinking({ marcType, action });

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

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
      removeFieldsForDerive,
      removeEnteredDate,
      autopopulateIndicators,
      marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
      autopopulatePhysDescriptionField,
      autopopulateMaterialCharsField,
      marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
      marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec, marcType),
      marcRecord => formatLeaderForSubmit(marcType, marcRecord),
      combineSplitFields,
    )(formValues);

    return formValuesForCreate;
  }, [marcType, fixedFieldSpec]);

  const runValidation = useCallback(async (formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);

    return validate(formValuesForValidation.records);
  }, [validate, prepareForSubmit]);

  const onSubmit = useCallback(async (formValues, _api, complete) => {
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

            await processEditingAfterCreation(
              formValues,
              externalId,
              basePath,
              location,
              history,
              refreshPageData,
              marcType,
            );

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
    basePath,
    history,
    location,
    refreshPageData,
    marcType,
  ]);

  return {
    onSubmit,
    httpError,
    runValidation,
  };
};

export { useMarcDerive };
