import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  FormattedDate,
  FormattedTime,
} from '@folio/stripes/components';

import {
  RECORD_STATUS_CURRENT,
  RECORD_STATUS_LABELS,
} from './constants';

import styles from './QuickMarcRecordInfo.css';

export const QuickMarcRecordInfo = ({ status, updateDate }) => {
  return (
    <div
      className={styles.quickMarcRecordInfoWrapper}
      data-test-quick-marc-record-info
    >
      <span>
        <FormattedMessage id="ui-quick-marc.record.status" />
      </span>
      {RECORD_STATUS_LABELS[status]}
      {
        Boolean(updateDate) && (
          <>
            <span>&nbsp;&bull;&nbsp;</span>
            <FormattedMessage
              id="stripes-components.metaSection.recordLastUpdated"
              values={{
                date: <FormattedDate value={updateDate} />,
                time: <FormattedTime value={updateDate} />,
              }}
            />
          </>
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
