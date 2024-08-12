import {
  useCallback,
  useContext,
} from 'react';

import { useOkapiKy } from '@folio/stripes/core';

import { validators } from './rules';
import { QuickMarcContext } from '../../contexts';
import {
  useLccnDuplicateConfig,
  useValidate,
} from '../../queries';
import {
  isLeaderRow,
  joinErrors,
} from '../../QuickMarcEditor/utils';
import { MARC_TYPES } from '../../common/constants';
import {
  MISSING_FIELD_ID,
  SEVERITY,
} from './constants';

const BE_VALIDATION_MARC_TYPES = [MARC_TYPES.BIB, MARC_TYPES.AUTHORITY];

// accept { [field.id]: ["message", "message"...]}
// return { [field.id]: [{ id, values, severity }]}
const formatFEValidation = (errors = {}) => {
  return Object.keys(errors).reduce((acc, fieldId) => {
    const fieldErrors = errors[fieldId];

    return {
      ...acc,
      [fieldId]: fieldErrors.map(fieldError => ({
        severity: SEVERITY.ERROR,
        ...fieldError,
      })),
    };
  }, {});
};

const useValidation = (context = {}) => {
  const quickMarcContext = useContext(QuickMarcContext);
  const { validate: validateFetch } = useValidate();
  const { duplicateLccnCheckingEnabled } = useLccnDuplicateConfig({ marcType: context.marcType });
  const ky = useOkapiKy();

  const runFrontEndValidation = useCallback(async (marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errors = await Promise.all(validationRules.map(rule => rule.validator({
      ...context,
      ...quickMarcContext,
      marcRecords,
      duplicateLccnCheckingEnabled,
      ky,
    }, rule)))
      .then(errorsList => errorsList.reduce((joinedErrors, ruleErrors) => joinErrors(joinedErrors, ruleErrors), {}));

    return formatFEValidation(errors);
  }, [context, quickMarcContext, duplicateLccnCheckingEnabled, ky]);

  const formatBEValidationResponse = (response, marcRecords) => {
    if (!response.issues) {
      return {};
    }

    return response.issues.reduce((acc, cur) => {
      const match = cur.tag.match(/(.{0,3})\[(\d)\]/);
      const fieldTag = match[1];
      const fieldIndex = parseInt(match[2], 10);

      const field = marcRecords.filter(_field => _field.tag === fieldTag)[fieldIndex];

      const existingIssues = acc[field?.id || MISSING_FIELD_ID] || [];

      return {
        ...acc,
        [field?.id || MISSING_FIELD_ID]: [...existingIssues, cur],
      };
    }, {});
  };

  const runBackEndValidation = useCallback(async (marcRecords) => {
    const body = {
      fields: marcRecords.filter(record => !isLeaderRow(record)),
      leader: marcRecords.find(isLeaderRow)?.content,
      marcFormat: context.marcType.toUpperCase(),
    };

    const response = await validateFetch({ body });

    return formatBEValidationResponse(response, marcRecords);
  }, [context, validateFetch]);

  const isBackEndValidationMarcType = useCallback(marcType => BE_VALIDATION_MARC_TYPES.includes(marcType), []);

  const validate = useCallback(async (marcRecords) => {
    let backEndValidationPromise = null;

    const frontEndValidationPromise = runFrontEndValidation(marcRecords);

    if (isBackEndValidationMarcType(context.marcType)) {
      backEndValidationPromise = runBackEndValidation(marcRecords);
    }

    const [
      frontEndValidationErrors,
      backEndValidationErrors,
    ] = await Promise.all([frontEndValidationPromise, backEndValidationPromise]);

    const joinedErrors = joinErrors(frontEndValidationErrors, backEndValidationErrors);

    quickMarcContext.setValidationErrors(joinedErrors);

    return joinedErrors;
  }, [
    quickMarcContext,
    context,
    runFrontEndValidation,
    runBackEndValidation,
    isBackEndValidationMarcType,
  ]);

  const hasIssuesBySeverity = (severity) => {
    return Object.values(quickMarcContext.validationErrorsRef.current)
      .flat()
      .some(fieldError => fieldError.severity === severity);
  };

  return {
    validate,
    hasErrorIssues: hasIssuesBySeverity(SEVERITY.ERROR),
    hasWarnIssues: hasIssuesBySeverity(SEVERITY.WARN),
    isBackEndValidationMarcType,
  };
};

export { useValidation };
