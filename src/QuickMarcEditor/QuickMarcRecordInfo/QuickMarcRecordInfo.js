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
import { MARC_TYPES } from '../../common/constants';

import styles from './QuickMarcRecordInfo.css';

export const QuickMarcRecordInfo = ({
  isEditAction,
  status,
  updateDate,
  updatedBy,
  marcType,
  correspondingMarcTag,
}) => {
  const getSourceLabel = () => {
    let source;

    if (!updatedBy) {
      return <FormattedMessage id="ui-quick-marc.meta.source.system" />;
    }

    const notEmptyNames = [updatedBy.firstName, updatedBy.lastName].filter(name => !!name);

    if (!notEmptyNames.length) {
      source = updatedBy.username;
    } else {
      source = notEmptyNames.join(', ');
    }

    return (
      <>
        <span>&nbsp;&bull;&nbsp;</span>
        <FormattedMessage
          id="stripes-components.metaSection.source"
          values={{ source }}
        />
      </>
    );
  };

  return (
    <div
      className={styles.quickMarcRecordInfoWrapper}
      data-test-quick-marc-record-info
    >
      {marcType === MARC_TYPES.AUTHORITY && (
        <>
          <FormattedMessage id={`ui-quick-marc.record.headingType.${correspondingMarcTag}`} />
          <span>&nbsp;&bull;&nbsp;</span>
        </>
      )}
      <span>
        <FormattedMessage id="ui-quick-marc.record.status" />
      </span>
      {RECORD_STATUS_LABELS[status]}
      {
        Boolean(updateDate) && (
          <>
            <span>&nbsp;&bull;&nbsp;</span>
            <FormattedMessage
              id="ui-quick-marc.record.lastUpdated"
              values={{
                date: <FormattedDate value={updateDate} />,
                time: <FormattedTime value={updateDate} />,
              }}
            />
          </>
        )
      }
      {isEditAction && getSourceLabel()}
    </div>
  );
};

QuickMarcRecordInfo.propTypes = {
  correspondingMarcTag: PropTypes.string,
  isEditAction: PropTypes.bool.isRequired,
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  status: PropTypes.string,
  updateDate: PropTypes.string,
  updatedBy: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string,
  }),
};

QuickMarcRecordInfo.defaultProps = {
  correspondingMarcTag: '',
  status: RECORD_STATUS_CURRENT,
};
