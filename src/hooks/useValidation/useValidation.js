import {
  useCallback,
  useContext,
} from 'react';
import { validators } from './rules';
import { QuickMarcContext } from '../../contexts';

const useValidation = (context) => {
  const quickMarcContext = useContext(QuickMarcContext);

  const validate = useCallback((marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errorMessage = validationRules.reduce((_errorMessage, rule) => {
      if (_errorMessage) {
        return _errorMessage;
      }

      const error = rule.validator({ ...context, ...quickMarcContext, marcRecords }, rule);

      if (error) {
        return error;
      }

      return undefined;
    }, null);

    return errorMessage;
  }, [context, quickMarcContext]);

  return { validate };
};

export { useValidation };
