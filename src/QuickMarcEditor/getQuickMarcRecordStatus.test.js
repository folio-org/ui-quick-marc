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

describe('Given getQuickMarcRecordStatus', () => {
  let quickMarcRecordStatusGETRequest;

  beforeEach(() => {
    quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({}));
  });

  describe('when form is valid and status is created', () => {
    describe('when instanceId is passed to props', () => {
      it('should resolve Promise', async () => {
        const externalId = faker.random.uuid();
        const marcId = faker.random.uuid();

        quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({
          externalId,
          marcId,
          jobExecutionId: faker.random.uuid(),
          status: 'CREATED',
        }));

        await expect(getQuickMarcRecordStatus({
          quickMarcRecordStatusGETRequest,
          showCallout: mockShowCallout,
          instanceId: 'instance-id',
        })).resolves.toMatchObject({ externalId, marcId });
      }, 1000);
    });
  });

  describe('when form is valid and status is error', () => {
    it('should reject Promise', async () => {
      quickMarcRecordStatusGETRequest = jest.fn(() => Promise.resolve({
        externalId: null,
        jobExecutionId: faker.random.uuid(),
        status: 'ERROR',
      }));

      expect(getQuickMarcRecordStatus({
        quickMarcRecordStatusGETRequest,
        showCallout: mockShowCallout,
      })).rejects.toBeUndefined();
    }, 1000);
  });
});
