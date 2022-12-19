import React, {
  useCallback,
  useState,
  useEffect,
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
  removeDeletedRecords,
  combineSplitFields,
  are010Or1xxUpdated,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  refreshPageData: PropTypes.func.isRequired,
  externalRecordPath: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  resources: PropTypes.object.isRequired,
};

const QuickMarcEditWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  marcType,
  locations,
  refreshPageData,
  externalRecordPath,
  resources,
}) => {
  const showCallout = useShowCallout();
  const location = useLocation();
  const [httpError, setHttpError] = useState(null);
  const numOfLinks = resources?.quickMarcInstanceLinks?.successfulMutations[0]?.record?.links[0]?.totalLinks;

  const onSubmit = useCallback(async (formValues) => {
    let is1xxOr010Updated = false;

    if (marcType === MARC_TYPES.AUTHORITY && numOfLinks > 0) {
      is1xxOr010Updated = are010Or1xxUpdated(initialValues.records, formValues.records);
    }
    const formValuesToSave = removeDeletedRecords(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesToSave);
    const validationErrorMessage = validateMarcRecord(formValuesToSave, initialValues, marcType, locations);
    const errorMessage = controlFieldErrorMessage || validationErrorMessage;

    if (errorMessage) {
      showCallout({
        message: errorMessage,
        type: 'error',
      });

      return null;
    }

    const autopopulatedFormWithIndicators = autopopulateIndicators(formValuesToSave);
    const autopopulatedFormWithSubfields = autopopulateSubfieldSection(
      autopopulatedFormWithIndicators,
      initialValues,
      marcType,
    );
    const formValuesForEdit = cleanBytesFields(autopopulatedFormWithSubfields, initialValues, marcType);
    const formValuesWithCombinedFields = combineSplitFields(formValuesForEdit);
    const marcRecord = hydrateMarcRecord(formValuesWithCombinedFields);
    const path = EXTERNAL_INSTANCE_APIS[marcType];

    const fetchInstance = async () => {
      const fetchedInstance = await mutator.quickMarcEditInstance.GET({ path: `${path}/${marcRecord.externalId}` });

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

    marcRecord.relatedRecordVersion = marcType === MARC_TYPES.AUTHORITY
      ? instance._version
      : new URLSearchParams(location.search).get('relatedRecordVersion');

    return mutator.quickMarcEditMarcRecord.PUT(marcRecord)
      .then(async () => {
        if (is1xxOr010Updated) {
          const values = {
            count: numOfLinks,
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

        return { version: parseInt(marcRecord.relatedRecordVersion, 10) + 1 };
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [showCallout, refreshPageData, location, initialValues, instance, locations, marcType, mutator, numOfLinks]);

  useEffect(() => {
    if (marcType !== MARC_TYPES.AUTHORITY) {
      return;
    }

    mutator.quickMarcInstanceLinks.POST({
      'ids': [instance.id],
    })
      .catch(async e => {
        const parsedError = await parseHttpError(e);

        setHttpError(parsedError);
      });
  }, [instance.id, marcType, mutator.quickMarcInstanceLinks]);

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
      numOfLinks={numOfLinks}
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
