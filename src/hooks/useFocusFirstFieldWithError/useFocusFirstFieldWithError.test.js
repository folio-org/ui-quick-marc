import {
  renderHook,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import '@folio/jest-config-stripes/testing-library/jest-dom';

import Harness from '../../../test/jest/helpers/harness';

import { useFocusFirstFieldWithError } from './useFocusFirstFieldWithError';

jest.mock('react-final-form', () => ({
  useFormState: jest.fn().mockReturnValue({
    values: {
      records: [{
        id: 'id-without-error',
      }, {
        id: 'id-with-error',
      }],
    },
  }),
}));

const Wrapper = ({ children }) => (
  <Harness
    quickMarcContext={{
      validationErrors: {
        'id-with-error': [{ id: 'some-error' }],
      },
    }}
  >
    <div data-fieldId="id-without-error"><input aria-label="input-1" /></div>
    <div data-fieldId="id-with-error"><input aria-label="input-2" /></div>
    {children}
  </Harness>
);

const renderUseFirstFieldWithError = () => {
  return renderHook(() => useFocusFirstFieldWithError(), { wrapper: Wrapper });
};

describe('Given useFocusFirstFieldWithError', () => {
  describe('when a field has an error', () => {
    it('should focus that field', () => {
      renderUseFirstFieldWithError();

      expect(screen.getByRole('textbox', { name: 'input-2' })).toHaveFocus();
    });
  });
});
