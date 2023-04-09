import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import {
  QUICK_MARC_ACTIONS,
} from './constants';
import {
  EXTERNAL_INSTANCE_APIS,
  MARC_TYPES,
} from '../common/constants';
import { removeDeletedRecords, checkControlFieldLength, validateMarcRecord, removeFieldsForDerive, autopopulateIndicators, autopopulateSubfieldSection, cleanBytesFields, combineSplitFields, hydrateMarcRecord, parseHttpError } from './utils';
import { useAuthorityLinking } from '../hooks';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  initialValues: PropTypes.object.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  onClose: PropTypes.func.isRequired,
  mutator: PropTypes.object.isRequired,
};

const QuickMarcCreateBibWrapper = ({
  action,
  onClose,
  initialValues,
  marcType,
  mutator,
  history,
  location,
}) => {
  const [httpError, setHttpError] = useState(null);
  const { linkableBibFields } = useAuthorityLinking();
  const showCallout = useShowCallout();

  const prepareForValidate = useCallback((formValues) => {
    const formValuesToSave = removeDeletedRecords(formValues);

    return formValuesToSave;
  }, []);

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesToSave = removeDeletedRecords(formValues);
    const clearFormValues = removeFieldsForDerive(formValuesToSave);
    const autopopulatedFormWithIndicators = autopopulateIndicators(clearFormValues);
    const autopopulatedFormWithSubfields = autopopulateSubfieldSection(
      autopopulatedFormWithIndicators,
      initialValues,
      marcType,
    );
    const formValuesForDerive = cleanBytesFields(autopopulatedFormWithSubfields, initialValues, marcType);

    return formValuesForDerive;
  }, [initialValues, marcType]);

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
        field.linkingRuleId = matchingLinkedField.linkingRuleId;

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

  const validate = useCallback((formValues) => {
    const formValuesForValidation = prepareForValidate(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesForValidation);

    if (controlFieldErrorMessage) {
      return controlFieldErrorMessage;
    }

    const validationErrorMessage = validateMarcRecord({
      marcRecord: formValuesForValidation,
      initialValues,
      linkableBibFields,
    });

    if (validationErrorMessage) {
      return validationErrorMessage;
    }

    return undefined;
  }, [initialValues, linkableBibFields, prepareForValidate]);

  const onSubmit = useCallback(async (formValues) => {
    const formValuesForDerive = prepareForSubmit(formValues);

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
  }, [onClose, showCallout, prepareForSubmit]);

  return (
    <QuickMarcEditor
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      httpError={httpError}
      validate={validate}
    />
  );
};

QuickMarcCreateBibWrapper.propTypes = propTypes;

export default QuickMarcCreateBibWrapper;
