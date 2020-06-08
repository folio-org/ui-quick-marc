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
  hydrateMarcRecord,
  validateMarcRecord,
} from './utils';
import QuickMarcEditor from './QuickMarcEditor';

const QuickMarcEditorContainer = ({ mutator, match, onClose }) => {
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
        setInstance(instanceResponse);
        setMarcRecord(dehydrateMarcRecordResponse(marcRecordResponse));
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
      .catch(() => {
        showCallout({ messageId: 'ui-quick-marc.record.save.error.generic', type: 'error' });
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
  mutator: PropTypes.object.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withRouter(stripesConnect(QuickMarcEditorContainer));
