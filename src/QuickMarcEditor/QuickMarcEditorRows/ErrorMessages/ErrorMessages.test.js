import {
  render,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import { ErrorMessages } from './ErrorMessages';
import Harness from '../../../../test/jest/helpers/harness';

const getErrorMessages = (props = {}) => (
  <Harness>
    <ErrorMessages
      errors={[]}
      {...props}
    />
  </Harness>
);

const renderErrorMessages = (props = {}) => render(getErrorMessages(props));

describe('Given ErrorMessages', () => {
  describe('when errors are empty', () => {
    it('should not render anything', () => {
      const { queryByTestId } = renderErrorMessages();

      expect(queryByTestId('error-messages-container')).not.toBeInTheDocument();
    });
  });

  describe('when errors are present', () => {
    it('should render list of errors', () => {
      const { getByText } = renderErrorMessages({
        errors: [{
          id: 'error-1',
        }, {
          id: 'error-2',
        }],
      });

      expect(getByText('error-1')).toBeInTheDocument();
      expect(getByText('error-2')).toBeInTheDocument();
    });
  });
});
