import React, {
  useCallback,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import flow from 'lodash/flow';
import map from 'lodash/map';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import { useAuthorityLinking } from '../hooks';
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
  removeDeletedRecords,
  combineSplitFields,
  are010Or1xxUpdated,
  removeDuplicateSystemGeneratedFields,
} from './utils';
import { useAuthorityLinkingRules } from '../queries';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  linksCount: PropTypes.number,
  refreshPageData: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  marcType,
  linksCount,
  locations,
  refreshPageData,
  externalRecordPath,
}) => {
  const showCallout = useShowCallout();
  const location = useLocation();
  const [httpError, setHttpError] = useState(null);
  const { linkableBibFields } = useAuthorityLinking();
  const { linkingRules } = useAuthorityLinkingRules();

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesToSave = flow(
      removeDeletedRecords,
      removeDuplicateSystemGeneratedFields,
    )(formValues);

    return formValuesToSave;
  }, []);

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
      linksCount,
      naturalId: instance.naturalId,
      linkableBibFields,
      linkingRules,
    });

    if (validationErrorMessage) {
      return validationErrorMessage;
    }

    return undefined;
  }, [
    initialValues,
    linksCount,
    locations,
    marcType,
    prepareForSubmit,
    instance.naturalId,
    linkableBibFields,
    linkingRules,
  ]);

  const onSubmit = useCallback(async (formValues) => {
    let is1xxOr010Updated = false;

    if (marcType === MARC_TYPES.AUTHORITY && linksCount > 0) {
      is1xxOr010Updated = are010Or1xxUpdated(initialValues.records, formValues.records);
    }

    const formValuesToSave = flow(
      prepareForSubmit,
      autopopulateIndicators,
      map(marcRecord => autopopulateSubfieldSection(marcRecord, marcType)),
      map(marcRecord => cleanBytesFields(marcRecord, initialValues, marcType)),
      combineSplitFields,
      hydrateMarcRecord,
    )(formValues);

    const path = EXTERNAL_INSTANCE_APIS[marcType];

    const fetchInstance = async () => {
      const fetchedInstance = await mutator.quickMarcEditInstance.GET({ path: `${path}/${formValuesToSave.externalId}` });

      return fetchedInstance;
    };

    let instanceResponse;

    try {
      instanceResponse = await fetchInstance();
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return undefined;
    }

    const prevVersion = instance._version;
    const lastVersion = instanceResponse._version;

    if (prevVersion && lastVersion && prevVersion !== lastVersion) {
      setHttpError({
        errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
        message: 'ui-quick-marc.record.save.error.derive',
      });

      return null;
    }

    formValuesToSave._actionType = 'edit';
    formValuesToSave.relatedRecordVersion = marcType === MARC_TYPES.AUTHORITY
      ? instance._version
      : new URLSearchParams(location.search).get('relatedRecordVersion');

    return mutator.quickMarcEditMarcRecord.PUT(formValuesToSave)
      .then(async () => {
        if (is1xxOr010Updated) {
          const values = {
            count: linksCount,
          };

          showCallout({
            messageId: 'ui-quick-marc.record.save.updatingLinkedBibRecords',
            values,
          });
        } else {
          showCallout({
            messageId: marcType === MARC_TYPES.AUTHORITY
              ? 'ui-quick-marc.record.save.updated'
              : 'ui-quick-marc.record.save.success.processing',
          });
        }

        await refreshPageData();

        return { version: parseInt(formValuesToSave.relatedRecordVersion, 10) + 1 };
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [
    showCallout,
    refreshPageData,
    initialValues,
    instance,
    marcType,
    mutator,
    linksCount,
    location,
    prepareForSubmit,
  ]);

  return (
    <QuickMarcEditor
      mutator={mutator}
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      locations={locations}
      httpError={httpError}
      externalRecordPath={externalRecordPath}
      linksCount={linksCount}
      validate={validate}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
