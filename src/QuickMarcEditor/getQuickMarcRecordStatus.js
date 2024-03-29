import {
  QM_RECORD_STATUS_TIMEOUT,
  QM_RECORD_STATUS_BAIL_TIME,
} from './constants';

const getQuickMarcRecordStatus = ({
  quickMarcRecordStatusGETRequest,
  qmRecordId,
  showCallout,
}) => {
  const maxRequestAttempts = QM_RECORD_STATUS_BAIL_TIME / QM_RECORD_STATUS_TIMEOUT;
  let requestCount = 1;
  let intervalId;

  return new Promise((resolve, reject) => {
    function makeRequest() {
      quickMarcRecordStatusGETRequest({ params: { qmRecordId } })
        .then(({ externalId, marcId, status }) => {
          if (status === 'ERROR') {
            clearInterval(intervalId);
            reject();
          }

          if (status === 'IN_PROGRESS') {
            if (requestCount === maxRequestAttempts) {
              clearInterval(intervalId);
              showCallout({ messageId: 'ui-quick-marc.record.saveNew.delay' });
            } else {
              requestCount++;
            }
          }

          if (externalId !== null && status === 'CREATED') {
            clearInterval(intervalId);
            resolve({ externalId, marcId });
          }
        })
        .catch(() => {
          clearInterval(intervalId);
          reject();
        });
    }

    makeRequest();

    intervalId = setInterval(makeRequest, QM_RECORD_STATUS_TIMEOUT);
  });
};

export default getQuickMarcRecordStatus;
