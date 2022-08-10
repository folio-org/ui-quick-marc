import React, {
  useCallback,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';

import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  EXTERNAL_INSTANCE_APIS,
  MARC_TYPES,
  ERROR_TYPES,
} from '../common/constants';
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
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  marcType,
  locations,
  externalRecordPath,
  stripes,
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

    const path = EXTERNAL_INSTANCE_APIS[marcType];
    let instancePromise;

    try {
      instancePromise = await mutator.quickMarcEditInstance.GET({ path: `${path}/${marcRecord.externalId}` });
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return undefined;
    }
    const prevVersion = instance._version;
    const lastVersion = instancePromise._version;

    if (prevVersion && lastVersion && prevVersion !== lastVersion) {
      setHttpError({
        errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
        message: 'Instance cannot be updated. Depricated instance version.',
      });

      return null;
    }

    marcRecord.relatedRecordVersion = marcType === MARC_TYPES.AUTHORITY
      ? instance._version
      : searchParams.get('relatedRecordVersion');

    return mutator.quickMarcEditMarcRecord.PUT(marcRecord)
      .then(() => {
        showCallout({
          messageId: marcType === MARC_TYPES.AUTHORITY
            ? 'ui-quick-marc.record.save.updated'
            : 'ui-quick-marc.record.save.success.processing',
        });
        onClose();
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
      stripes={stripes}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
