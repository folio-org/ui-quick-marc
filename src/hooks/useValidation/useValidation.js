import {
  useCallback,
  useContext,
} from 'react';
import { useIntl } from 'react-intl';
import flow from 'lodash/flow';

import { useOkapiKy } from '@folio/stripes/core';

import { validators } from './rules';
import { QuickMarcContext } from '../../contexts';
import {
  useLccnDuplicateConfig,
  useValidate,
} from '../../queries';
import {
  getLeaderPositions,
  getVisibleNonSelectable008Subfields,
  isLeaderRow,
  joinErrors,
} from '../../QuickMarcEditor/utils';
import { MARC_TYPES } from '../../common/constants';
import {
  MISSING_FIELD_ID,
  SEVERITY,
} from './constants';
import {
  FIXED_FIELD_TAG,
  QUICK_MARC_ACTIONS,
} from '../../QuickMarcEditor/constants';
import { FixedFieldFactory } from '../../QuickMarcEditor/QuickMarcEditorRows/FixedField';

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

const useValidation = (context = {}, tenantId = null) => {
  const quickMarcContext = useContext(QuickMarcContext);
  const { validate: validateFetch } = useValidate({ tenantId });
  const { duplicateLccnCheckingEnabled } = useLccnDuplicateConfig({ marcType: context.marcType });
  const ky = useOkapiKy();
  const intl = useIntl();

  const runFrontEndValidation = useCallback(async (marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errors = await Promise.all(validationRules.map(rule => rule.validator({
      ...context,
      ...quickMarcContext,
      marcRecords,
      duplicateLccnCheckingEnabled,
      ky,
      intl,
    }, rule)))
      .then(errorsList => errorsList.reduce((joinedErrors, ruleErrors) => joinErrors(joinedErrors, ruleErrors), {}));

    return formatFEValidation(errors);
  }, [context, quickMarcContext, duplicateLccnCheckingEnabled, ky, intl]);

  const formatBEValidationResponse = (response, marcRecords) => {
    if (!response.issues) {
      return {};
    }

    return response.issues.reduce((acc, cur) => {
      const match = cur.tag.match(/(.{0,3})\[(\d+)\]/);
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

  // remove field 001 error related to missing field for Bib records during create and derive,
  // as this field is system generated and expected to be empty.
  const removeError001MissingField = useCallback(formattedBEValidation => {
    if (context.marcType !== MARC_TYPES.BIB || context.action === QUICK_MARC_ACTIONS.EDIT) {
      return formattedBEValidation;
    }

    const issues = {
      ...formattedBEValidation,
      [MISSING_FIELD_ID]: formattedBEValidation[MISSING_FIELD_ID]?.filter(error => !error.tag.startsWith('001')) || [],
    };

    // Missed fields shouldn't be an empty array, so that the record can be saved on the first try if there are no other issues.
    if (!issues[MISSING_FIELD_ID].length) {
      delete issues[MISSING_FIELD_ID];
    }

    return issues;
  }, [context.action, context.marcType]);

  // if the length of a subfield of field 008 is shorter, then add backslashes,
  // if longer, then cut off the extra characters.
  const fillIn008FieldBlanks = useCallback((marcRecords) => {
    if (![MARC_TYPES.BIB, MARC_TYPES.AUTHORITY].includes(context.marcType)) {
      return marcRecords;
    }

    const { type, position7 } = getLeaderPositions(context.marcType, marcRecords);
    const fixedFieldType = FixedFieldFactory.getFixedFieldType(context.fixedFieldSpec, type, position7);

    const fieldsMap = getVisibleNonSelectable008Subfields(fixedFieldType)
      .reduce((acc, field) => ({ ...acc, [field.code]: field }), {});

    return marcRecords.map(field => {
      if (field.tag !== FIXED_FIELD_TAG) {
        return field;
      }

      // if the spec contains a subfield length of 4, then '123456' becomes '1234' and '12' becomes '12\\\\'
      return {
        ...field,
        content: Object.keys(field.content).reduce((acc, code) => {
          const value = field.content[code];

          if (Array.isArray(value) || !fieldsMap[code]) {
            acc[code] = value;
          } else {
            const length = fieldsMap[code].length;

            acc[code] = value.length === length
              ? value
              : value.substring(0, length).padEnd(length, '\\');
          }

          return acc;
        }, {}),
      };
    });
  }, [context.fixedFieldSpec, context.marcType]);

  const runBackEndValidation = useCallback(async (records) => {
    const marcRecords = fillIn008FieldBlanks(records);

    const body = {
      fields: marcRecords.filter(record => !isLeaderRow(record)),
      leader: marcRecords.find(isLeaderRow)?.content,
      marcFormat: context.marcType.toUpperCase(),
    };

    const response = await validateFetch({ body });

    return flow(
      () => formatBEValidationResponse(response, marcRecords),
      removeError001MissingField,
    )();
  }, [context, validateFetch, removeError001MissingField, fillIn008FieldBlanks]);

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
