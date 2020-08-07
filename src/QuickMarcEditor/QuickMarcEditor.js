import React, {
  useMemo,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Pane,
  Paneset,
  Row,
  Col,
  HotKeys,
} from '@folio/stripes/components';
import {
  FormFooter,
} from '@folio/stripes-acq-components';
import { FormSpy } from 'react-final-form';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import {
  addNewRecord,
  deleteRecordByIndex,
  reorderRecords,
  shouldRecordsUpdate,
} from './utils';

const spySubscription = { values: true };
const hotKeys = {
  save: ['ctrl+s'],
};

const QuickMarcEditor = ({
  instance,
  onClose,
  handleSubmit,
  submitting,
  pristine,
  initialValues,
  form: { mutators },
}) => {
  const [records, setRecords] = useState([]);
  const paneFooter = useMemo(() => (
    <FormFooter
      id="quick-marc-record-save"
      handleSubmit={handleSubmit}
      onCancel={onClose}
      submitting={submitting}
      pristine={pristine}
    />
  ), [onClose, handleSubmit, submitting, pristine]);

  const changeRecords = useCallback(({ values }) => {
    if (
      values?.records
      && shouldRecordsUpdate(records, values.records)
    ) {
      setTimeout(() => setRecords(values.records), 0);
    }
  }, [records]);

  const hotKeysHandlers = useMemo(() => ({
    save: e => {
      e.preventDefault();

      if (!(pristine || submitting)) {
        handleSubmit();
      }
    },
  }), [handleSubmit, pristine, submitting]);

  return (
    <HotKeys
      keyMap={hotKeys}
      handlers={hotKeysHandlers}
    >
      <form>
        <Paneset>
          <Pane
            id="quick-marc-editor-pane"
            dismissible
            onClose={onClose}
            defaultWidth="100%"
            paneTitle={instance ? <FormattedMessage id="ui-quick-marc.record.edit.title" values={instance} /> : ''}
            paneSub={(
              <QuickMarcRecordInfo
                status={initialValues?.updateInfo?.recordState}
                updateDate={initialValues?.updateInfo?.updateDate}
              />
            )}
            footer={paneFooter}
          >
            <Row>
              <Col
                xs={12}
                data-test-quick-marc-editor={instance?.id}
                data-testid="quick-marc-editor"
              >
                <QuickMarcEditorRows
                  fields={records}
                  name="records"
                  mutators={mutators}
                  type={initialValues?.leader[6]}
                  subtype={initialValues?.leader[7]}
                />
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </HotKeys>
  );
};

QuickMarcEditor.propTypes = {
  instance: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  form: PropTypes.shape({
    mutators: PropTypes.object.isRequired,
  }),
};

export default stripesFinalForm({
  navigationCheck: true,
  mutators: {
    addRecord: ([{ index }], state, tools) => {
      const records = addNewRecord(index, state);

      tools.changeValue(state, 'records', () => records);
    },
    deleteRecord: ([{ index }], state, tools) => {
      const records = deleteRecordByIndex(index, state);

      tools.changeValue(state, 'records', () => records);
    },
    moveRecord: ([{ index, indexToSwitch }], state, tools) => {
      const records = reorderRecords(index, indexToSwitch, state);

      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
