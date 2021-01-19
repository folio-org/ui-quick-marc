import React from 'react';
import { FormattedMessage } from 'react-intl';

export const RECORD_STATUS_CURRENT = 'ACTUAL';
export const RECORD_STATUS_PROGRESS = 'IN_PROGRESS';
export const RECORD_STATUS_ERROR = 'ERROR';

export const RECORD_STATUS_LABELS = {
  [RECORD_STATUS_CURRENT]: <FormattedMessage id="ui-quick-marc.record.status.current" />,
  [RECORD_STATUS_PROGRESS]: <FormattedMessage id="ui-quick-marc.record.status.progress" />,
  [RECORD_STATUS_ERROR]: <FormattedMessage id="ui-quick-marc.record.status.error" />,
};
