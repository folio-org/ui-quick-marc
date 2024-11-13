import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  useHistory,
  useLocation, useParams,
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
  redirectToRecord,
  removeDeletedRecords,
  removeRowsWithoutContent,
  saveLinksToNewRecord,
} from '../utils';
import { MARC_TYPES } from '../../common';
import getQuickMarcRecordStatus from '../getQuickMarcRecordStatus';

const useMarcCreate = ({
  linksCount,
  locations,
  fixedFieldSpec,
  mutator,
  refreshPageData,
  onSave,
}) => {
  const history = useHistory();
  const location = useLocation();
  const stripes = useStripes();
  const showCallout = useShowCallout();

  const {
    action,
    marcType,
    initialValues,
    instance,
    validationErrorsRef,
    continueAfterSave,
    basePath,
  } = useContext(QuickMarcContext);

  const [httpError, setHttpError] = useState(null);

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

  const {
    linkableBibFields,
    linkingRules,
    sourceFiles,
    actualizeLinks,
  } = useAuthorityLinking({ marcType, action });

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
      removeRowsWithoutContent,
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

          await redirectToRecord(externalId, instanceId, marcType, onSave);
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
    basePath,
    location,
    history,
    refreshPageData,
    onSave,
  ]);

  return {
    onSubmit,
    httpError,
    runValidation,
  };
};

export { useMarcCreate };
