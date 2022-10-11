import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import { Pluggable } from '@folio/stripes/core';
import {
  Tooltip,
  IconButton,
} from '@folio/stripes/components';

const propTypes = {
  isLinked: PropTypes.bool.isRequired,
  handleLinkAuthority: PropTypes.func.isRequired,
  handleUnlinkAuthority: PropTypes.func.isRequired,
};

const LinkButton = ({
  handleLinkAuthority,
  handleUnlinkAuthority,
  isLinked,
}) => {
  const intl = useIntl();

  if (isLinked) {
    return (
      <Tooltip
        id="unlink"
        text={intl.formatMessage({ id: 'ui-quick-marc.record.unlink' })}
      >
        {({ ref, ariaIds }) => (
          <IconButton
            ref={ref}
            data-testid="unlink-authority-button"
            icon="unlink"
            aria-haspopup="true"
            aria-labelledby={ariaIds.text}
            onClick={handleUnlinkAuthority}
          />
        )}
      </Tooltip>
    );
  }

  return (
    <Pluggable
      type="find-authority"
      onLinkRecord={handleLinkAuthority}
      renderCustomTrigger={({ onClick }) => (
        <Tooltip
          id="link"
          text={intl.formatMessage({ id: 'ui-quick-marc.record.link' })}
        >
          {({ ref, ariaIds }) => (
            <IconButton
              ref={ref}
              data-testid="link-authority-button"
              icon="link"
              aria-haspopup="true"
              aria-labelledby={ariaIds.text}
              onClick={onClick}
            />
          )}
        </Tooltip>
      )}
    >
      <FormattedMessage id="ui-quick-marc.noPlugin" />
    </Pluggable>
  );
};

LinkButton.propTypes = propTypes;

export { LinkButton };
