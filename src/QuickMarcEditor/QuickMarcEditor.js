import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useHistory, useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import find from 'lodash/find';
import { FormSpy } from 'react-final-form';

import { IfPermission } from '@folio/stripes/core';
import stripesFinalForm from '@folio/stripes/final-form';
import {
  Pane,
  Paneset,
  Row,
  Col,
  ConfirmationModal,
  PaneFooter,
  Button,
  HasCommand,
  checkScope,
  Layer,
} from '@folio/stripes/components';
import {
  useShowCallout,
} from '@folio/stripes-acq-components';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import { OptimisticLockingBanner } from './OptimisticLockingBanner';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  ERROR_TYPES,
  MARC_TYPES,
} from '../common/constants';
import {
  addNewRecord,
  markDeletedRecordByIndex,
  markLinkedRecordByIndex,
  markUnlinkedRecordByIndex,
  reorderRecords,
  restoreRecordAtIndex,
  getCorrespondingMarcTag,
  getContentSubfieldValue,
  deleteRecordByIndex,
  are010Or1xxUpdated,
} from './utils';
import { useAuthorityLinking } from '../hooks';

import css from './QuickMarcEditor.css';

const spySubscription = { values: true };

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
  marcType,
  locations,
  httpError,
  externalRecordPath,
  confirmRemoveAuthorityLinking,
  numOfLinks,
}) => {
  const history = useHistory();
  const location = useLocation();
  const showCallout = useShowCallout();
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isUnlinkRecordsModalOpen, setIsUnlinkRecordsModalOpen] = useState(false);
  const [isUpdateLinkedBibFieldsModalOpen, setIsUpdateLinkedBibFieldsModalOpen] = useState(false);
  const continueAfterSave = useRef(false);
  const formRef = useRef(null);

  const { unlinkAuthority } = useAuthorityLinking();

  const deletedRecords = useMemo(() => {
    return records
      .map((record, index) => ({ index, record }))
      .filter(({ record }) => record._isDeleted);
  }, [records]);

  const leader = records[0];
  const type = leader?.content?.[6];
  const subtype = leader?.content?.[7];

  const saveFormDisabled = action === QUICK_MARC_ACTIONS.EDIT
    ? pristine || submitting
    : submitting;

  const redirectToVersion = useCallback((updatedVersion) => {
    const searchParams = new URLSearchParams(location.search);

    searchParams.set('relatedRecordVersion', updatedVersion);

    history.replace({
      search: searchParams.toString(),
    });
  }, [history, location.search]);

  const handleSubmitResponse = useCallback((updatedRecord) => {
    if (!updatedRecord?.version) {
      continueAfterSave.current = false;

      return;
    }

    if (continueAfterSave.current) {
      redirectToVersion(updatedRecord.version);

      return;
    }

    onClose();
  }, [redirectToVersion, onClose]);

  const confirmSubmit = useCallback((e) => {
    if (deletedRecords.length) {
      setIsDeleteModalOpened(true);
    }

    handleSubmit(e).then((updatedRecord) => {
      handleSubmitResponse(updatedRecord);
    });
  }, [deletedRecords, handleSubmit, handleSubmitResponse]);

  const handleFooterSave = useCallback((e, isKeepEditing = false) => {
    continueAfterSave.current = isKeepEditing;

    // invoke confirmation modal if
    // 1. marcType is authority
    // 2. there are bib records linked to this authority
    // 3. 010 or 1xx are updated
    const are1XXor010fieldsUpdated = are010Or1xxUpdated(initialValues.records, records);

    if (marcType === MARC_TYPES.AUTHORITY && numOfLinks > 0 && are1XXor010fieldsUpdated) {
      setIsUpdateLinkedBibFieldsModalOpen(true);
    } else {
      confirmSubmit(e);
    }
  }, [confirmSubmit, numOfLinks, marcType, initialValues, records]);

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
      <>
        {action === QUICK_MARC_ACTIONS.EDIT && (
          <Button
            buttonStyle="default mega"
            buttonClass={css.saveContinueBtn}
            disabled={saveFormDisabled}
            id="quick-marc-record-save-edit"
            // onClick={(event) => confirmSubmit(event, true)}
            onClick={(event) => handleFooterSave(event, true)}
            marginBottom0
          >
            <FormattedMessage id="ui-quick-marc.record.save.continue" />
          </Button>
        )}
        <Button
          buttonStyle="primary mega"
          disabled={saveFormDisabled}
          id="quick-marc-record-save"
          // onClick={confirmSubmit}
          onClick={handleFooterSave}
          marginBottom0
        >
          <FormattedMessage id="stripes-acq-components.FormFooter.save" />
        </Button>
      </>
    );

    return (
      <PaneFooter
        renderStart={start}
        renderEnd={end}
      />
    );
  }, [handleFooterSave, saveFormDisabled, onClose, action]);

  const getConfirmModalMessage = () => (
    <FormattedMessage
      id="ui-quick-marc.record.delete.message"
      values={{ count: deletedRecords.length }}
    />
  );

  const recordInfoProps = {
    status: initialValues?.updateInfo?.recordState,
    updateDate: initialValues?.updateInfo?.updateDate,
    updatedBy: initialValues?.updateInfo?.updatedBy,
    isEditAction: action === QUICK_MARC_ACTIONS.EDIT,
    marcType,
  };

  if ((marcType === MARC_TYPES.AUTHORITY) && records.length) {
    recordInfoProps.correspondingMarcTag = getCorrespondingMarcTag(initialValues.records);
  }

  const getPaneTitle = () => {
    let formattedMessageValues = {};

    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      formattedMessageValues = {
        location: find(locations, { id: instance?.effectiveLocationId })?.name,
        callNumber: instance?.callNumber,
      };
    } else {
      if (!instance) {
        return '';
      }

      if ((marcType === MARC_TYPES.AUTHORITY) && records.length) {
        const currentHeading = records.find((recordRow) => {
          return recordRow.tag === recordInfoProps.correspondingMarcTag;
        });

        const initialHeading = initialValues.records.find((recordRow) => {
          return recordRow.tag === recordInfoProps.correspondingMarcTag;
        });

        const headingContent = currentHeading?.content || initialHeading?.content;

        formattedMessageValues = {
          title: getContentSubfieldValue(headingContent).$a,
        };
      } else {
        formattedMessageValues = instance;
      }
    }

    return (
      <FormattedMessage
        id={`ui-quick-marc.${marcType}-record.${action}.title`}
        values={formattedMessageValues}
      />
    );
  };

  const restoreDeletedRecords = () => {
    deletedRecords.forEach(mutators.restoreRecord);
  };

  const onConfirmModal = (e) => {
    setIsDeleteModalOpened(false);
    handleSubmit(e).then((updatedRecord) => handleSubmitResponse(updatedRecord));
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
    if (values?.records) {
      setRecords(values.records);
    }
  }, []);

  const shortcuts = useMemo(() => ([{
    name: 'save',
    shortcut: 'mod+s',
    handler: (e) => {
      if (!saveFormDisabled) {
        e.preventDefault();
        confirmSubmit();
      }
    },
  }, {
    name: 'cancel',
    shortcut: 'esc',
    handler: () => {
      onClose();
    },
  }]), [saveFormDisabled, confirmSubmit, onClose]);

  const handleKeepLinking = () => {
    setIsUnlinkRecordsModalOpen(false);
  };

  const handleRemoveLinking = () => {
    // unlink all linked records
    initialValues.records.filter(record => record._isLinked).forEach(record => {
      unlinkAuthority(record);
      mutators.markRecordUnlinked({ index: records.findIndex(rec => rec.id === record.id) });
    });
    setIsUnlinkRecordsModalOpen(false);
  };

  const handleKeepEditingLinkedFields = () => {
    setIsUpdateLinkedBibFieldsModalOpen(false);
  };

  useEffect(() => {
    if (!httpError) {
      return;
    }

    let messageId = '';

    if (httpError.errorType === ERROR_TYPES.OPTIMISTIC_LOCKING) {
      return;
    } else if (httpError.code === 'ILLEGAL_FIXED_LENGTH_CONTROL_FIELD') {
      messageId = 'ui-quick-marc.record.save.error.illegalFixedLength';
    } else if (httpError.message === 'Not found') {
      messageId = 'ui-quick-marc.record.save.error.notFound';
    } else {
      messageId = 'ui-quick-marc.record.save.error.generic';
    }

    showCallout({ messageId, type: 'error' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpError]);

  useEffect(() => {
    if (confirmRemoveAuthorityLinking && initialValues.records.length) {
      const linkedRecordsCount = initialValues.records.filter(record => record._isLinked).length;

      setIsUnlinkRecordsModalOpen(linkedRecordsCount > 0);
    }
  }, [confirmRemoveAuthorityLinking, initialValues]);

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={formRef.current}
    >
      <form ref={formRef}>
        <Paneset>
          <Layer
            isOpen
            contentLabel="ui-quick-marc.record.quickMarcEditorLabel"
          >
            <Pane
              id="quick-marc-editor-pane"
              dismissible
              onClose={onClose}
              defaultWidth="100%"
              paneTitle={getPaneTitle()}
              paneSub={<QuickMarcRecordInfo {...recordInfoProps} />}
              footer={paneFooter}
            >
              <OptimisticLockingBanner
                httpError={httpError}
                latestVersionLink={externalRecordPath}
              />
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
                    type={type}
                    subtype={subtype}
                    marcType={marcType}
                  />
                </Col>
              </Row>
            </Pane>
          </Layer>
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
      {
        confirmRemoveAuthorityLinking && (
          <IfPermission perm="ui-quick-marc.quick-marc-authority-records.linkUnlink">
            <ConfirmationModal
              id="quick-marc-remove-authority-linking-confirm-modal"
              open={isUnlinkRecordsModalOpen}
              heading={<FormattedMessage id="ui-quick-marc.remove-authority-linking.modal.label" />}
              message={<FormattedMessage id="ui-quick-marc.remove-authority-linking.modal.message" />}
              confirmLabel={<FormattedMessage id="ui-quick-marc.remove-authority-linking.modal.remove-linking" />}
              cancelLabel={<FormattedMessage id="ui-quick-marc.remove-authority-linking.modal.keep-linking" />}
              onConfirm={handleRemoveLinking}
              onCancel={handleKeepLinking}
              buttonStyle="danger"
            />
          </IfPermission>
        )
      }
      <ConfirmationModal
        id="quick-marc-update-linked-bib-fields"
        open={isUpdateLinkedBibFieldsModalOpen}
        heading={<FormattedMessage id="ui-quick-marc.update-linked-bib-fields.modal.label" />}
        message={
          <FormattedMessage
            id={continueAfterSave.current ? 'ui-quick-marc.update-linked-bib-fields.modal.message-save-and-editing' : 'ui-quick-marc.update-linked-bib-fields.modal.message-save-and-close'}
            values={{ count: numOfLinks, saveName: continueAfterSave.current ? 'Save & editing' : 'Save & close' }}
          />
        }
        confirmLabel={
          <FormattedMessage
            id={continueAfterSave.current ? 'ui-quick-marc.update-linked-bib-fields.modal.saveAndEditing' : 'ui-quick-marc.update-linked-bib-fields.modal.saveAndClose'}
          />
        }
        cancelLabel={<FormattedMessage id="ui-quick-marc.update-linked-bib-fields.modal.keep-editing" />}
        onConfirm={confirmSubmit}
        onCancel={handleKeepEditingLinkedFields}
      />
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </HasCommand>
  );
};

QuickMarcEditor.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
  externalRecordPath: PropTypes.string,
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
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  httpError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
    errorType: PropTypes.string,
  }),
  confirmRemoveAuthorityLinking: PropTypes.bool,
  numOfLinks: PropTypes.number,
};

QuickMarcEditor.defaultProps = {
  httpError: null,
  confirmRemoveAuthorityLinking: false,
};

export default stripesFinalForm({
  navigationCheck: true,
  mutators: {
    addRecord: ([{ index }], state, tools) => {
      const records = addNewRecord(index, state);

      tools.changeValue(state, 'records', () => records);
    },
    markRecordDeleted: ([{ index }], state, tools) => {
      const records = markDeletedRecordByIndex(index, state);

      tools.changeValue(state, 'records', () => records);
    },
    markRecordLinked: ([{ index, field }], state, tools) => {
      const records = markLinkedRecordByIndex(index, field, state);

      tools.changeValue(state, 'records', () => records);
    },
    markRecordUnlinked: ([{ index }], state, tools) => {
      const records = markUnlinkedRecordByIndex(index, state);

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
    restoreRecord: ([{ index }], state, tools) => {
      const records = restoreRecordAtIndex(index, state);

      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
