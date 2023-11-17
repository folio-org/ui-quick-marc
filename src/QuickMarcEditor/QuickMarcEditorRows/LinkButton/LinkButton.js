import {
  useState,
  useMemo,
} from 'react';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';

import {
  checkIfUserInCentralTenant,
  checkIfUserInMemberTenant,
  Pluggable,
  useCallout,
  useStripes,
} from '@folio/stripes/core';
import {
  Tooltip,
  IconButton,
  ConfirmationModal,
  Loading,
} from '@folio/stripes/components';

import { useMarcSource } from '../../../queries';
import { getContentSubfieldValue } from '../../utils';
import {
  DEFAULT_LOOKUP_OPTIONS,
  searchableIndexesValues,
  navigationSegments,
  FILTERS,
} from '../../../common/constants';
import { QUICK_MARC_ACTIONS } from '../../constants';

const propTypes = {
  action: PropTypes.string.isRequired,
  calloutRef: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),
  content: PropTypes.string,
  isLinked: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleLinkAuthority: PropTypes.func.isRequired,
  handleUnlinkAuthority: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
};

const LinkButton = ({
  action,
  handleLinkAuthority,
  handleUnlinkAuthority,
  isLinked,
  isLoading,
  tag,
  fieldId,
  calloutRef,
  content,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const location = useLocation();
  const [authority, setAuthority] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const callout = useCallout();
  const centralTenantId = stripes.user.user?.consortium?.centralTenantId;
  const isSharedBibRecord = new URLSearchParams(location.search).get('shared') === 'true';

  let showSharedFilter = false;
  let showSharedRecordsOnly = false;
  let pluginTenantId = '';

  if (checkIfUserInCentralTenant(stripes)) {
    if ([QUICK_MARC_ACTIONS.CREATE, QUICK_MARC_ACTIONS.EDIT, QUICK_MARC_ACTIONS.DERIVE].includes(action)) {
      showSharedRecordsOnly = true;
    }
  } else if (checkIfUserInMemberTenant(stripes)) {
    if (isSharedBibRecord) {
      if (action === QUICK_MARC_ACTIONS.EDIT) {
        showSharedRecordsOnly = true;
        pluginTenantId = centralTenantId;
      } else if (action === QUICK_MARC_ACTIONS.DERIVE) {
        showSharedFilter = true;
      }
    } else if ([QUICK_MARC_ACTIONS.CREATE, QUICK_MARC_ACTIONS.EDIT, QUICK_MARC_ACTIONS.DERIVE].includes(action)) {
      showSharedFilter = true;
    }
  }

  const { isLoading: isLoadingMarcSource, refetch: refetchSource } = useMarcSource({
    fieldId,
    recordId: authority?.id,
    tenantId: authority?.shared ? centralTenantId : authority?.tenantId,
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

  const excludedFilters = {
    [navigationSegments.search]: [],
    [navigationSegments.browse]: [],
  };

  if (!showSharedFilter) {
    excludedFilters[navigationSegments.search].push(FILTERS.SHARED);
    excludedFilters[navigationSegments.browse].push(FILTERS.SHARED);
  }

  const initialValues = useMemo(() => {
    const { dropdownValue: dropdownValueByTag } = DEFAULT_LOOKUP_OPTIONS[tag];

    let initialDropdownValue = dropdownValueByTag;
    let initialSearchInputValue = '';
    let initialSegment = navigationSegments.search;
    let initialSearchQuery = '';
    const initialFilters = showSharedRecordsOnly
      ? { [FILTERS.SHARED]: ['true'] }
      : null;

    const _initialValues = {
      [navigationSegments.search]: {},
      [navigationSegments.browse]: {},
      segment: initialSegment,
    };

    const fieldContent = getContentSubfieldValue(content);

    if (fieldContent.$0?.length) {
      const keywordValue = [fieldContent.$a, fieldContent.$d, fieldContent.$t].flat().filter(Boolean).join(' ');
      const keywordQuery = keywordValue
        ? `${searchableIndexesValues.KEYWORD}==${keywordValue}`
        : '';
      const identifierQuery = fieldContent.$0
        .map(selectIdentifierFromSubfield)
        .map(identifier => `${searchableIndexesValues.IDENTIFIER}==${identifier}`)
        .join(' or ');

      initialDropdownValue = searchableIndexesValues.ADVANCED_SEARCH;
      initialSearchInputValue = [keywordQuery, identifierQuery].filter(Boolean).join(' or ');
      initialSearchQuery = initialSearchInputValue;

      _initialValues[navigationSegments.search] = {
        dropdownValue: initialDropdownValue,
        searchIndex: initialDropdownValue,
        searchInputValue: initialSearchInputValue,
        searchQuery: initialSearchQuery,
        filters: initialFilters,
      };
      _initialValues[navigationSegments.browse] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
        filters: initialFilters,
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
        filters: initialFilters,
      };
      _initialValues[navigationSegments.search] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
        filters: initialFilters,
      };
    } else {
      initialSegment = navigationSegments.browse;

      _initialValues[navigationSegments.browse] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
        filters: initialFilters,
      };
      _initialValues[navigationSegments.search] = {
        dropdownValue: dropdownValueByTag,
        searchIndex: dropdownValueByTag,
        filters: initialFilters,
      };
    }

    _initialValues.segment = initialSegment;

    return _initialValues;
  }, [content, tag, showSharedRecordsOnly]);

  const renderButton = () => {
    if (isLoading) {
      return <Loading />;
    }

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
        excludedFilters={excludedFilters}
        isLinkingLoading={isLoadingMarcSource}
        tenantId={pluginTenantId}
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
