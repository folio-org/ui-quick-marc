import {
  useCallback,
  useContext,
} from 'react';
import assignWith from 'lodash/assignWith';

import { validators } from './rules';
import { QuickMarcContext } from '../../contexts';

const joinErrors = (errorsA, errorsB) => {
  return assignWith({}, errorsA, errorsB, (objValue = [], srcValue = []) => objValue.concat(srcValue));
};

const useValidation = (context) => {
  const quickMarcContext = useContext(QuickMarcContext);

  const validate = useCallback((marcRecords) => {
    const validationRules = validators[context.marcType][context.action];

    const errors = validationRules.reduce((joinedErrors, rule) => {
      // returns undefined or { [field.id]: 'error message' }
      const ruleErrors = rule.validator({ ...context, ...quickMarcContext, marcRecords }, rule);

      return joinErrors(joinedErrors, ruleErrors);
    }, {});

    return errors;
  }, [context, quickMarcContext]);

  return { validate };
};

export { useValidation };
