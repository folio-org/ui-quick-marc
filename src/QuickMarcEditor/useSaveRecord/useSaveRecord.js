import {
  useCallback,
  useContext,
  useMemo,
} from 'react';
import flow from 'lodash/flow';

import { useStripes } from '@folio/stripes/core';

import {
  useAuthorityLinking,
  useValidation,
} from '../../hooks';
import { QUICK_MARC_ACTIONS } from '../constants';
import {
  applyCentralTenantInHeaders,
  autopopulateFixedField,
  autopopulateIndicators,
  autopopulateMaterialCharsField,
  autopopulatePhysDescriptionField,
  autopopulateSubfieldSection,
  cleanBytesFields,
  combineSplitFields,
  formatLeaderForSubmit,
  removeDeletedRecords,
  removeDuplicateSystemGeneratedFields,
  removeEnteredDate,
  removeFieldsForDerive,
  removeRowsWithoutContent,
} from '../utils';
import { useSubmitRecord } from './useSubmitRecord';
import { QuickMarcContext } from '../../contexts';

const useSaveRecord = ({
  linksCount,
  locations,
  fixedFieldSpec,
  mutator,
  refreshPageData,
  onClose,
  onSave,
}) => {
  const stripes = useStripes();

  const {
    action,
    marcType,
    initialValues,
    instance,
    isShared,
  } = useContext(QuickMarcContext);
  const {
    linkableBibFields,
    linkingRules,
    sourceFiles,
  } = useAuthorityLinking({ marcType, action });

  const isRequestToCentralTenantFromMember = applyCentralTenantInHeaders(isShared, stripes, marcType);
  const centralTenantId = stripes.user.user.consortium?.centralTenantId;
  const tenantId = isRequestToCentralTenantFromMember ? centralTenantId : '';

  const validationContext = useMemo(() => ({
    initialValues,
    marcType,
    action,
    linkableBibFields,
    linkingRules,
    fixedFieldSpec,
    instanceId: instance?.id,
    sourceFiles,
    linksCount,
    naturalId: instance?.naturalId,
    locations,
  }), [
    action,
    instance?.naturalId,
    linksCount,
    initialValues,
    marcType,
    locations,
    linkableBibFields,
    linkingRules,
    sourceFiles,
    fixedFieldSpec,
    instance?.id,
  ]);

  const validationTenantId = isRequestToCentralTenantFromMember && action !== QUICK_MARC_ACTIONS.DERIVE
    ? centralTenantId
    : null;
  const { validate } = useValidation(validationContext, validationTenantId);

  const prepareForSubmit = useCallback((formValues) => {
    let handlers = [];

    if (action === QUICK_MARC_ACTIONS.CREATE) {
      handlers = [
        removeDeletedRecords,
        removeRowsWithoutContent,
        autopopulateIndicators,
        marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
        autopopulatePhysDescriptionField,
        autopopulateMaterialCharsField,
        marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
        marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec, marcType),
        marcRecord => formatLeaderForSubmit(marcType, marcRecord),
        combineSplitFields,
      ];
    } else if (action === QUICK_MARC_ACTIONS.EDIT) {
      handlers = [
        removeDeletedRecords,
        removeDuplicateSystemGeneratedFields,
        marcRecord => formatLeaderForSubmit(marcType, marcRecord),
        autopopulateIndicators,
        marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
        autopopulatePhysDescriptionField,
        autopopulateMaterialCharsField,
        marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
        marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec, marcType),
        combineSplitFields,
      ];
    } else if (action === QUICK_MARC_ACTIONS.DERIVE) {
      handlers = [
        removeDeletedRecords,
        removeFieldsForDerive,
        removeEnteredDate,
        autopopulateIndicators,
        marcRecord => autopopulateFixedField(marcRecord, marcType, fixedFieldSpec),
        autopopulatePhysDescriptionField,
        autopopulateMaterialCharsField,
        marcRecord => autopopulateSubfieldSection(marcRecord, marcType),
        marcRecord => cleanBytesFields(marcRecord, fixedFieldSpec, marcType),
        marcRecord => formatLeaderForSubmit(marcType, marcRecord),
        combineSplitFields,
      ];
    }

    const formValuesForCreate = flow(handlers)(formValues);

    return formValuesForCreate;
  }, [marcType, fixedFieldSpec, action]);

  const {
    onCreate,
    onEdit,
    onDerive,
    httpError,
  } = useSubmitRecord({
    prepareForSubmit,
    mutator,
    linksCount,
    isRequestToCentralTenantFromMember,
    tenantId,
    refreshPageData,
    onClose,
    onSave,
  });

  const runValidation = useCallback(async (formValues) => {
    const formValuesForValidation = prepareForSubmit(formValues);

    return validate(formValuesForValidation.records);
  }, [validate, prepareForSubmit]);

  const submitMap = {
    [QUICK_MARC_ACTIONS.CREATE]: onCreate,
    [QUICK_MARC_ACTIONS.EDIT]: onEdit,
    [QUICK_MARC_ACTIONS.DERIVE]: onDerive,
  };

  return {
    onSubmit: submitMap[action],
    httpError,
    runValidation,
  };
};

export { useSaveRecord };
