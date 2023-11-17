import React, {
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
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
  removeFieldsForDerive,
  autopopulateIndicators,
  autopopulateSubfieldSection,
  cleanBytesFields,
  parseHttpError,
  removeDeletedRecords,
  combineSplitFields,
  saveLinksToNewRecord,
  recordHasLinks,
  autopopulateFixedField,
  removeEnteredDate,
  autopopulatePhysDescriptionField,
  autopopulateMaterialCharsField,
} from './utils';

const propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  initialValues: PropTypes.object.isRequired,
  instance: PropTypes.object,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  fixedFieldSpec: PropTypes.object.isRequired,
  mutator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

const QuickMarcDeriveWrapper = ({
  action,
  instance,
  onClose,
  initialValues,
  mutator,
  marcType,
  fixedFieldSpec,
}) => {
  const showCallout = useShowCallout();
  const { linkableBibFields, actualizeLinks, linkingRules } = useAuthorityLinking({ marcType, action });
  const [httpError, setHttpError] = useState(null);

  const { validate } = useValidation({
    initialValues,
    marcType,
    action: QUICK_MARC_ACTIONS.DERIVE,
    linkableBibFields,
    linkingRules,
  });

  const prepareForSubmit = useCallback((formValues) => {
    const formValuesForDerive = flow(
      removeDeletedRecords,
      removeFieldsForDerive,
      removeEnteredDate,
      autopopulateIndicators,
      marcRecord => autopopulateFixedField(marcRecord, marcType),
      autopopulatePhysDescriptionField,
      autopopulateMaterialCharsField,
      marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
      marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec),
    )(formValues);

    return formValuesForDerive;
  }, [marcType, fixedFieldSpec]);

  const runValidation = useCallback((formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);

    return validate(formValuesForValidation.records);
  }, [validate, prepareForSubmit]);

  const onSubmit = useCallback(async (formValues) => {
    const formValuesToProcess = flow(
      prepareForSubmit,
      combineSplitFields,
    )(formValues);

    showCallout({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

    let formValuesToHydrate;

    try {
      formValuesToHydrate = await actualizeLinks(formValuesToProcess);
    } catch (errorResponse) {
      const parsedError = await parseHttpError(errorResponse);

      setHttpError(parsedError);

      return null;
    }

    formValuesToHydrate.relatedRecordVersion = 1;
    formValuesToHydrate._actionType = 'create';

    const formValuesForDerive = hydrateMarcRecord(formValuesToHydrate);

    return mutator.quickMarcEditMarcRecord.POST(formValuesForDerive)
      .then(async ({ qmRecordId }) => {
        onClose('id'); // https://issues.folio.org/browse/UIQM-82

        try {
          const { externalId } = await getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest: mutator.quickMarcRecordStatus.GET,
            qmRecordId,
            showCallout,
          });

          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

          if (recordHasLinks(formValuesForDerive.fields)) {
            saveLinksToNewRecord(mutator, externalId, formValuesForDerive)
              .finally(() => onClose(externalId));
          } else {
            onClose(externalId);
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
      confirmRemoveAuthorityLinking
      validate={runValidation}
    />
  );
};

QuickMarcDeriveWrapper.propTypes = propTypes;

export default QuickMarcDeriveWrapper;
