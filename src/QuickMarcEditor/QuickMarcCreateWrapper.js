import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import flow from 'lodash/flow';

import { useShowCallout } from '@folio/stripes-acq-components';

import QuickMarcEditor from './QuickMarcEditor';
import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';
import {
  useAuthorityLinking,
  useValidation,
} from '../hooks';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  hydrateMarcRecord,
  autopopulateSubfieldSection,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
  saveLinksToNewRecord,
  recordHasLinks,
  combineSplitFields,
  autopopulateFixedField,
  autopopulatePhysDescriptionField,
  autopopulateMaterialCharsField,
  autopopulateIndicators,
  removeRowsWithoutContent,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  location: ReactRouterPropTypes.location.isRequired,
  locations: PropTypes.object.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  fixedFieldSpec: PropTypes.object.isRequired,
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
  fixedFieldSpec,
  locations,
}) => {
  const showCallout = useShowCallout();
  const [httpError, setHttpError] = useState(null);
  const { linkableBibFields, actualizeLinks, linkingRules } = useAuthorityLinking({ marcType, action });

  const validationContext = useMemo(() => ({
    initialValues,
    marcType,
    action: QUICK_MARC_ACTIONS.CREATE,
    locations,
    linkableBibFields,
    linkingRules,
  }), [initialValues, marcType, locations, linkableBibFields, linkingRules]);
  const { validate } = useValidation(validationContext);

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesForCreate = flow(
      removeDeletedRecords,
      removeRowsWithoutContent,
      autopopulateIndicators,
      marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
      autopopulatePhysDescriptionField,
      autopopulateMaterialCharsField,
      marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
      marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec),
    )(formValues);

    return formValuesForCreate;
  }, [marcType, fixedFieldSpec]);

  const runValidation = useCallback((formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);

    return validate(formValuesForValidation.records);
  }, [validate, prepareForSubmit]);

  const redirectToRecord = (externalId, instanceId) => {
    let path;

    if (marcType === MARC_TYPES.HOLDINGS) {
      path = `/inventory/view/${instanceId}/${externalId}`;
    } else if (marcType === MARC_TYPES.BIB) {
      path = `/inventory/view/${externalId}`;
    } else if (marcType === MARC_TYPES.AUTHORITY) {
      path = `/marc-authorities/authorities/${externalId}`;
    }

    history.push({
      pathname: path,
      search: location.search,
    });
  };

  const onSubmit = useCallback(async (formValues) => {
    const formValuesToProcess = flow(
      prepareForSubmit,
      combineSplitFields,
    )(formValues);

    let formValuesToHydrate;

    try {
      if (marcType === MARC_TYPES.BIB) {
        formValuesToHydrate = await actualizeLinks(formValuesToProcess);
      } else {
        formValuesToHydrate = formValuesToProcess;
      }
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return null;
    }

    formValuesToHydrate._actionType = 'create';

    const formValuesForCreate = hydrateMarcRecord(formValuesToHydrate);

    return mutator.quickMarcEditMarcRecord.POST(formValuesForCreate)
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

          if (marcType === MARC_TYPES.BIB && recordHasLinks(formValuesForCreate.fields)) {
            saveLinksToNewRecord(mutator, externalId, formValuesForCreate)
              .finally(() => redirectToRecord(externalId, instanceId));
          } else {
            redirectToRecord(externalId, instanceId);
          }
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
  }, [onClose, showCallout, prepareForSubmit, actualizeLinks]);

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={onClose}
      initialValues={initialValues}
      onSubmit={onSubmit}
      action={action}
      marcType={marcType}
      fixedFieldSpec={fixedFieldSpec}
      httpError={httpError}
      validate={runValidation}
    />
  );
};

QuickMarcCreateWrapper.propTypes = propTypes;

export default QuickMarcCreateWrapper;
