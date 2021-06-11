import React, {
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  hydrateMarcRecord,
  validateMarcRecord,
  fillWithSlashEmptyBytesFields,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
}) => {
  const showCallout = useShowCallout();

  const onSubmit = useCallback(async (formValues) => {
    const formValuesForEdit = fillWithSlashEmptyBytesFields(formValues);
    const validationErrorMessage = validateMarcRecord(formValuesForEdit);

    if (validationErrorMessage) {
      showCallout({ messageId: validationErrorMessage, type: 'error' });

      return;
    }

    mutator.quickMarcEditMarcRecord.PUT(hydrateMarcRecord(formValuesForEdit))
      .then(() => {
        showCallout({ messageId: 'ui-quick-marc.record.save.success.processing' });
        onClose();
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

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
