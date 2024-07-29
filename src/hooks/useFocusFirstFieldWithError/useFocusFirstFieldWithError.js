import {
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useFormState } from 'react-final-form';

import { QuickMarcContext } from '../../contexts';

export const useFocusFirstFieldWithError = () => {
  const { values } = useFormState();
  const { validationErrorsRef } = useContext(QuickMarcContext);

  const firstFieldWithErrors = useMemo(() => {
    return values.records.find(({ id }) => Boolean(validationErrorsRef.current[id]));
  }, [values.records, validationErrorsRef]);

  useEffect(() => {
    if (!firstFieldWithErrors?.id) {
      return;
    }

    document.querySelector(`[data-fieldid="${firstFieldWithErrors.id}"] input:enabled`)?.focus();
  }, [firstFieldWithErrors?.id, validationErrorsRef]);
};
