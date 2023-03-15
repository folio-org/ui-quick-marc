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
import {
  DEFAULT_LOOKUP_OPTIONS,
  FILTERS,
  REFERENCES_VALUES_MAP,
} from '../../../common/constants';

const propTypes = {
  isLinked: PropTypes.bool.isRequired,
  handleLinkAuthority: PropTypes.func.isRequired,
  handleUnlinkAuthority: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  sourceFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  tag: PropTypes.string.isRequired,
};

const LinkButton = ({
  handleLinkAuthority,
  handleUnlinkAuthority,
  isLinked,
  tag,
  fieldId,
  sourceFiles,
}) => {
  const intl = useIntl();
  const [authority, setAuthority] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const callout = useCallout();

  const { isLoading, refetch: refetchSource } = useMarcSource(fieldId, authority?.id, {
    onSuccess: (authoritySource) => {
      const linkingSuccessful = handleLinkAuthority(authority, authoritySource);

      if (linkingSuccessful) {
        callout.sendCallout({
          type: 'success',
          message: intl.formatMessage({ id: 'ui-quick-marc.record.link.success' }, { tag }),
        });
      }
    },
  });

  const onLinkRecord = (_authority) => {
    if (_authority.id === authority?.id) {
      refetchSource();
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

  const handleInitialValues = () => {
    const {
      dropdownValue,
      filters: defaultTagFilters,
    } = DEFAULT_LOOKUP_OPTIONS[tag];

    const existingAuthSourceFilters = defaultTagFilters.filter(filterId => {
      return sourceFiles.find(sourceFile => sourceFile.id === filterId);
    });

    const initialFilters = {
      [FILTERS.REFERENCES]: [],
      [FILTERS.AUTHORITY_SOURCE]: existingAuthSourceFilters,
    };

    setInitialValues({
      filters: initialFilters,
      searchIndex: '',
      dropdownValue,
    });
  };

  const renderButton = () => {
    if (isLinked) {
      return (
        <Tooltip
          id={`unlink-${fieldId}`}
          text={intl.formatMessage({ id: 'ui-quick-marc.record.unlink' })}
        >
          {({ ref, ariaIds }) => (
            <IconButton
              ref={ref}
              data-testid={`unlink-authority-button-${fieldId}`}
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
        initialValues={initialValues}
        onLinkRecord={onLinkRecord}
        renderCustomTrigger={({ onClick }) => (
          <Tooltip
            id={`link-${fieldId}`}
            text={intl.formatMessage({ id: 'ui-quick-marc.record.link' })}
          >
            {({ ref, ariaIds }) => (
              <IconButton
                ref={ref}
                data-testid={`link-authority-button-${fieldId}`}
                icon="link"
                aria-haspopup="true"
                aria-labelledby={ariaIds.text}
                onClick={e => {
                  handleInitialValues();
                  onClick(e);
                }}
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
