import {
  QM_RECORD_STATUS_TIMEOUT,
  QM_RECORD_STATUS_BAIL_TIME,
  QUICK_MARC_ACTIONS,
} from './constants';

import { MARC_TYPES } from '../common/constants';

const getQuickMarcRecordStatus = ({
  quickMarcRecordStatusGETRequest,
  actionId,
  action,
  marcType,
  onClose,
  instanceId,
  showCallout,
  history,
  location,
}) => {
  const maxRequestAttempts = QM_RECORD_STATUS_BAIL_TIME / QM_RECORD_STATUS_TIMEOUT;
  let requestCount = 1;
  let intervalId;

  function makeRequest() {
    quickMarcRecordStatusGETRequest({ params: { actionId } })
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

        if (externalId !== null && status === 'COMPLETED') {
          clearInterval(intervalId);

          if (action === QUICK_MARC_ACTIONS.EDIT) {
            showCallout({
              messageId: marcType === MARC_TYPES.AUTHORITY
                ? 'ui-quick-marc.record.save.updated'
                : 'ui-quick-marc.record.save.success.processing',
            });

            onClose();
          } else {
            showCallout({ messageId: 'ui-quick-marc.record.saveNew.success' });

            const path = instanceId
              ? `/inventory/view/${instanceId}/${externalId}`
              : `/inventory/view/${externalId}`;

            history.push({
              pathname: path,
              search: location.search,
            });
          }
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
