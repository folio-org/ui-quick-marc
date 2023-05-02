import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import { useAuthorityLinking } from '../hooks';
import { useAuthorityLinkingRules } from '../queries';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  removeFieldsForDerive,
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
  const { linkableBibFields } = useAuthorityLinking();
  const { linkingRules } = useAuthorityLinkingRules();

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesToSave = removeDeletedRecords(formValues);
    const autopopulatedFormValues = autopopulateSubfieldSection(
      removeFieldsForDerive(formValuesToSave),
      initialValues,
      marcType,
    );
    const formValuesForCreate = cleanBytesFields(autopopulatedFormValues, initialValues, marcType);

    return formValuesForCreate;
  }, [initialValues, marcType]);

  const validate = useCallback((formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesForValidation);

    if (controlFieldErrorMessage) {
      return controlFieldErrorMessage;
    }

    const validationErrorMessage = validateMarcRecord({
      marcRecord: formValuesForValidation,
      initialValues,
      marcType,
      locations,
      linkableBibFields,
      linkingRules,
    });

    if (validationErrorMessage) {
      return validationErrorMessage;
    }

    return undefined;
  }, [initialValues, locations, marcType, linkableBibFields, linkingRules, prepareForSubmit]);

  const redirectToRecord = (externalId, instanceId) => {
    let path;

    if (marcType === MARC_TYPES.HOLDINGS) {
      path = `/inventory/view/${instanceId}/${externalId}`;
    } else if (marcType === MARC_TYPES.BIB) {
      path = `/inventory/view/${externalId}`;
    }

    history.push({
      pathname: path,
      search: location.search,
    });
  };

  const onSubmit = useCallback(async (formValues) => {
    const formValuesForCreate = prepareForSubmit(formValues);
    const marcRecord = hydrateMarcRecord(formValuesForCreate);
    marcRecord._actionType = 'create';

    return mutator.quickMarcEditMarcRecord.POST(marcRecord)
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

          redirectToRecord(externalId, instanceId);
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
      instance={instance}
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

QuickMarcCreateWrapper.propTypes = propTypes;

export default QuickMarcCreateWrapper;
