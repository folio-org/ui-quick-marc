import React, {
  useCallback,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  validateMarcRecord,
  checkControlFieldLength,
  autopopulateIndicators,
  autopopulateSubfieldSection,
  cleanBytesFields,
  parseHttpError,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.object.isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  history,
  mutator,
  marcType,
  locations,
  externalRecordPath,
}) => {
  const showCallout = useShowCallout();
  const location = useLocation();
  const [httpError, setHttpError] = useState(null);

  const searchParams = new URLSearchParams(location.search);

  const onSubmit = useCallback(async (formValues) => {
    const controlFieldErrorMessage = checkControlFieldLength(formValues);
    const validationErrorMessage = validateMarcRecord(formValues, initialValues, marcType, locations);
    const errorMessage = controlFieldErrorMessage || validationErrorMessage;

    if (errorMessage) {
      showCallout({
        message: errorMessage,
        type: 'error',
      });

      return null;
    }

    const autopopulatedFormWithIndicators = autopopulateIndicators(formValues);
    const autopopulatedFormWithSubfields = autopopulateSubfieldSection(
      autopopulatedFormWithIndicators,
      initialValues,
      marcType,
    );
    const formValuesForEdit = cleanBytesFields(autopopulatedFormWithSubfields, initialValues, marcType);

    const marcRecord = hydrateMarcRecord(formValuesForEdit);

    marcRecord.relatedRecordVersion = marcType === MARC_TYPES.AUTHORITY
      ? instance._version
      : searchParams.get('relatedRecordVersion');

    return mutator.quickMarcEditMarcRecord.PUT(marcRecord)
      .then(({ actionId }) => {
        getQuickMarcRecordStatus({
          quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
          actionId,
          action,
          marcType,
          onClose,
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
      locations={locations}
      httpError={httpError}
      externalRecordPath={externalRecordPath}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
