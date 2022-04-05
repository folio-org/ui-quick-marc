import React from 'react';
import {
  render,
  cleanup,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import '@folio/stripes-acq-components/test/jest/__mock__';

import OptimisticLockingBanner from './OptimisticLockingBanner';
import { ERROR_TYPES } from '../../common/constants';

const renderOptimisticLockingBanner = (props) => (render(
  <MemoryRouter>
    <OptimisticLockingBanner
      latestVersionLink="/some-url"
      {...props}
    />
  </MemoryRouter>,
));

describe('Given OptimisticLockingBanner', () => {
  afterEach(cleanup);

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
