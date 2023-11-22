import {
  useCallback,
  useState,
} from 'react';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  Modal,
  Col,
  Row,
  Select,
} from '@folio/stripes/components';

const propTypes = {
  open: PropTypes.bool.isRequired,
  sourceFileOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const SourceFileLookupModal = ({
  open,
  sourceFileOptions,
  onConfirm,
  onCancel,
}) => {
  const intl = useIntl();

  const [selectedSourceFile, setSelectedSourceFile] = useState('');

  const onCancelModal = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onConfirmModal = useCallback(() => {
    onConfirm(selectedSourceFile);
  }, [onConfirm, selectedSourceFile]);

  const onSourceFileChange = useCallback((e) => {
    setSelectedSourceFile(e.target.value);
  }, [setSelectedSourceFile]);

  const renderForm = useCallback(() => {
    return (
      <>
        <Row>
          <Col xs={12}>
            <Select
              label={intl.formatMessage({ id: 'ui-quick-marc.sourceFileLookupModal.fieldLabel' })}
              placeholder={intl.formatMessage({ id: 'ui-quick-marc.sourceFileLookupModal.placeholder' })}
              onChange={onSourceFileChange}
              value={selectedSourceFile}
              dataOptions={sourceFileOptions}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <Row between="xs">
              <Col xs={3}>
                <Button
                  onClick={onCancelModal}
                  fullWidth
                >
                  <FormattedMessage id="stripes-components.cancel" />
                </Button>
              </Col>
              <Col xs={3}>
                <Button
                  onClick={onConfirmModal}
                  disabled={!selectedSourceFile}
                  buttonStyle="primary"
                  fullWidth
                >
                  <FormattedMessage id="stripes-components.saveAndClose" />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  }, [sourceFileOptions, intl, onCancelModal, onConfirmModal, selectedSourceFile, onSourceFileChange]);

  return (
    <Modal
      open={open}
      size="small"
      label={intl.formatMessage({ id: 'ui-quick-marc.sourceFileLookupModal' })}
      onClose={onCancel}
    >
      {renderForm()}
    </Modal>
  );
};

SourceFileLookupModal.propTypes = propTypes;

export { SourceFileLookupModal };
