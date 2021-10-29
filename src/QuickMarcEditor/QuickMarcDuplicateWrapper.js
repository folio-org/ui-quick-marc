import React, {
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';
import {
  ConfirmationModal,
} from '@folio/stripes/components';

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
  const [isCancellationModalOpened, setIsCancellationModalOpened] = useState(false);

  const showCallout = useShowCallout();

  const closeEditor = () => setIsCancellationModalOpened(true);

  const onConfirmCancellationModal = () => {
    setIsCancellationModalOpened(false);
  };

  const onCloseCancellationModal = () => {
    setIsCancellationModalOpened(false);
    onClose();
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

    return mutator.quickMarcEditMarcRecord.POST(hydrateMarcRecord(formValuesForDuplicate))
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

  const getCancellationModal = () => (
    <ConfirmationModal
      id="quick-marc-cancallation-modal"
      open={isCancellationModalOpened}
      onConfirm={onConfirmCancellationModal}
      onCancel={onCloseCancellationModal}
      heading={<FormattedMessage id="ui-quick-marc.record.cancellationModal.title" />}
      message={<FormattedMessage id="ui-quick-marc.record.cancellationModal.message" />}
      cancelLabel={<FormattedMessage id="ui-quick-marc.record.cancellationModal.cancel" />}
      confirmLabel={<FormattedMessage id="ui-quick-marc.record.cancellationModal.confirm" />}
    />
  );

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={closeEditor}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      getCancellationModal={getCancellationModal}
      marcType={marcType}
    />
  );
};

QuickMarcDuplicateWrapper.propTypes = propTypes;

export default QuickMarcDuplicateWrapper;
