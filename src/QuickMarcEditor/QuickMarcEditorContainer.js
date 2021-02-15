import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import ReactRouterPropTypes from 'react-router-prop-types';

import { stripesConnect } from '@folio/stripes/core';
import { LoadingView } from '@folio/stripes/components';
import {
  baseManifest,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  INVENTORY_INSTANCE_API,
  MARC_RECORD_API,
} from '../common/constants';

import {
  dehydrateMarcRecordResponse,
  formatMarcRecordByQuickMarcAction,
  hydrateMarcRecord,
  validateMarcRecord,
} from './utils';
import { QUICK_MARC_ACTIONS } from './constants';
import QuickMarcEditor from './QuickMarcEditor';

const QuickMarcEditorContainer = ({
  mutator,
  match,
  onClose,
  action = QUICK_MARC_ACTIONS.EDIT,
}) => {
  const instanceId = match.params.instanceId;

  const [instance, setInstance] = useState();
  const [marcRecord, setMarcRecord] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const showCallout = useShowCallout();

  useEffect(() => {
    setIsLoading(true);

    const instancePromise = mutator.quickMarcEditInstance.GET();
    const marcRecordPromise = mutator.quickMarcEditMarcRecord.GET();

    Promise.all([instancePromise, marcRecordPromise])
      .then(([instanceResponse, marcRecordResponse]) => {
        const dehydratedMarcRecord = dehydrateMarcRecordResponse(marcRecordResponse);
        const formattedMarcRecord = formatMarcRecordByQuickMarcAction(dehydratedMarcRecord, action);

        setInstance(instanceResponse);
        setMarcRecord(formattedMarcRecord);
      })
      .catch(() => {
        setInstance();
        setMarcRecord();

        showCallout({ messageId: 'ui-quick-marc.record.load.error', type: 'error' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const closeEditor = useCallback(() => {
    onClose(instanceId);
  }, [instanceId, onClose]);

  const onSubmit = useCallback(async (formValues) => {
    const validationErrorMessage = validateMarcRecord(formValues);

    if (validationErrorMessage) {
      showCallout({ messageId: validationErrorMessage, type: 'error' });

      return;
    }

    mutator.quickMarcEditMarcRecord.PUT(hydrateMarcRecord(formValues))
      .then(() => {
        showCallout({ messageId: 'ui-quick-marc.record.save.success.processing' });
        closeEditor();
      })
      .catch(async (errorResponse) => {
        let messageId;
        let error;

        try {
          error = await errorResponse.json();
        } catch (e) {
          error = {};
        }

        if (error.code === 'ILLEGAL_FIXED_LENGTH_CONTROL_FILED') {
          messageId = 'ui-quick-marc.record.save.error.illegalFixedLength';
        } else {
          messageId = 'ui-quick-marc.record.save.error.generic';
        }

        showCallout({ messageId, type: 'error' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeEditor, showCallout]);

  if (isLoading) {
    return (
      <LoadingView
        dismissible
        onClose={closeEditor}
        defaultWidth="100%"
      />
    );
  }

  return (
    <QuickMarcEditor
      instance={instance}
      onClose={closeEditor}
      initialValues={marcRecord}
      onSubmit={onSubmit}
      action={action}
    />
  );
};

QuickMarcEditorContainer.manifest = Object.freeze({
  quickMarcEditInstance: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: `${INVENTORY_INSTANCE_API}/:{instanceId}`,
  },
  quickMarcEditMarcRecord: {
    ...baseManifest,
    fetch: false,
    accumulate: true,
    path: MARC_RECORD_API,
    pk: 'parsedRecordId',
    GET: {
      params: {
        instanceId: ':{instanceId}',
      },
    },
    headers: {
      accept: 'application/json',
    },
  },
});

QuickMarcEditorContainer.propTypes = {
  action: PropTypes.string,
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withRouter(stripesConnect(QuickMarcEditorContainer));
