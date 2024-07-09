/* eslint-disable react/prop-types */
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Icon } from '@folio/stripes/components';

import styles from './ErrorMessages.css';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Icon: ({ children }) => children,
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: ({ id }) => <span>{id}</span>,
}));

const propTypes = {
  errors: PropTypes.arrayOf(PropTypes.element),
};

const ErrorMessages = ({ errors = [] }) => {
  if (!errors.length) {
    return null;
  }

  return (
    <>
      {errors.map(error => (
        <div
          data-testid="error-messages-container"
          className={styles.validationErrorMessage}
        >
          <Icon
            iconRootClass={styles.feedbackErrorIcon}
            icon="exclamation-circle"
          >
            <FormattedMessage id="ui-quick-marc.record.errorMessage.fail" />
            <FormattedMessage id={error.id} values={error.values} />
          </Icon>
        </div>
      ))}
    </>
  );
};

ErrorMessages.propTypes = propTypes;

export { ErrorMessages };
