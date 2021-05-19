import React, {
  useMemo,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import noop from 'lodash/noop';

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
import { QUICK_MARC_ACTIONS } from './constants';
import {
  addNewRecord,
  deleteRecordByIndex,
  reorderRecords,
  shouldRecordsUpdate,
  restoreRecordAtIndex,
} from './utils';

const spySubscription = { values: true };
const hotKeys = {
  save: ['mod+s'],
  close: ['mod+alt+h'],
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
  getCancellationModal,
}) => {
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);

  const saveFormDisabled = action === QUICK_MARC_ACTIONS.EDIT
    ? pristine || submitting
    : submitting;

  const confirmSubmit = useCallback((props) => {
    if (deletedRecords.length) {
      setIsDeleteModalOpened(true);

      return;
    }

    handleSubmit(props);
  }, [deletedRecords, handleSubmit]);

  const paneFooter = useMemo(() => {
    const start = (
      <Button
        buttonStyle="default mega"
        onClick={onClose}
        marginBottom0
      >
        <FormattedMessage id="stripes-acq-components.FormFooter.cancel" />
      </Button>
    );

    const end = (
      <Button
        buttonStyle="primary mega"
        disabled={saveFormDisabled}
        id="quick-marc-record-save"
        onClick={confirmSubmit}
        marginBottom0
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
  }, [confirmSubmit, saveFormDisabled, onClose]);

  const getConfirmModalMessage = () => (
    <FormattedMessage
      id="ui-quick-marc.record.delete.message"
      values={{ count: deletedRecords.length }}
    />
  );

  const restoreDeletedRecords = () => {
    deletedRecords.forEach(mutators.restoreRecord);
    setDeletedRecords([]);
  };

  const onConfirmModal = (props) => {
    setIsDeleteModalOpened(false);
    handleSubmit(props);
  };

  const onCancelModal = () => {
    setIsDeleteModalOpened(false);

    if (deletedRecords.length) {
      restoreDeletedRecords();
    } else {
      reset();
    }
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

      if (!saveFormDisabled) {
        confirmSubmit();
      }
    },
    close: e => {
      e.preventDefault();
      onClose();
    },
  }), [saveFormDisabled, confirmSubmit, onClose]);

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
              ? (
                <FormattedMessage
                  id={`ui-quick-marc.record.${action}.title`}
                  values={instance}
                />
              )
              : ''
            }
            paneSub={(
              <QuickMarcRecordInfo
                status={initialValues?.updateInfo?.recordState}
                updateDate={initialValues?.updateInfo?.updateDate}
                updatedBy={initialValues?.updateInfo?.updatedBy}
                isEditAction={action === QUICK_MARC_ACTIONS.EDIT}
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
                  action={action}
                  fields={records}
                  name="records"
                  mutators={mutators}
                  type={initialValues?.leader[6]}
                  subtype={initialValues?.leader[7]}
                  setDeletedRecords={setDeletedRecords}
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
        message={getConfirmModalMessage()}
        confirmLabel={<FormattedMessage id="ui-quick-marc.record.delete.confirmLabel" />}
        cancelLabel={<FormattedMessage id="ui-quick-marc.record.delete.cancelLabel" />}
        onConfirm={onConfirmModal}
        onCancel={onCancelModal}
      />
      {getCancellationModal()}
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </HotKeys>
  );
};

QuickMarcEditor.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  instance: PropTypes.object,
  getCancellationModal: PropTypes.func,
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

QuickMarcEditor.defaultProps = {
  getCancellationModal: noop,
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
    restoreRecord: ([{ index, record }], state, tools) => {
      const records = restoreRecordAtIndex(index, record, state);

      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
