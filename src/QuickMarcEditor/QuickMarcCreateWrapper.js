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
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  removeFieldsForDuplicate,
  autopopulateSubfieldSection,
  validateMarcRecord,
  checkControlFieldLength,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  location: ReactRouterPropTypes.location.isRequired,
  locations: PropTypes.object.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const QuickMarcCreateWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  history,
  location,
  marcType,
  locations,
}) => {
  const showCallout = useShowCallout();
  const [httpError, setHttpError] = useState(null);

  const onSubmit = useCallback(async (formValues) => {
    const formValuesToSave = removeDeletedRecords(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesToSave);

    if (controlFieldErrorMessage) {
      showCallout({ message: controlFieldErrorMessage, type: 'error' });

      return null;
    }

    const autopopulatedFormValues = autopopulateSubfieldSection(
      removeFieldsForDuplicate(formValuesToSave),
      initialValues,
      marcType,
    );
    const formValuesForCreate = cleanBytesFields(autopopulatedFormValues, initialValues, marcType);
    const validationErrorMessage = validateMarcRecord(formValuesForCreate, initialValues, marcType, locations);

    if (validationErrorMessage) {
      showCallout({ message: validationErrorMessage, type: 'error' });

      return null;
    }

    return mutator.quickMarcEditMarcRecord.POST(hydrateMarcRecord(formValuesForCreate))
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

          const path = `/inventory/view/${instanceId}/${externalId}`;

          history.push({
            pathname: path,
            search: location.search,
          });
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

QuickMarcCreateWrapper.propTypes = propTypes;

export default QuickMarcCreateWrapper;
