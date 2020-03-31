import React, {
  useMemo,
  useState,
  useEffect,
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

import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import { FormSpy } from 'react-final-form';

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

  return (
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
              <FormSpy
                subscription={{ values: true }}
              >
                {() => (
                  <QuickMarcEditorRows
                    fields={records}
                    name="records"
                    mutators={mutators}
                    setRecords={setRecords}
                  />
                )}
              </FormSpy>
            </Col>
          </Row>
        </Pane>
      </Paneset>
    </form>
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
    setNewRow: (args, state, tools) => {
      const { index, fields } = args[0];
      const newIndex = index + 1;
      console.log('fields', fields)

      tools.changeValue(state, 'records', () => fields.splice(newIndex, 0, { id: uuid }));
    }
  }
})(QuickMarcEditor);
