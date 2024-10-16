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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.records, validationErrorsRef.current]);

  useEffect(() => {
    if (!firstFieldWithErrors?.id) {
      return;
    }

    const fieldSelector = `[data-fieldid="${firstFieldWithErrors.id}"]`;

    document.querySelector(`${fieldSelector} input:enabled, ${fieldSelector} textarea:enabled`)?.focus();
  }, [firstFieldWithErrors?.id, validationErrorsRef]);
};
