import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  useHistory,
  useLocation,
} from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import find from 'lodash/find';
import noop from 'lodash/noop';
import { FormSpy } from 'react-final-form';

import {
  IfPermission,
  checkIfUserInCentralTenant,
  useStripes,
} from '@folio/stripes/core';
import stripesFinalForm from '@folio/stripes/final-form';
import {
  Pane,
  Paneset,
  PaneMenu,
  Row,
  Col,
  ConfirmationModal,
  PaneFooter,
  Button,
  HasCommand,
  checkScope,
  Layer,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import { OptimisticLockingBanner } from './OptimisticLockingBanner';
import { AutoLinkingButton } from './AutoLinkingButton';
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
  is1XXUpdated,
  is010$aUpdated,
  is010LinkedToBibRecord,
  updateRecordAtIndex,
  markLinkedRecords,
} from './utils';
import { useAuthorityLinking } from '../hooks';

import css from './QuickMarcEditor.css';

const spySubscription = { values: true };

const CONFIRMATIONS = {
  DELETE_RECORDS: 'DELETE_RECORDS',
  UPDATE_LINKED: 'UPDATE_LINKED',
};

const REQUIRED_CONFIRMATIONS = {
  [CONFIRMATIONS.DELETE_RECORDS]: true,
  [CONFIRMATIONS.UPDATE_LINKED]: true,
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
    getState,
  },
  marcType,
  fixedFieldSpec,
  locations,
  httpError,
  externalRecordPath,
  confirmRemoveAuthorityLinking,
  linksCount,
  validate,
  onCheckCentralTenantPerm,
}) => {
  const stripes = useStripes();
  const formValues = getState().values;
  const history = useHistory();
  const location = useLocation();
  const showCallout = useShowCallout();
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isUnlinkRecordsModalOpen, setIsUnlinkRecordsModalOpen] = useState(false);
  const [isUpdate0101xxfieldsAuthRecModalOpen, setIsUpdate0101xxfieldsAuthRecModalOpen] = useState(false);
  const [isLoadingLinkSuggestions, setIsLoadingLinkSuggestions] = useState(false);
  const continueAfterSave = useRef(false);
  const formRef = useRef(null);
  const confirmationChecks = useRef({ ...REQUIRED_CONFIRMATIONS });
  const isConsortiaEnv = stripes.hasInterface('consortia');
  const searchParameters = new URLSearchParams(location.search);
  const isShared = searchParameters.get('shared') === 'true';

  const { unlinkAuthority } = useAuthorityLinking({ marcType, action });

  const deletedRecords = useMemo(() => {
    return records
      .map((record, index) => ({ index, record }))
      .filter(({ record }) => record._isDeleted);
  }, [records]);

  const leader = records[0];
  const type = leader?.content?.[6] || '';
  const subtype = leader?.content?.[7] || '';

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

  const closeModals = () => {
    setIsDeleteModalOpened(false);
    setIsUpdate0101xxfieldsAuthRecModalOpen(false);
    setIsUnlinkRecordsModalOpen(false);
  };

  const confirmSubmit = useCallback((e, isKeepEditing = false) => {
    continueAfterSave.current = isKeepEditing;

    const validationError = validate(getState().values);

    if (validationError) {
      showCallout({
        message: validationError,
        type: 'error',
      });

      return;
    }

    if (confirmationChecks.current[CONFIRMATIONS.DELETE_RECORDS] && deletedRecords.length) {
      setIsDeleteModalOpened(true);

      return;
    }

    if (confirmationChecks.current[CONFIRMATIONS.UPDATE_LINKED] && marcType === MARC_TYPES.AUTHORITY && linksCount) {
      if (is1XXUpdated(initialValues.records, records)) {
        setIsUpdate0101xxfieldsAuthRecModalOpen(true);

        return;
      }

      if (
        is010$aUpdated(initialValues.records, records) &&
        is010LinkedToBibRecord(initialValues.records, instance.naturalId)
      ) {
        setIsUpdate0101xxfieldsAuthRecModalOpen(true);

        return;
      }
    }

    handleSubmit(e)
      .then(handleSubmitResponse)
      .finally(closeModals);
  }, [
    deletedRecords,
    handleSubmit,
    handleSubmitResponse,
    marcType,
    initialValues,
    linksCount,
    records,
    getState,
    validate,
    showCallout,
    instance,
  ]);

  const paneFooter = useMemo(() => {
    const start = (
      <Button
        buttonStyle="default mega"
        onClick={() => onClose()}
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
            onClick={(event) => {
              confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
              confirmSubmit(event, true);
            }}
            marginBottom0
          >
            <FormattedMessage id="ui-quick-marc.record.save.continue" />
          </Button>
        )}
        <Button
          buttonStyle="primary mega"
          disabled={saveFormDisabled}
          id="quick-marc-record-save"
          onClick={(e) => {
            confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
            confirmSubmit(e);
          }}
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
  }, [confirmSubmit, saveFormDisabled, onClose, action]);

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
    let formattedMessageValues = {
      title: instance.title,
      shared: isConsortiaEnv ? isShared : null,
    };

    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      formattedMessageValues = {
        ...formattedMessageValues,
        location: find(locations, { id: instance?.effectiveLocationId })?.name,
        callNumber: instance?.callNumber,
      };
    } else if ((marcType === MARC_TYPES.AUTHORITY) && records.length) {
      const currentHeading = records.find((recordRow) => {
        return recordRow.tag === recordInfoProps.correspondingMarcTag;
      });

      const initialHeading = initialValues.records.find((recordRow) => {
        return recordRow.tag === recordInfoProps.correspondingMarcTag;
      });

      const headingContent = currentHeading?.content || initialHeading?.content;

      formattedMessageValues = {
        shared: isConsortiaEnv ? checkIfUserInCentralTenant(stripes) : null,
        title: getContentSubfieldValue(headingContent).$a?.[0],
      };
    } else if (marcType === MARC_TYPES.BIB && action !== QUICK_MARC_ACTIONS.EDIT) {
      formattedMessageValues = {
        shared: isConsortiaEnv ? checkIfUserInCentralTenant(stripes) : null,
      };
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

  const cancelUpdateLinks = () => {
    setIsUpdate0101xxfieldsAuthRecModalOpen(false);
  };

  const confirmUpdateLinks = (e) => {
    confirmationChecks.current[CONFIRMATIONS.UPDATE_LINKED] = false;
    confirmSubmit(e, continueAfterSave.current);
  };

  const confirmDeleteFields = (e) => {
    setIsDeleteModalOpened(false);
    confirmationChecks.current[CONFIRMATIONS.DELETE_RECORDS] = false;
    confirmSubmit(e, continueAfterSave.current);
  };

  const cancelDeleteFields = () => {
    setIsDeleteModalOpened(false);

    if (deletedRecords.length) {
      restoreDeletedRecords();
    } else {
      reset();
    }
  };

  const cancelRemoveLinking = () => {
    setIsUnlinkRecordsModalOpen(false);
  };

  const confirmRemoveLinking = () => {
    // unlink all linked records
    initialValues.records.filter(record => record._isLinked).forEach(record => {
      unlinkAuthority(record);
      mutators.markRecordUnlinked({ index: records.findIndex(rec => rec.id === record.id) });
    });
    setIsUnlinkRecordsModalOpen(false);
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
        confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
        confirmSubmit(e, continueAfterSave.current);
      }
    },
  }, {
    name: 'cancel',
    shortcut: 'esc',
    handler: () => {
      onClose();
    },
  }]), [saveFormDisabled, confirmSubmit, onClose]);

  useEffect(() => {
    if (!httpError) {
      return;
    }

    let messageId = '';

    if (httpError.errorType === ERROR_TYPES.OPTIMISTIC_LOCKING) {
      return;
    } else if (httpError.code === 'ILLEGAL_FIXED_LENGTH_CONTROL_FIELD') {
      messageId = 'ui-quick-marc.record.save.error.illegalFixedLength';
    } else if (httpError.httpStatus === 404) {
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
              lastMenu={(
                <PaneMenu>
                  <AutoLinkingButton
                    action={action}
                    marcType={marcType}
                    formValues={formValues}
                    isLoadingLinkSuggestions={isLoadingLinkSuggestions}
                    onMarkRecordsLinked={mutators.markRecordsLinked}
                    onSetIsLoadingLinkSuggestions={setIsLoadingLinkSuggestions}
                  />
                </PaneMenu>
              )}
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
                    fixedFieldSpec={fixedFieldSpec}
                    instance={instance}
                    linksCount={linksCount}
                    isLoadingLinkSuggestions={isLoadingLinkSuggestions}
                    onCheckCentralTenantPerm={onCheckCentralTenantPerm}
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
        onConfirm={confirmDeleteFields}
        onCancel={cancelDeleteFields}
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
              onConfirm={confirmRemoveLinking}
              onCancel={cancelRemoveLinking}
              buttonStyle="danger"
            />
          </IfPermission>
        )
      }
      <ConfirmationModal
        id="quick-marc-update-linked-bib-fields"
        open={isUpdate0101xxfieldsAuthRecModalOpen}
        heading={<FormattedMessage id="ui-quick-marc.update-linked-bib-fields.modal.label" />}
        message={
          <FormattedMessage
            id="ui-quick-marc.update-linked-bib-fields.modal.message-save"
            values={{ count: linksCount }}
          />
        }
        confirmLabel={<FormattedMessage id="ui-quick-marc.update-linked-bib-fields.modal.save" />}
        cancelLabel={<FormattedMessage id="ui-quick-marc.update-linked-bib-fields.modal.keep-editing" />}
        onConfirm={confirmUpdateLinks}
        onCancel={cancelUpdateLinks}
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
    getState: PropTypes.func.isRequired,
    mutators: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
  }),
  marcType: PropTypes.oneOf(Object.values(MARC_TYPES)).isRequired,
  fixedFieldSpec: PropTypes.object.isRequired,
  linksCount: PropTypes.number,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  httpError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
    errorType: PropTypes.string,
    httpStatus: PropTypes.number,
  }),
  confirmRemoveAuthorityLinking: PropTypes.bool,
  validate: PropTypes.func.isRequired,
  onCheckCentralTenantPerm: PropTypes.func,
};

QuickMarcEditor.defaultProps = {
  httpError: null,
  confirmRemoveAuthorityLinking: false,
  onCheckCentralTenantPerm: noop,
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
    markRecordsLinked: ([{ fields }], state, tools) => {
      const records = markLinkedRecords(fields);

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
    updateRecord: ([{ index, field }], state, tools) => {
      const records = updateRecordAtIndex(index, field, state);

      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
