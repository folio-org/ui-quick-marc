import { useCallback } from 'react';
import { validators } from './rules';

const useValidation = (context) => {
  const validate = useCallback((marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errorMessage = validationRules.reduce((_errorMessage, rule) => {
      if (_errorMessage) {
        return _errorMessage;
      }

      const result = rule.validator({ ...context, marcRecords }, rule);

      if (result) {
        return result;
      }

      return null;
    }, null);

    return errorMessage;
  }, [context]);

  return { validate };
};

export default useValidation;
