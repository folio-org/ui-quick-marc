import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';

import {
  useAuthorityLinksCount,
  useAuthorityLinkingRules,
} from '../queries';
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
  stripes: PropTypes.object.isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  stripes,
}) => {
  const showCallout = useShowCallout();
  const location = useLocation();
  const [httpError, setHttpError] = useState(null);
  const [linksCount, setLinksCount] = useState(0);

  const { fetchLinksCount } = useAuthorityLinksCount();
  const { linkingRules } = useAuthorityLinkingRules();

  const onSubmit = useCallback(async (formValues) => {
    let is1xxOr010Updated = false;

    if (marcType === MARC_TYPES.AUTHORITY && linksCount > 0) {
      is1xxOr010Updated = are010Or1xxUpdated(initialValues.records, formValues.records);
    }

    const formValuesToSave = removeDeletedRecords(formValues);
    const controlFieldErrorMessage = checkControlFieldLength(formValuesToSave);
    const validationErrorMessage = validateMarcRecord({
      marcRecord: formValuesToSave,
      initialValues,
      marcType,
      locations,
      linksCount,
      linkingRules,
      stripes,
      action,
    });

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

        return { version: parseInt(marcRecord.relatedRecordVersion, 10) + 1 };
      })
      .catch(async (errorResponse) => {
        const parsedError = await parseHttpError(errorResponse);

        setHttpError(parsedError);
      });
  }, [
    showCallout,
    refreshPageData,
    location,
    initialValues,
    instance,
    locations,
    marcType,
    mutator,
    linksCount,
    stripes,
    action,
    linkingRules,
  ]);

  useEffect(() => {
    if (marcType === MARC_TYPES.AUTHORITY) {
      fetchLinksCount([instance.id])
        .then(res => setLinksCount(res.links[0].totalLinks))
        .catch(setHttpError);
    }
  }, [location.search, marcType, fetchLinksCount, instance.id]);

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
    />
  );
};

QuickMarcEditWrapper.propTypes = propTypes;

export default QuickMarcEditWrapper;
