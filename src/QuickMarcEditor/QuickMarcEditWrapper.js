import React, {
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  validateMarcRecord,
  autopopulateSubfieldSection,
  cleanBytesFields,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.object,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  marcType,
  locations,
}) => {
  const showCallout = useShowCallout();

  const onSubmit = useCallback(async (formValues) => {
    const validationErrorMessage = validateMarcRecord(formValues, marcType);

    if (validationErrorMessage) {
      showCallout({ message: validationErrorMessage, type: 'error' });

      return null;
    }

    const autopopulateFormValues = autopopulateSubfieldSection(formValues, marcType);
    const formValuesForEdit = cleanBytesFields(autopopulateFormValues, initialValues, marcType);

    return mutator.quickMarcEditMarcRecord.PUT(hydrateMarcRecord(formValuesForEdit))
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
      locations={locations}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
