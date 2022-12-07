import {
  useState,
} from 'react';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  Pluggable,
  useCallout,
} from '@folio/stripes/core';
import {
  Tooltip,
  IconButton,
  Icon,
  ConfirmationModal,
} from '@folio/stripes/components';

import { useMarcSource } from '../../../queries';

const propTypes = {
  isLinked: PropTypes.bool.isRequired,
  handleLinkAuthority: PropTypes.func.isRequired,
  handleUnlinkAuthority: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
};

const LinkButton = ({
  handleLinkAuthority,
  handleUnlinkAuthority,
  isLinked,
  tag,
  fieldId,
}) => {
  const intl = useIntl();
  const [authority, setAuthority] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const callout = useCallout();

  const { isLoading, refetch: refetchSource } = useMarcSource(fieldId, authority?.id);

  const onLinkRecord = async (_authority) => {
    if (_authority.id === authority?.id) {
      const authoritySource = await refetchSource();

      const linkingSuccessful = handleLinkAuthority(_authority, authoritySource);

      if (linkingSuccessful) {
        callout.sendCallout({
          type: 'success',
          message: intl.formatMessage({ id: 'ui-quick-marc.record.link.success' }, { tag }),
        });
      }
    }
    setAuthority(_authority);
  };

  const toggleModal = () => {
    setIsModalOpen(open => !open);
  };

  const handleCancelUnlink = () => {
    toggleModal();
  };

  const handleConfirmUnlink = () => {
    handleUnlinkAuthority();
    toggleModal();
  };

  const renderButton = () => {
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
              onClick={toggleModal}
            />
          )}
        </Tooltip>
      );
    }

    return (
      <Pluggable
        type="find-authority"
        onLinkRecord={onLinkRecord}
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

  if (isLoading) {
    return (
      <Icon
        data-testid="link-authority-loading"
        icon="spinner-ellipsis"
      />
    );
  }

  return (
    <>
      {renderButton()}
      <ConfirmationModal
        id="quick-marc-confirm-unlink-modal"
        open={isModalOpen}
        heading={<FormattedMessage id="ui-quick-marc.record.unlink.confirm.title" />}
        message={<FormattedMessage id="ui-quick-marc.record.unlink.confirm.message" values={{ tag }} />}
        confirmLabel={<FormattedMessage id="ui-quick-marc.record.unlink.confirm.confirm" />}
        cancelLabel={<FormattedMessage id="ui-quick-marc.record.unlink.confirm.cancel" />}
        onConfirm={handleConfirmUnlink}
        onCancel={handleCancelUnlink}
      />
    </>
  );
};

LinkButton.propTypes = propTypes;

export { LinkButton };
