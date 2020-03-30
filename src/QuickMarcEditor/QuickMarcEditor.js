import React, {
  useMemo,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

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

const QuickMarcEditor = ({ instance, onClose, handleSubmit, initialValues, submitting, pristine }) => {
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
              <QuickMarcEditorRows
                fields={records}
                name="records"
              />
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
};

export default stripesFinalForm({
  navigationCheck: true,
})(QuickMarcEditor);
