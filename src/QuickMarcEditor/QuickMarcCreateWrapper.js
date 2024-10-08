import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import flow from 'lodash/flow';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';

import { useShowCallout } from '@folio/stripes-acq-components';
import { useStripes } from '@folio/stripes/core';

import QuickMarcEditor from './QuickMarcEditor';
import { QuickMarcContext } from '../contexts';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import {
  useAuthorityLinking,
  useValidation,
} from '../hooks';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  formatLeaderForSubmit,
  autopopulateSubfieldSection,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
  saveLinksToNewRecord,
  recordHasLinks,
  combineSplitFields,
  autopopulateFixedField,
  autopopulatePhysDescriptionField,
  autopopulateMaterialCharsField,
  autopopulateIndicators,
  removeRowsWithoutContent,
  applyCentralTenantInHeaders,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  locations: PropTypes.object.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  fixedFieldSpec: PropTypes.object.isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

const QuickMarcCreateWrapper = ({
  action,
  instance,
  onClose,
  onSave,
  initialValues,
  mutator,
  marcType,
  fixedFieldSpec,
  locations,
}) => {
  const stripes = useStripes();
  const location = useLocation();
  const showCallout = useShowCallout();
  const [httpError, setHttpError] = useState(null);
  const { linkableBibFields, actualizeLinks, linkingRules, sourceFiles } = useAuthorityLinking({ marcType, action });
  const { validationErrorsRef } = useContext(QuickMarcContext);

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(location, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

  const validationContext = useMemo(() => ({
    initialValues,
    marcType,
    action: QUICK_MARC_ACTIONS.CREATE,
    locations,
    linkableBibFields,
    linkingRules,
    sourceFiles,
    fixedFieldSpec,
    instanceId: instance.id,
  }), [initialValues, marcType, locations, linkableBibFields, linkingRules, sourceFiles, fixedFieldSpec, instance.id]);
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

  const redirectToRecord = useCallback(async (externalId, instanceId) => {
    if (marcType === MARC_TYPES.HOLDINGS) {
      await onSave(`${instanceId}/${externalId}`);
    } else {
      await onSave(externalId);
    }
  }, [onSave, marcType]);

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

          await redirectToRecord(externalId, instanceId);
        } catch (e) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onClose,
    showCallout,
    prepareForSubmit,
    actualizeLinks,
    validationErrorsRef,
  ]);

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      fixedFieldSpec={fixedFieldSpec}
      httpError={httpError}
      validate={runValidation}
    />
  );
};

QuickMarcCreateWrapper.propTypes = propTypes;

export default QuickMarcCreateWrapper;
