import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import uuid from 'uuid';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Pane,
  Paneset,
  Row,
  Col,
} from '@folio/stripes/components';
import {
  FormFooter,
} from '@folio/stripes-acq-components';
import { FormSpy } from 'react-final-form';

import { QuickMarcEditorRows } from './QuickMarcEditorRows';

const spySubscription = { values: true };

const QuickMarcEditor = ({
  instance,
  onClose,
  handleSubmit,
  initialValues,
  submitting,
  pristine,
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
  const initialRecords = initialValues?.records;

  useEffect(() => {
    if (initialRecords) setRecords(initialRecords);
  }, [initialRecords]);

  const addRecord = useCallback(({ values }) => {
    setRecords(values.records);
  }, [records.length]);

  return (
    <>
      <form>
        <Paneset>
          <Pane
            id="quick-marc-editor-pane"
            dismissible
            onClose={onClose}
            defaultWidth="100%"
            paneTitle={instance ? <FormattedMessage id="ui-quick-marc.record.edit.title" values={instance} /> : ''}
            footer={paneFooter}
          >
            <Row>
              <Col
                xs={12}
                md={8}
                mdOffset={2}
                data-test-quick-marc-editor={instance?.id}
                data-testid="quick-marc-editor"
              >
                <QuickMarcEditorRows
                  fields={records}
                  name="records"
                  mutators={mutators}
                />
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
      <FormSpy
        subscription={spySubscription}
        onChange={addRecord}
      />
    </>
  );
};

QuickMarcEditor.propTypes = {
  instance: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  initialValues: PropTypes.object,
  form: PropTypes.shape({
    mutators: PropTypes.object.isRequired,
  }),
};

export default stripesFinalForm({
  navigationCheck: true,
  mutators: {
    addRecord: ([{ index }], state, tools) => {
      const records = [...state.formState.values.records];
      const newIndex = +index + 1;
      const emptyRow = {
        id: uuid(),
        tag: '',
        content: '',
      };

      records.splice(newIndex, 0, emptyRow);
      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
