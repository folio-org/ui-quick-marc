import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes/core';
import { Button } from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';

import { useAuthorityLinking } from '../../hooks';
import { isRecordForAutoLinking } from '../utils';
import { MARC_TYPES } from '../../common/constants';

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
  const stripes = useStripes();
  const intl = useIntl();
  const showCallout = useShowCallout();

  const {
    autoLinkingEnabled,
    autoLinkableBibFields,
    autoLinkAuthority,
  } = useAuthorityLinking();

  const hasAutoLinkableRecord = formValues.records.some(field => isRecordForAutoLinking(field, autoLinkableBibFields));

  const getAutoLinkingToasts = (fields) => {
    const toasts = [];
    const newLinkedFieldTags = new Set();
    const notLinkedFieldTags = new Set();

    fields.forEach(field => {
      if (!field.linkDetails) {
        notLinkedFieldTags.add(field.tag);
      } else if (field.linkDetails.status === 'NEW') {
        newLinkedFieldTags.add(field.tag);
      } else if (field.linkDetails.status === 'ERROR') {
        notLinkedFieldTags.add(field.tag);
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

    if (notLinkedFieldTags.size) {
      toasts.push({
        type: 'error',
        messageId: 'ui-quick-marc.records.autoLink.notLinkedFields',
        values: getValues(notLinkedFieldTags),
      });
    }

    return toasts;
  };

  const hydrateForLinkSuggestions = (marcRecord) => ({
    leader: marcRecord.leader,
    fields: marcRecord.records
      .filter(record => isRecordForAutoLinking(record, autoLinkableBibFields))
      .map(record => ({
        tag: record.tag,
        content: record.content,
      })),
    marcFormat: marcRecord.marcFormat,
    _actionType: 'view',
  });

  const handleAutoLinking = async () => {
    try {
      const payload = hydrateForLinkSuggestions(formValues);
      const data = await onFetchLinkSuggestions(payload);
      const fields = autoLinkAuthority(formValues.records, data.fields);

      onMarkRecordsLinked({ fields });

      const toasts = getAutoLinkingToasts(data.fields);

      if (toasts.length) {
        toasts.forEach(toast => {
          showCallout(toast);
        });
      }
    } catch (e) {
      showCallout({ messageId: 'ui-quick-marc.records.error.autoLinking', type: 'error' });
    }
  };

  if (
    !autoLinkingEnabled
    || marcType !== MARC_TYPES.BIB
    || !stripes.hasPerm('ui-quick-marc.quick-marc-authority-records.linkUnlink')
  ) {
    return null;
  }

  return (
    <Button
      marginBottom0
      disabled={!hasAutoLinkableRecord || isLoadingLinkSuggestions}
      onClick={handleAutoLinking}
      data-testid="autoLinkingButton"
    >
      {intl.formatMessage({ id: 'ui-quick-marc.autoLinkingButton' })}
    </Button>
  );
};

AutoLinkingButton.propTypes = propTypes;

export { AutoLinkingButton };
