import {
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useFormState } from 'react-final-form';

import { QuickMarcContext } from '../../contexts';

export const useFocusFirstFieldWithError = () => {
  const { values } = useFormState();
  const { validationErrors } = useContext(QuickMarcContext);

  const firstFieldWithErrors = useMemo(() => {
    return values.records.find(({ id }) => Boolean(validationErrors[id]));
  }, [values.records, validationErrors]);

  useEffect(() => {
    if (!firstFieldWithErrors) {
      return;
    }

    document.querySelector(`[data-fieldId="${firstFieldWithErrors.id}"] input`)?.focus();
  }, [firstFieldWithErrors]);
};
