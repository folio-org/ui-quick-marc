import React, {
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import {
  QUICK_MARC_ACTIONS,
  QM_RECORD_STATUS_TIMEOUT,
  QM_RECORD_STATUS_BAIL_TIME,
} from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  removeFieldsForDuplicate,
  autopopulateSubfieldSection,
  validateMarcRecord,
  cleanBytesFields,
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

  const getQuickMarcRecordStatus = (qmRecordId) => {
    const maxRequestAttempts = QM_RECORD_STATUS_BAIL_TIME / QM_RECORD_STATUS_TIMEOUT;
    let requestCount = 1;
    let intervalId;

    function makeRequest() {
      mutator.quickMarcRecordStatus.GET({ params: { qmRecordId } })
        .then(({ externalId, status }) => {
          if (status === 'ERROR') {
            clearInterval(intervalId);
            showCallout({
              messageId: 'ui-quick-marc.record.saveNew.error',
              type: 'error',
            });
          }

          if (status === 'IN_PROGRESS') {
            if (requestCount === maxRequestAttempts) {
              clearInterval(intervalId);
              showCallout({ messageId: 'ui-quick-marc.record.saveNew.delay' });
            } else {
              requestCount++;
            }
          }

          if (externalId !== null && status === 'CREATED') {
            clearInterval(intervalId);
            showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

            history.push({
              pathname: `/inventory/view/${externalId}`,
              search: location.search,
            });
          }
        })
        .catch(() => {
          showCallout({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });
        });
    }

    makeRequest();

    intervalId = setInterval(makeRequest, QM_RECORD_STATUS_TIMEOUT);
  };

  const onSubmit = useCallback(async (formValues) => {
    const clearFormValues = removeFieldsForDuplicate(formValues);
    const autopopulatedFormValues = autopopulateSubfieldSection(clearFormValues, initialValues, marcType);
    const formValuesForDuplicate = cleanBytesFields(autopopulatedFormValues, initialValues, marcType);
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

        getQuickMarcRecordStatus(qmRecordId);
      })
      .catch(async (errorResponse) => {
        let messageId;
        let error;

        try {
          error = await errorResponse.json();
        } catch (e) {
          error = {};
        }

        if (error.code === 'ILLEGAL_FIXED_LENGTH_CONTROL_FIELD') {
          messageId = 'ui-quick-marc.record.save.error.illegalFixedLength';
        } else {
          messageId = 'ui-quick-marc.record.save.error.generic';
        }

        showCallout({ messageId, type: 'error' });
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
    />
  );
};

QuickMarcDuplicateWrapper.propTypes = propTypes;

export default QuickMarcDuplicateWrapper;
