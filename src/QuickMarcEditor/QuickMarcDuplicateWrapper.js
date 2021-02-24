import React, {
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';
import omit from 'lodash/omit';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';
import {
  ConfirmationModal,
} from '@folio/stripes/components';

import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  hydrateMarcRecord,
  validateMarcRecord,
} from './utils';

const QM_RECORD_STATUS_TIMEOUT = 15000;

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
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

  const getQuickMarcRecordStatus = (qmRecordId) => {
    mutator.quickMarcRecordStatus.GET({ params: { qmRecordId } })
      .then(({ instanceId }) => {
        history.push({
          pathname: `/inventory/view/${instanceId}`,
        });
      });
  };

  const onSubmit = useCallback(async (formValues) => {
    const formValuesForDuplicate = omit(formValues, 'updateInfo');
    const validationErrorMessage = validateMarcRecord(formValuesForDuplicate);

    if (validationErrorMessage) {
      showCallout({ messageId: validationErrorMessage, type: 'error' });

      return;
    }

    mutator.quickMarcEditMarcRecord.POST(hydrateMarcRecord(formValuesForDuplicate))
      .then(({ qmRecordId }) => {
        showCallout({ messageId: 'ui-quick-marc.record.save.success.processing' });

        setTimeout(() => { getQuickMarcRecordStatus(qmRecordId); }, QM_RECORD_STATUS_TIMEOUT);
      })
      .catch(async (errorResponse) => {
        let messageId;
        let error;

        try {
          error = await errorResponse.json();
        } catch (e) {
          error = {};
        }

        if (error.code === 'ILLEGAL_FIXED_LENGTH_CONTROL_FILED') {
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
    />
  );
};

QuickMarcDuplicateWrapper.propTypes = propTypes;

export default QuickMarcDuplicateWrapper;
