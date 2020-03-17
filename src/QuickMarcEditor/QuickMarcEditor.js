import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';

import {
  Pane,
  Paneset,
} from '@folio/stripes/components';
import {
  FormFooter,
} from '@folio/stripes-acq-components';

const QuickMarcEditor = ({ instance, onClose }) => {
  const paneFooter = useMemo(() => (
    <FormFooter
      id="quick-marc-record-save"
      handleSubmit={() => {}}
      onCancel={onClose}
      submitting
      pristine
    />
  ), [onClose]);

  return (
    <Paneset>
      <Pane
        id="quick-marc-editor-pane"
        dismissible
        onClose={onClose}
        defaultWidth="100%"
        paneTitle={instance?.title || ''}
        footer={paneFooter}
      >
        <div
          data-test-quick-marc-editor={instance?.id}
          data-testid="quick-marc-editor"
        >
          Quick MARC Editor
        </div>
      </Pane>
    </Paneset>
  );
};

QuickMarcEditor.propTypes = {
  instance: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default QuickMarcEditor;
