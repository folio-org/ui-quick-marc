import { useCallback } from 'react';
import { validators } from './rules';

const useValidation = (context) => {
  const validate = useCallback((marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errorMessage = validationRules.reduce((_errorMessage, rule) => {
      if (_errorMessage) {
        return _errorMessage;
      }

      const error = rule.validator({ ...context, marcRecords }, rule);

      if (error) {
        return error;
      }

      return undefined;
    }, null);

    return errorMessage;
  }, [context]);

  return { validate };
};

export { useValidation };
