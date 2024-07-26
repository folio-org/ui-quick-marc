import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Icon } from '@folio/stripes/components';

import { SEVERITY } from '../../../hooks/useValidation/constants';

import styles from './ErrorMessages.css';

const propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape({
    severity: PropTypes.string.isRequired,
    message: PropTypes.string,
    id: PropTypes.string,
    values: PropTypes.object,
  })),
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
          className={classNames([
            styles.validationErrorMessage,
            {
              [styles.validationIssueError]: error.severity === SEVERITY.ERROR,
              [styles.validationIssueWarn]: error.severity === SEVERITY.WARN,
            }])}
        >
          <Icon
            iconRootClass={styles.feedbackErrorIcon}
            icon="exclamation-circle"
          >
            <FormattedMessage id={`ui-quick-marc.record.errorMessage.${error.severity}`} />
            {error.message
              ? error.message
              : <FormattedMessage id={error.id} values={error.values} />
            }
          </Icon>
        </div>
      ))}
    </>
  );
};

ErrorMessages.propTypes = propTypes;

export { ErrorMessages };
