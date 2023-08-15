import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  IfPermission,
} from '@folio/stripes/core';
import { Button } from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';

import { useAuthorityLinking } from '../../hooks';
import {
  hydrateForLinkSuggestions,
  isRecordForAutoLinking,
} from '../utils';
import { MARC_TYPES } from '../../common/constants';
import { AUTOLINKING_ERROR_CODES } from './constants';
import { AUTOLINKING_STATUSES } from '../constants';

const propTypes = {
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  formValues: PropTypes.object.isRequired,
  isLoadingLinkSuggestions: PropTypes.bool.isRequired,
  onFetchLinkSuggestions: PropTypes.func.isRequired,
  onMarkRecordsLinked: PropTypes.func.isRequired,
};

const AutoLinkingButton = ({
  marcType,
  formValues,
  isLoadingLinkSuggestions,
  onFetchLinkSuggestions,
  onMarkRecordsLinked,
}) => {
  const intl = useIntl();
  const showCallout = useShowCallout();

  const {
    autoLinkingEnabled,
    autoLinkableBibFields,
    autoLinkAuthority,
  } = useAuthorityLinking({ marcType });

  const hasAutoLinkableRecord = formValues.records.some(field => isRecordForAutoLinking(field, autoLinkableBibFields));

  const getAutoLinkingToasts = (fields) => {
    const toasts = [];
    const newLinkedFieldTags = new Set();
    const notLinkedFieldTags = {
      [AUTOLINKING_ERROR_CODES.AUTHORITY_NOT_FOUND]: new Set(),
      [AUTOLINKING_ERROR_CODES.MULTIPLE_AUTHORITIES_FOUND]: new Set(),
    };

    fields.forEach(field => {
      const { status, errorCause } = field.linkDetails;

      if (!field.linkDetails) {
        notLinkedFieldTags[AUTOLINKING_ERROR_CODES.AUTHORITY_NOT_FOUND].add(field.tag);
      }

      if (status === AUTOLINKING_STATUSES.NEW) {
        newLinkedFieldTags.add(field.tag);
      } else if (status === AUTOLINKING_STATUSES.ERROR) {
        notLinkedFieldTags[errorCause].add(field.tag);
      }
    });

    const getValues = (fieldTagsSet) => {
      const fieldTags = [...fieldTagsSet].sort((a, b) => a - b);

      return {
        count: fieldTags.length,
        fieldTags: fieldTags.length === 1
          ? fieldTags[0]
          : fieldTags.slice(0, -1).join(', '),
        lastFieldTag: fieldTags.at(-1),
      };
    };

    if (newLinkedFieldTags.size) {
      toasts.push({
        messageId: 'ui-quick-marc.records.autoLink.linkedFields',
        values: getValues(newLinkedFieldTags),
      });
    }

    if (notLinkedFieldTags[AUTOLINKING_ERROR_CODES.AUTHORITY_NOT_FOUND].size) {
      toasts.push({
        type: 'error',
        messageId: 'ui-quick-marc.records.autoLink.notLinkedFields',
        values: getValues(notLinkedFieldTags[AUTOLINKING_ERROR_CODES.AUTHORITY_NOT_FOUND]),
      });
    }

    if (notLinkedFieldTags[AUTOLINKING_ERROR_CODES.MULTIPLE_AUTHORITIES_FOUND].size) {
      toasts.push({
        type: 'error',
        messageId: 'ui-quick-marc.records.autoLink.notLinkedFields.multiple',
        values: getValues(notLinkedFieldTags[AUTOLINKING_ERROR_CODES.MULTIPLE_AUTHORITIES_FOUND]),
      });
    }

    return toasts;
  };

  const handleAutoLinking = async () => {
    try {
      const fieldsToLink = formValues.records.filter(record => isRecordForAutoLinking(record, autoLinkableBibFields));
      const payload = hydrateForLinkSuggestions(formValues, fieldsToLink);
      const data = await onFetchLinkSuggestions({ body: payload });
      const fields = autoLinkAuthority(formValues.records, data.fields);

      onMarkRecordsLinked({ fields });

      const toasts = getAutoLinkingToasts(data.fields);

      toasts.forEach(toast => showCallout(toast));
    } catch (e) {
      showCallout({ messageId: 'ui-quick-marc.records.error.autoLinking', type: 'error' });
    }
  };

  if (!autoLinkingEnabled || marcType !== MARC_TYPES.BIB) {
    return null;
  }

  return (
    <IfPermission perm="ui-quick-marc.quick-marc-authority-records.linkUnlink">
      <Button
        marginBottom0
        disabled={!hasAutoLinkableRecord || isLoadingLinkSuggestions}
        onClick={handleAutoLinking}
        data-testid="autoLinkingButton"
      >
        {intl.formatMessage({ id: 'ui-quick-marc.autoLinkingButton' })}
      </Button>
    </IfPermission>
  );
};

AutoLinkingButton.propTypes = propTypes;

export { AutoLinkingButton };
