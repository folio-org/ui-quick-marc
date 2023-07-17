import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import flow from 'lodash/flow';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import { useAuthorityLinking } from '../hooks';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  removeFieldsForDerive,
  autopopulateIndicators,
  autopopulateSubfieldSection,
  validateMarcRecord,
  checkControlFieldLength,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
  combineSplitFields,
  saveLinksToNewRecord,
  recordHasLinks,
  autopopulateFixedField,
  removeEnteredDate,
  autopopulatePhysDescriptionField,
  autopopulateMaterialCharsField,
} from './utils';
import { useAuthorityLinkingRules } from '../queries';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  location: ReactRouterPropTypes.location.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const QuickMarcDeriveWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  history,
  location,
  marcType,
}) => {
  const showCallout = useShowCallout();
  const { linkableBibFields, actualizeLinks } = useAuthorityLinking();
  const { linkingRules } = useAuthorityLinkingRules();
  const [httpError, setHttpError] = useState(null);

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesForDerive = flow(
      removeDeletedRecords,
      removeFieldsForDerive,
      removeEnteredDate,
      autopopulateIndicators,
      marcRecord => autopopulateFixedField(marcRecord, marcType),
      autopopulatePhysDescriptionField,
      autopopulateMaterialCharsField,
      marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
      marcRecord => cleanBytesFields(marcRecord, marcType),
    )(formValues);

    return formValuesForDerive;
  }, [marcType]);

  const validate = useCallback((formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesForValidation);

    if (controlFieldErrorMessage) {
      return controlFieldErrorMessage;
    }

    const validationErrorMessage = validateMarcRecord({
      marcRecord: formValuesForValidation,
      initialValues,
      linkableBibFields,
      linkingRules,
    });

    if (validationErrorMessage) {
      return validationErrorMessage;
    }

    return undefined;
  }, [prepareForSubmit, initialValues, linkableBibFields, linkingRules]);

  const redirectToRecord = (externalId) => {
    history.push({
      pathname: `/inventory/view/${externalId}`,
      search: location.search,
    });
  };

  const onSubmit = useCallback(async (formValues) => {
    const formValuesToProcess = flow(
      prepareForSubmit,
      combineSplitFields,
      hydrateMarcRecord,
    )(formValues);

    showCallout({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

    let formValuesForDerive;

    try {
      formValuesForDerive = await actualizeLinks(formValuesToProcess);
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return null;
    }

    formValuesForDerive.relatedRecordVersion = 1;
    formValuesForDerive._actionType = 'create';

    return mutator.quickMarcEditMarcRecord.POST(formValuesForDerive)
      .then(async ({ qmRecordId }) => {
        history.push({
          pathname: '/inventory/view/id',
          search: location.search,
        });

        try {
          const { externalId } = await getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
            qmRecordId,
            showCallout,
          });

          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

          if (recordHasLinks(formValuesForDerive.fields)) {
            saveLinksToNewRecord(mutator, externalId, formValuesForDerive)
              .finally(() => redirectToRecord(externalId));
          } else {
            redirectToRecord(externalId);
          }
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
  }, [onClose, showCallout, prepareForSubmit, actualizeLinks]);

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      httpError={httpError}
      confirmRemoveAuthorityLinking
      validate={validate}
    />
  );
};

QuickMarcDeriveWrapper.propTypes = propTypes;

export default QuickMarcDeriveWrapper;
