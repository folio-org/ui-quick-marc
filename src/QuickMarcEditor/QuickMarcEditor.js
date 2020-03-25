import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'react-final-form-arrays';
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

const QuickMarcEditor = ({ instance, onClose, onSubmit, form: { mutators } }) => {
  const paneFooter = useMemo(() => (
    <FormFooter
      id="quick-marc-record-save"
      handleSubmit={onSubmit}
      onCancel={onClose}
      submitting
      pristine
    />
  ), [onClose, onSubmit]);

  return (
    <form>
      <Paneset>
        <Pane
          id="quick-marc-editor-pane"
          dismissible
          onClose={onClose}
          defaultWidth="100%"
          paneTitle={<FormattedMessage id="ui-quick-marc.record.edit.title" values={instance || {}} />}
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
              <FieldArray
                component={QuickMarcEditorRows}
                id="records"
                name="records"
                mutators={mutators}
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
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.shape({
    mutators: PropTypes.object.isRequired,
  }),
};

export default stripesFinalForm({
  navigationCheck: true,
})(QuickMarcEditor);
