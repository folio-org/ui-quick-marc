import {
  QM_RECORD_STATUS_TIMEOUT,
  QM_RECORD_STATUS_BAIL_TIME,
} from './constants';

const getQuickMarcRecordStatus = ({
  mutator,
  qmRecordId,
  instanceId,
  showCallout,
  history,
  location,
}) => {
  const maxRequestAttempts = QM_RECORD_STATUS_BAIL_TIME / QM_RECORD_STATUS_TIMEOUT;
  let requestCount = 1;
  let intervalId;

  function makeRequest() {
    mutator.quickMarcRecordStatus.GET({ params: { qmRecordId } })
      .then(({ externalId, status }) => {
        if (status === 'ERROR') {
          clearInterval(intervalId);
          showCallout({
            messageId: 'ui-quick-marc.record.saveNew.error',
            type: 'error',
          });
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
          showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

          const path = instanceId
            ? `/inventory/view/${instanceId}/${externalId}`
            : `/inventory/view/${externalId}`;

          history.push({
            pathname: path,
            search: location.search,
          });
        }
      })
      .catch(() => {
        showCallout({
          messageId: 'ui-quick-marc.record.saveNew.error',
          type: 'error',
        });
      });
  }

  makeRequest();

  intervalId = setInterval(makeRequest, QM_RECORD_STATUS_TIMEOUT);
};

export default getQuickMarcRecordStatus;
