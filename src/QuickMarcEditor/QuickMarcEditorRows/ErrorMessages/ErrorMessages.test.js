import { render } from '@folio/jest-config-stripes/testing-library/react';

import { ErrorMessages } from './ErrorMessages';
import Harness from '../../../../test/jest/helpers/harness';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Icon: ({ children }) => children,
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: ({ id }) => <span>{id}</span>,
}));

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

    describe('when helpUrl is available', () => {
      it('should render help link list of errors', () => {
        const { getByRole } = renderErrorMessages({
          errors: [{
            id: 'error-1',
            helpUrl: 'http://test.link',
          }],
        });

        const link = getByRole('link');

        expect(link).toBeInTheDocument();
        expect(link.href).toEqual('http://test.link/');
      });
    });
  });
});
