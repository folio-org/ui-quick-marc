import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { useStripes } from '@folio/stripes/core';
import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import { useAuthorityLinkingRules } from '../queries';
import {
  QUICK_MARC_ACTIONS,
} from './constants';
import {
  MARC_TYPES,
  EXTERNAL_INSTANCE_APIS,
} from '../common/constants';
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
} from './utils';

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
  const stripes = useStripes();
  const [httpError, setHttpError] = useState(null);

  const { linkingRules } = useAuthorityLinkingRules();

  const saveLinksToNewRecord = async (externalId, marcRecord) => {
    // request derived Instance record
    const instancePromise = mutator.quickMarcEditInstance.GET({ path: `${EXTERNAL_INSTANCE_APIS[MARC_TYPES.BIB]}/${externalId}` });
    // request derived MARC Bib record
    const marcPromise = mutator.quickMarcEditMarcRecord.GET({ params: { externalId } });

    Promise.all([instancePromise, marcPromise]).then(([{ _version }, derivedRecord]) => {
      // copy linking data to new record
      derivedRecord.fields = derivedRecord.fields.map((field) => {
        // matching field from POST request
        const matchingLinkedField = marcRecord.fields
          .find(_field => _field.authorityId && _field.tag === field.tag && _field.authorityId === field.authorityId);

        if (!matchingLinkedField) {
          return field;
        }

        field.authorityNaturalId = matchingLinkedField.authorityNaturalId;
        field.authorityControlledSubfields = matchingLinkedField.authorityControlledSubfields;

        return field;
      });

      derivedRecord.relatedRecordVersion = parseInt(_version, 10);
      mutator.quickMarcEditMarcRecord.PUT(derivedRecord)
        .finally(() => {
          history.push({
            pathname: `/inventory/view/${externalId}`,
            search: location.search,
          });
        });
    });
  };

  const onSubmit = useCallback(async (formValues) => {
    const formValuesToSave = removeDeletedRecords(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesToSave);

    if (controlFieldErrorMessage) {
      showCallout({ message: controlFieldErrorMessage, type: 'error' });

      return null;
    }

    const clearFormValues = removeFieldsForDerive(formValuesToSave);
    const autopopulatedFormWithIndicators = autopopulateIndicators(clearFormValues);
    const autopopulatedFormWithSubfields = autopopulateSubfieldSection(
      autopopulatedFormWithIndicators,
      initialValues,
      marcType,
    );
    const formValuesForDerive = cleanBytesFields(autopopulatedFormWithSubfields, initialValues, marcType);
    const validationErrorMessage = validateMarcRecord({
      marcRecord: formValuesForDerive,
      initialValues,
      linkingRules,
      stripes,
      action,
    });

    if (validationErrorMessage) {
      showCallout({ message: validationErrorMessage, type: 'error' });

      return null;
    }

    showCallout({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

    const formValuesWithCombinedFields = combineSplitFields(formValuesForDerive);
    const marcRecord = hydrateMarcRecord(formValuesWithCombinedFields);

    marcRecord.relatedRecordVersion = 1;

    return mutator.quickMarcEditMarcRecord.POST(marcRecord)
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

          saveLinksToNewRecord(externalId, marcRecord);
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
  }, [onClose, showCallout, stripes, linkingRules, action]);

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
    />
  );
};

QuickMarcDeriveWrapper.propTypes = propTypes;

export default QuickMarcDeriveWrapper;
