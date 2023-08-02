import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import '@folio/stripes-acq-components/test/jest/__mock__';

import OptimisticLockingBanner from './OptimisticLockingBanner';
import { ERROR_TYPES } from '../../common/constants';
import Harness from '../../../test/jest/helpers/harness';

const renderOptimisticLockingBanner = (props = {}) => (render(
  <Harness>
    <OptimisticLockingBanner
      latestVersionLink="/some-url"
      {...props}
    />
  </Harness>,
));

describe('Given OptimisticLockingBanner', () => {
  describe('when error is not caused by optimistic locking', () => {
    it('should not render banner', () => {
      const { queryByText } = renderOptimisticLockingBanner();

      expect(queryByText('stripes-components.optimisticLocking.saveError')).toBeNull();
    });
  });

  describe('when error is caused by optimistic locking', () => {
    it('should render banner', () => {
      const { getByText } = renderOptimisticLockingBanner({
        httpError: {
          errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
        },
      });

      expect(getByText('stripes-components.optimisticLocking.saveError')).toBeDefined();
    });
  });
});
