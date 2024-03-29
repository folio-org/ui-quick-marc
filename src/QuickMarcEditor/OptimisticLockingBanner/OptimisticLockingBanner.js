import {
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import { ConflictDetectionBanner } from '@folio/stripes/components';

import { ERROR_TYPES } from '../../common/constants';

const OptimisticLockingBanner = ({ latestVersionLink, httpError }) => {
  const conflictDetectionBannerRef = useRef(null);
  const focusConflictDetectionBanner = useCallback(() => conflictDetectionBannerRef.current.focus(), []);

  return (
    httpError?.errorType === ERROR_TYPES.OPTIMISTIC_LOCKING &&
    <ConflictDetectionBanner
      latestVersionLink={latestVersionLink}
      conflictDetectionBannerRef={conflictDetectionBannerRef}
      focusConflictDetectionBanner={focusConflictDetectionBanner}
    />
  );
};

OptimisticLockingBanner.propTypes = {
  latestVersionLink: PropTypes.string,
  httpError: PropTypes.object,
};

export default OptimisticLockingBanner;
