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

    return mutator.quickMarcEditMarcRecord.POST(marcRecord)
      .then(async ({ qmRecordId }) => {
        history.push({
          pathname: '/inventory/view',
          search: location.search,
        });

        try {
          await getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
            qmRecordId,
            showCallout,
          });

          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });
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
