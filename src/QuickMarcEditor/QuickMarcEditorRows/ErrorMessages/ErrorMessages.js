import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Icon, TextLink } from '@folio/stripes/components';

import styles from './ErrorMessages.css';

const propTypes = {
  errors: PropTypes.arrayOf(PropTypes.object),
};

const ErrorMessages = ({ errors = [] }) => {
  if (!errors.length) {
    return null;
  }

  return (
    <>
      {errors.map(error => (
        <div
          key={error.id}
          data-testid="error-messages-container"
          className={styles.validationErrorMessage}
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
            {error.helpUrl && (
              <TextLink
                rel="noopener noreferrer"
                target="_blank"
                href={error.helpUrl}
              >
                <Icon
                  icon="external-link"
                  iconPosition="end"
                  iconRootClass={styles.helpLinkIcon}
                >
                  <FormattedMessage id="ui-quick-marc.record.errorMessage.help" />
                </Icon>
              </TextLink>
            )}
          </Icon>
        </div>
      ))}
    </>
  );
};

ErrorMessages.propTypes = propTypes;

export { ErrorMessages };
