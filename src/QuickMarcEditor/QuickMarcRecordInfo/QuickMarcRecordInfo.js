import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
} from 'react-intl';

import {
  Badge,
} from '@folio/stripes/components';

import {
  RECORD_STATUS_CURRENT,
  RECORD_STATUS_COLORS,
  RECORD_STATUS_LABELS,
} from './constants';

import styles from './QuickMarcRecordInfo.css';

export const QuickMarcRecordInfo = ({ status, updateDate }) => {
  return (
    <div
      className={styles.quickMarcRecordInfoWrapper}
      data-test-quick-marc-record-info
    >
      <Badge color={RECORD_STATUS_COLORS[status]}>
        {RECORD_STATUS_LABELS[status]}
      </Badge>

      {
        Boolean(updateDate) && (
          <span>
            <FormattedMessage
              id="stripes-components.metaSection.recordLastUpdated"
              values={{
                date: <FormattedDate value={updateDate} />,
                time: <FormattedTime value={updateDate} />,
              }}
            />
          </span>
        )
      }
    </div>
  );
};

QuickMarcRecordInfo.propTypes = {
  status: PropTypes.string,
  updateDate: PropTypes.string,
};

QuickMarcRecordInfo.defaultProps = {
  status: RECORD_STATUS_CURRENT,
};
