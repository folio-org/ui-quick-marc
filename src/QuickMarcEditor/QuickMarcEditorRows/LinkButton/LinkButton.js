import {
  useState,
  useCallback,
} from 'react';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  Pluggable,
  useCallout,
  useOkapiKy,
} from '@folio/stripes/core';
import {
  Tooltip,
  IconButton,
  Icon,
  ConfirmationModal,
} from '@folio/stripes/components';

import { MARC_RECORD_API } from '../../../common/constants';

const propTypes = {
  isLinked: PropTypes.bool.isRequired,
  handleLinkAuthority: PropTypes.func.isRequired,
  handleUnlinkAuthority: PropTypes.func.isRequired,
  tag: PropTypes.string.isRequired,
};

const MARC_SOURCE_API = (id) => `${MARC_RECORD_API}?externalId=${id}`;

const LinkButton = ({
  handleLinkAuthority,
  handleUnlinkAuthority,
  isLinked,
  tag,
}) => {
  const intl = useIntl();
  const ky = useOkapiKy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const callout = useCallout();

  const fetchMarcSource = useCallback((recordId) => {
    return ky.get(MARC_SOURCE_API(recordId)).json();
  }, [ky]);

  const onLinkRecord = async (authority) => {
    setIsLoading(true);

    const authoritySource = await fetchMarcSource(authority.id);

    setIsLoading(false);

    const linkingSuccessful = handleLinkAuthority(authority, authoritySource);

    if (linkingSuccessful) {
      callout.sendCallout({
        type: 'success',
        message: intl.formatMessage({ id: 'ui-quick-marc.record.link.success' }, { tag }),
      });
    }

    return linkingSuccessful;
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
              isLoading ? (
                <Icon
                  data-testid="link-authority-loading"
                  icon="spinner-ellipsis"
                />
              ) : (
                <IconButton
                  ref={ref}
                  data-testid="link-authority-button"
                  icon="link"
                  aria-haspopup="true"
                  aria-labelledby={ariaIds.text}
                  onClick={onClick}
                />
              )
            )}
          </Tooltip>
        )}
      >
        <FormattedMessage id="ui-quick-marc.noPlugin" />
      </Pluggable>
    );
  };

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
