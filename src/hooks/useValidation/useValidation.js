import {
  useCallback,
  useContext,
} from 'react';
import assignWith from 'lodash/assignWith';

import { validators } from './rules';
import { QuickMarcContext } from '../../contexts';
import { useValidate } from '../../queries';
import { isLeaderRow } from '../../QuickMarcEditor/utils';
import { MARC_TYPES } from '../../common/constants';
import {
  MISSING_FIELD_ID,
  SEVERITY,
} from './constants';

const joinErrors = (errorsA, errorsB) => {
  return assignWith({}, errorsA, errorsB, (objValue = [], srcValue = []) => objValue.concat(srcValue));
};

const BE_VALIDATION_MARC_TYPES = [MARC_TYPES.BIB, MARC_TYPES.AUTHORITY];

const useValidation = (context) => {
  const quickMarcContext = useContext(QuickMarcContext);
  const { validate: validateFetch } = useValidate();

  // accept { [field.id]: ["message", "message"...]}
  // return { [field.id]: [{ id, values, severity }]}
  const formatFEValidation = (errors) => {
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

  const runFrontEndValidation = useCallback((marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errors = validationRules.reduce((joinedErrors, rule) => {
      // returns undefined or { [field.id]: 'error message' }
      const ruleErrors = rule.validator({ ...context, ...quickMarcContext, marcRecords }, rule);

      return joinErrors(joinedErrors, ruleErrors);
    }, {});

    return formatFEValidation(errors);
  }, [context, quickMarcContext]);

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

  const validate = useCallback(async (marcRecords) => {
    let errors = {};

    if (BE_VALIDATION_MARC_TYPES.includes(context.marcType)) {
      errors = await runBackEndValidation(marcRecords);
    } else {
      errors = runFrontEndValidation(marcRecords);
    }

    quickMarcContext.setValidationErrors(errors);

    return errors;
  }, [quickMarcContext, context, runFrontEndValidation, runBackEndValidation]);

  const hasIssuesBySeverity = (severity) => {
    return Object.values(quickMarcContext.validationErrorsRef.current)
      .flat()
      .some(fieldError => fieldError.severity === severity);
  };

  return {
    validate,
    hasErrorIssues: hasIssuesBySeverity(SEVERITY.ERROR),
    hasWarnIssues: hasIssuesBySeverity(SEVERITY.WARN),
  };
};

export { useValidation };
