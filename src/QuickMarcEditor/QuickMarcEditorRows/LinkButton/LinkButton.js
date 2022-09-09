import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import { Pluggable } from '@folio/stripes/core';
import { IconButton } from '@folio/stripes/components';

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
      <IconButton
        data-testid="unlink-authority-button"
        icon="unlink"
        aria-haspopup="true"
        title={intl.formatMessage({ id: 'ui-quick-marc.record.unlink' })}
        ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.unlink' })}
        onClick={handleUnlinkAuthority}
      />
    );
  }

  return (
    <Pluggable
      type="find-authority"
      onLinkRecord={handleLinkAuthority}
      renderCustomTrigger={({ onClick }) => (
        <IconButton
          data-testid="link-authority-button"
          icon="link"
          aria-haspopup="true"
          title={intl.formatMessage({ id: 'ui-quick-marc.record.link' })}
          ariaLabel={intl.formatMessage({ id: 'ui-quick-marc.record.link' })}
          onClick={onClick}
        />
      )}
    >
      <FormattedMessage id="ui-quick-marc.noPlugin" />
    </Pluggable>
  );
};

LinkButton.propTypes = propTypes;

export { LinkButton };
