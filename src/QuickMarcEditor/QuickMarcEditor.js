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
  ConfirmationModal,
  PaneFooter,
  Button,
} from '@folio/stripes/components';

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
  action,
  instance,
  onClose,
  handleSubmit,
  submitting,
  pristine,
  initialValues,
  form: {
    mutators,
    reset,
  },
}) => {
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [deletedRecordsCount, setDeletedRecordsCount] = useState(0);

  const confirmSubmit = useCallback((props) => {
    if (deletedRecordsCount) {
      setIsDeleteModalOpened(true);

      return;
    }

    handleSubmit(props);
  }, [deletedRecordsCount]);

  const paneFooter = useMemo(() => {
    const start = (
      <Button
        buttonStyle="default mega"
        onClick={onClose}
      >
        <FormattedMessage id="stripes-acq-components.FormFooter.cancel" />
      </Button>
    );

    const end = (
      <Button
        buttonStyle="primary mega"
        disabled={pristine || submitting}
        id="quick-marc-record-save"
        onClick={confirmSubmit}
      >
        <FormattedMessage id="stripes-acq-components.FormFooter.save" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={start}
        renderEnd={end}
      />
    );
  }, [onClose, confirmSubmit, pristine, submitting]);

  const confirmModalMessage = () => (
    <FormattedMessage
      id="ui-quick-marc.record.delete.message"
      values={{ count: deletedRecordsCount }}
    />
  );

  const onConfirmModal = (props) => {
    setIsDeleteModalOpened(false);
    handleSubmit(props);
  };

  const onCancelModal = () => {
    setIsDeleteModalOpened(false);
    setDeletedRecordsCount(0);
    reset();
  };

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
            paneTitle={instance
              ? <FormattedMessage id={`ui-quick-marc.record.${action}.title`} values={instance} />
              : ''
            }
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
                  setDeletedRecordsCount={setDeletedRecordsCount}
                />
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
      <ConfirmationModal
        id="quick-marc-confirm-modal"
        open={isDeleteModalOpened}
        heading={<FormattedMessage id="ui-quick-marc.record.delete.title" />}
        message={confirmModalMessage()}
        confirmLabel={<FormattedMessage id="ui-quick-marc.record.delete.confirmLabel" />}
        onConfirm={onConfirmModal}
        onCancel={onCancelModal}
      />
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </HotKeys>
  );
};

QuickMarcEditor.propTypes = {
  action: PropTypes.string.isRequired,
  instance: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  form: PropTypes.shape({
    mutators: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
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
