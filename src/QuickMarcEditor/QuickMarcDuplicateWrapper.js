import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import {
  QUICK_MARC_ACTIONS,
} from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  removeFieldsForDuplicate,
  autopopulateIndicators,
  autopopulateSubfieldSection,
  validateMarcRecord,
  checkControlFieldLength,
  cleanBytesFields,
  parseHttpError,
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

const QuickMarcDuplicateWrapper = ({
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
  const [httpError, setHttpError] = useState(null);

  const onSubmit = useCallback(async (formValues) => {
    const controlFieldErrorMessage = checkControlFieldLength(formValues);

    if (controlFieldErrorMessage) {
      showCallout({ message: controlFieldErrorMessage, type: 'error' });

      return null;
    }

    const clearFormValues = removeFieldsForDuplicate(formValues);
    const autopopulatedFormWithIndicators = autopopulateIndicators(clearFormValues);
    const autopopulatedFormWithSubfields = autopopulateSubfieldSection(
      autopopulatedFormWithIndicators,
      initialValues,
      marcType,
    );
    const formValuesForDuplicate = cleanBytesFields(autopopulatedFormWithSubfields, initialValues, marcType);
    const validationErrorMessage = validateMarcRecord(formValuesForDuplicate, initialValues);

    if (validationErrorMessage) {
      showCallout({ message: validationErrorMessage, type: 'error' });

      return null;
    }

    showCallout({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

    const marcRecord = hydrateMarcRecord(formValuesForDuplicate);

    marcRecord.relatedRecordVersion = 1;

    return mutator.quickMarcEditMarcRecord.POST(marcRecord)
      .then(({ qmRecordId }) => {
        history.push({
          pathname: '/inventory/view/id',
          search: location.search,
        });

        getQuickMarcRecordStatus({
          quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
          qmRecordId,
          showCallout,
          history,
          location,
        });
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, showCallout]);

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      httpError={httpError}
    />
  );
};

QuickMarcDuplicateWrapper.propTypes = propTypes;

export default QuickMarcDuplicateWrapper;
