import {
  act,
  cleanup,
} from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import getQuickMarcRecordStatus from './getQuickMarcRecordStatus';

const mockShowCallout = jest.fn();

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(() => mockShowCallout),
}));

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  QM_RECORD_STATUS_TIMEOUT: 5,
  QM_RECORD_STATUS_BAIL_TIME: 20,
}));

const history = {
  push: jest.fn(),
};

const location = {
  search: '?filters=source.MARC',
};

describe('Given getQuickMarcRecordStatus', () => {
  let quickMarcRecordStatusGETRequest;

  beforeEach(() => {
    quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({}));
  });

  afterEach(cleanup);

  describe('when form is valid and status is created', () => {
    describe('when instanceId is passed to props', () => {
      it('should show success toast notification and redirect to the right page', async () => {
        const externalId = faker.random.uuid();

        quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({
          externalId,
          jobExecutionId: faker.random.uuid(),
          status: 'COMPLETED',
        }));

        await act(async () => {
          getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest,
            showCallout: mockShowCallout,
            history,
            location,
            instanceId: 'instance-id',
          });
        });

        await new Promise(resolve => {
          setTimeout(() => {
            expect(quickMarcRecordStatusGETRequest).toHaveBeenCalled();
            expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.success' });
            expect(history.push).toHaveBeenCalledWith({
              pathname: `/inventory/view/instance-id/${externalId}`,
              search: location.search,
            });

            resolve();
          }, 10);
        });
      }, 1000);
    });

    describe('when instanceId is not passed to props', () => {
      it('should show success toast notification and redirect to the right page', async () => {
        const externalId = faker.random.uuid();

        quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({
          externalId,
          jobExecutionId: faker.random.uuid(),
          status: 'COMPLETED',
        }));

        await act(async () => {
          getQuickMarcRecordStatus({
            quickMarcRecordStatusGETRequest,
            showCallout: mockShowCallout,
            history,
            location,
          });
        });

        await new Promise(resolve => {
          setTimeout(() => {
            expect(quickMarcRecordStatusGETRequest).toHaveBeenCalled();
            expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.success' });
            expect(history.push).toHaveBeenCalledWith({
              pathname: `/inventory/view/${externalId}`,
              search: location.search,
            });

            resolve();
          }, 10);
        });
      }, 1000);
    });
  });

  describe('when form is valid and status is error', () => {
    it('should show error toast notification', async () => {
      quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({
        externalId: null,
        jobExecutionId: faker.random.uuid(),
        status: 'ERROR',
      }));

      await act(async () => {
        getQuickMarcRecordStatus({
          quickMarcRecordStatusGETRequest,
          showCallout: mockShowCallout,
          history,
          location,
        });
      });

      await new Promise(resolve => {
        setTimeout(() => {
          expect(quickMarcRecordStatusGETRequest).toHaveBeenCalled();
          expect(mockShowCallout).toHaveBeenCalledWith({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });

          resolve();
        }, 10);
      });
    }, 1000);
  });

  describe('when form is valid and fetch is failed', () => {
    it('should show error toast notification', async () => {
      quickMarcRecordStatusGETRequest = jest.fn(() => Promise.reject());

      await act(async () => {
        getQuickMarcRecordStatus({
          quickMarcRecordStatusGETRequest,
          showCallout: mockShowCallout,
          history,
          location,
        });
      });

      await new Promise(resolve => {
        setTimeout(() => {
          expect(quickMarcRecordStatusGETRequest).toHaveBeenCalled();
          expect(mockShowCallout).toHaveBeenCalledWith({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });

          resolve();
        }, 10);
      });
    }, 1000);
  });
});
