import {
  useState,
  useMemo,
} from 'react';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';

import {
  Pluggable,
  useCallout,
} from '@folio/stripes/core';
import {
  Tooltip,
  IconButton,
  ConfirmationModal,
} from '@folio/stripes/components';

import { useMarcSource } from '../../../queries';
import { getContentSubfieldValue } from '../../utils';
import {
  DEFAULT_LOOKUP_OPTIONS,
  searchableIndexesValues,
  navigationSegments,
} from '../../../common/constants';

const propTypes = {
  calloutRef: PropTypes.oneOf([
    PropTypes.object,
    PropTypes.func,
  ]),
  content: PropTypes.string,
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
  calloutRef,
  content,
}) => {
  const intl = useIntl();
  const [authority, setAuthority] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const selectIdentifierFromSubfield = (subfield) => {
    const match = subfield.substring(subfield.lastIndexOf('/') + 1);

    return match || subfield;
  };

  const initialValues = useMemo(() => {
    const { dropdownValue: dropdownValueByTag } = DEFAULT_LOOKUP_OPTIONS[tag];

    let initialDropdownValue = dropdownValueByTag;
    let initialSearchInputValue = '';
    let initialSegment = navigationSegments.search;
    let initialSearchQuery = '';

    const _initialValues = {
      [navigationSegments.search]: {},
      [navigationSegments.browse]: {},
      segment: initialSegment,
    };

    const fieldContent = getContentSubfieldValue(content);

    if (fieldContent.$0?.length === 1) {
      initialDropdownValue = searchableIndexesValues.IDENTIFIER;
      initialSearchInputValue = selectIdentifierFromSubfield(fieldContent.$0[0]);
      initialSearchQuery = initialSearchInputValue;

      _initialValues[navigationSegments.search] = {
        dropdownValue: initialDropdownValue,
        searchIndex: initialDropdownValue,
        searchInputValue: initialSearchInputValue,
        searchQuery: initialSearchQuery,
      };
      _initialValues[navigationSegments.browse] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
      };
    } else if (fieldContent.$0?.length > 1) {
      initialDropdownValue = searchableIndexesValues.ADVANCED_SEARCH;
      initialSearchInputValue = fieldContent.$0
        .map(selectIdentifierFromSubfield)
        .map(identifier => `${searchableIndexesValues.IDENTIFIER}==${identifier}`)
        .join(' or ');
      initialSearchQuery = initialSearchInputValue;

      _initialValues[navigationSegments.search] = {
        dropdownValue: initialDropdownValue,
        searchIndex: initialDropdownValue,
        searchInputValue: initialSearchInputValue,
        searchQuery: initialSearchQuery,
      };
      _initialValues[navigationSegments.browse] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
      };
    } else if (fieldContent.$a?.length || fieldContent.$d?.length || fieldContent.$t?.length) {
      initialSegment = navigationSegments.browse;
      initialSearchInputValue = flatten([fieldContent.$a, fieldContent.$d, fieldContent.$t])
        .filter(value => !isNil(value))
        .join(' ');
      initialSearchQuery = initialSearchInputValue;

      _initialValues[navigationSegments.browse] = {
        dropdownValue: initialDropdownValue,
        searchIndex: initialDropdownValue,
        searchInputValue: initialSearchInputValue,
        searchQuery: initialSearchQuery,
      };
      _initialValues[navigationSegments.search] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
      };
    } else {
      initialSegment = navigationSegments.browse;

      _initialValues[navigationSegments.browse] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
      };
      _initialValues[navigationSegments.search] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
      };
    }

    _initialValues.segment = initialSegment;

    return _initialValues;
  }, [content, tag]);

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
        isLinkingLoading={isLoading}
        calloutRef={calloutRef}
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
