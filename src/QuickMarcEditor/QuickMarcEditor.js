import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { useLocation } from 'react-router';
import { FormSpy } from 'react-final-form';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import find from 'lodash/find';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';

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
  Loading,
  Modal,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import { OptimisticLockingBanner } from './OptimisticLockingBanner';
import { AutoLinkingButton } from './AutoLinkingButton';
import { QuickMarcContext } from '../contexts';
import {
  MISSING_FIELD_ID,
  SEVERITY,
  useAuthorityLinking,
  useValidation,
} from '../hooks';
import {
  QUICK_MARC_ACTIONS,
  VALIDATION_MODAL_DELAY,
} from './constants';
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
  getLeaderPositions,
  isDiacritic,
} from './utils';

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
  httpError = null,
  externalRecordPath,
  confirmRemoveAuthorityLinking = false,
  linksCount,
  onCheckCentralTenantPerm = noop,
  validate,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const formValues = getState().values;
  const location = useLocation();
  const showCallout = useShowCallout();
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isUnlinkRecordsModalOpen, setIsUnlinkRecordsModalOpen] = useState(false);
  const [isUpdate0101xxfieldsAuthRecModalOpen, setIsUpdate0101xxfieldsAuthRecModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isLoadingLinkSuggestions, setIsLoadingLinkSuggestions] = useState(false);
  const [isValidatedCurrentValues, setIsValidatedCurrentValues] = useState(false);
  const formRef = useRef(null);
  const lastFocusedInput = useRef(null);
  const confirmationChecks = useRef({ ...REQUIRED_CONFIRMATIONS });
  const {
    setValidationErrors,
    continueAfterSave,
    validationErrorsRef,
    isSharedRef,
  } = useContext(QuickMarcContext);
  const { hasErrorIssues, isBackEndValidationMarcType } = useValidation();

  const isConsortiaEnv = stripes.hasInterface('consortia');

  const saveLastFocusedInput = useCallback((e) => {
    lastFocusedInput.current = e.target;
  }, [lastFocusedInput]);

  const focusLastFocusedInput = useCallback(() => {
    lastFocusedInput.current?.focus();
  }, [lastFocusedInput]);

  const { unlinkAuthority } = useAuthorityLinking({ marcType, action });

  useEffect(() => {
    setIsValidatedCurrentValues(false);
  }, [formValues, setIsValidatedCurrentValues]);

  const deletedRecords = useMemo(() => {
    return records
      .map((record, index) => ({ index, record }))
      .filter(({ record }) => record._isDeleted);
  }, [records]);

  const { type, position7 } = getLeaderPositions(marcType, records);

  const saveFormDisabled = submitting || pristine;

  const handleSubmitResponse = useCallback(() => {
    if (continueAfterSave.current) {
      continueAfterSave.current = false;
      focusLastFocusedInput();
    }
  }, [continueAfterSave, focusLastFocusedInput]);

  const closeModals = () => {
    setIsDeleteModalOpened(false);
    setIsUpdate0101xxfieldsAuthRecModalOpen(false);
    setIsUnlinkRecordsModalOpen(false);
  };

  const runConfirmationChecks = useCallback(() => {
    if (confirmationChecks.current[CONFIRMATIONS.DELETE_RECORDS] && deletedRecords.length) {
      setIsDeleteModalOpened(true);

      return true;
    }

    if (confirmationChecks.current[CONFIRMATIONS.UPDATE_LINKED] && marcType === MARC_TYPES.AUTHORITY && linksCount) {
      if (is1XXUpdated(initialValues.records, records)) {
        setIsUpdate0101xxfieldsAuthRecModalOpen(true);

        return true;
      }

      if (
        is010$aUpdated(initialValues.records, records) &&
        is010LinkedToBibRecord(initialValues.records, instance.naturalId, linksCount)
      ) {
        setIsUpdate0101xxfieldsAuthRecModalOpen(true);

        return true;
      }
    }

    return false;
  }, [deletedRecords, initialValues, instance, linksCount, marcType, records]);

  const manageBackendValidationModal = useCallback(() => {
    let timerId;

    if (isBackEndValidationMarcType(marcType)) {
      timerId = setTimeout(() => setIsValidationModalOpen(true), VALIDATION_MODAL_DELAY);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
        setIsValidationModalOpen(false);
      }
    };
  }, [setIsValidationModalOpen, isBackEndValidationMarcType, marcType]);

  const showErrorsForMissingFields = useCallback((issues) => {
    issues.forEach((error) => {
      showCallout({
        message: error.message,
        messageId: error.id,
        values: error.values,
        type: error.severity === SEVERITY.ERROR ? 'error' : 'warning',
      });
    });
  }, [showCallout]);

  const showValidationIssuesToasts = useCallback((validationErrors) => {
    const allIssuesArray = Object.values(validationErrors).flat();
    const failCount = allIssuesArray.filter(issue => issue.severity === SEVERITY.ERROR).length;
    const warnCount = allIssuesArray.length - failCount;

    if (!failCount && !warnCount) {
      return;
    }

    const values = {
      warnCount,
      failCount,
      breakingLine: <br />,
    };

    let messageId = null;

    if (failCount && warnCount) {
      messageId = 'ui-quick-marc.record.save.error.failAndWarn';
    } else if (failCount) {
      messageId = 'ui-quick-marc.record.save.error.fail';
    } else {
      messageId = 'ui-quick-marc.record.save.error.warn';
    }

    showCallout({
      messageId,
      values,
      type: failCount ? 'error' : 'warning',
    });
  }, [showCallout]);

  const confirmSubmit = useCallback(async (e, isKeepEditing = false) => {
    continueAfterSave.current = isKeepEditing;
    let skipValidation = false;

    // if there are no error issues and user hasn't modified a record since last submit click
    // then we can skip validation and save the record even if there are warnings
    if (isValidatedCurrentValues && !hasErrorIssues) {
      skipValidation = true;
    }

    // if made edits after last attempt to save then validate again
    // otherwise save record

    let newValidationErrors = {};

    if (!skipValidation) {
      const closeValidationModal = manageBackendValidationModal();

      try {
        newValidationErrors = await validate(getState().values);
        closeValidationModal();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        closeValidationModal();

        showCallout({
          messageId: 'ui-quick-marc.record.save.error.generic',
          type: 'error',
        });

        return;
      }

      const validationErrorsWithoutFieldId = newValidationErrors[MISSING_FIELD_ID] || [];

      showErrorsForMissingFields(validationErrorsWithoutFieldId);
      showValidationIssuesToasts(newValidationErrors);
      focusLastFocusedInput();
      setIsValidatedCurrentValues(true);
    } else {
      setValidationErrors({});
    }

    // run confirmations only when all validation errors had been fixed and user clicked save the second time or there are no issues in the first place
    if ((isEmpty(newValidationErrors) || skipValidation)) {
      if (runConfirmationChecks()) {
        return;
      }
    }

    // if validation has any issues - cancel submit
    if (!isEmpty(validationErrorsRef.current)) {
      return;
    }

    handleSubmit(e)
      ?.then(handleSubmitResponse)
      ?.finally(closeModals);
  }, [
    handleSubmit,
    handleSubmitResponse,
    getState,
    hasErrorIssues,
    setValidationErrors,
    showErrorsForMissingFields,
    showCallout,
    validate,
    runConfirmationChecks,
    isValidatedCurrentValues,
    setIsValidatedCurrentValues,
    manageBackendValidationModal,
    focusLastFocusedInput,
    showValidationIssuesToasts,
    continueAfterSave,
    validationErrorsRef,
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
        {([MARC_TYPES.BIB, MARC_TYPES.AUTHORITY].includes(marcType) || action === QUICK_MARC_ACTIONS.EDIT) && (
          <Button
            buttonStyle="default mega"
            buttonClass={css.saveContinueBtn}
            disabled={saveFormDisabled}
            id="quick-marc-record-save-edit"
            onClick={async (event) => {
              confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
              await confirmSubmit(event, true);
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
          onClick={async (e) => {
            confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
            await confirmSubmit(e);
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
  }, [confirmSubmit, saveFormDisabled, onClose, action, marcType]);

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
      shared: isConsortiaEnv ? isSharedRef.current : null,
    };

    if (marcType === MARC_TYPES.HOLDINGS && action !== QUICK_MARC_ACTIONS.CREATE) {
      formattedMessageValues = {
        ...formattedMessageValues,
        location: find(locations, { id: instance?.effectiveLocationId })?.name,
        callNumber: instance?.callNumber,
      };
    } else if ((marcType === MARC_TYPES.AUTHORITY) && records.length) {
      const initialHeading = initialValues.records.find((recordRow) => {
        return recordRow.tag === recordInfoProps.correspondingMarcTag;
      });

      const headingContent = initialHeading?.content;
      const shared = isConsortiaEnv
        ? checkIfUserInCentralTenant(stripes) || isSharedRef.current
        : null;

      formattedMessageValues = {
        shared,
        ...(action !== QUICK_MARC_ACTIONS.CREATE && { title: getContentSubfieldValue(headingContent).$a?.[0] }),
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
    setTimeout(() => {
      focusLastFocusedInput();
    });
  };

  const confirmUpdateLinks = async (e) => {
    confirmationChecks.current[CONFIRMATIONS.UPDATE_LINKED] = false;
    await confirmSubmit(e, continueAfterSave.current);
  };

  const confirmDeleteFields = async (e) => {
    setIsDeleteModalOpened(false);
    confirmationChecks.current[CONFIRMATIONS.DELETE_RECORDS] = false;
    await confirmSubmit(e, continueAfterSave.current);
  };

  const cancelDeleteFields = () => {
    if (deletedRecords.length) {
      restoreDeletedRecords();
    } else {
      reset();
    }

    setIsDeleteModalOpened(false);
    setTimeout(() => {
      focusLastFocusedInput();
    });
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
    handler: async (e) => {
      if (isDiacritic(e.key)) return;

      if (!saveFormDisabled) {
        e.preventDefault();
        confirmationChecks.current = { ...REQUIRED_CONFIRMATIONS };
        confirmSubmit(e, continueAfterSave.current);
      }
    },
  }, {
    name: 'cancel',
    shortcut: 'esc',
    handler: (e) => {
      e.preventDefault();
      onClose();
    },
  }]), [saveFormDisabled, confirmSubmit, onClose, continueAfterSave]);

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
            contentLabel={intl.formatMessage({ id: 'ui-quick-marc.record.quickMarcEditorLabel' })}
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
                    subtype={position7}
                    marcType={marcType}
                    fixedFieldSpec={fixedFieldSpec}
                    instance={instance}
                    linksCount={linksCount}
                    isLoadingLinkSuggestions={isLoadingLinkSuggestions}
                    onCheckCentralTenantPerm={onCheckCentralTenantPerm}
                    onInputFocus={saveLastFocusedInput}
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
          <IfPermission perm="ui-quick-marc.quick-marc-authority-records.link-unlink.execute">
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
      <Modal
        open={isValidationModalOpen}
        id="quick-marc-validation-modal"
        label={<FormattedMessage id="ui-quick-marc.validation.modal.heading" />}
        scope="module"
        size="small"
      >
        <span className={css.validationModalContent}>
          <FormattedMessage
            id="ui-quick-marc.validation.modal.message"
            values={{
              appName: marcType === MARC_TYPES.BIB
                ? intl.formatMessage({ id: 'ui-quick-marc.Inventory' })
                : intl.formatMessage({ id: 'ui-quick-marc.MARC-authority' }),
            }}
          />
          <Loading size="large" />
        </span>
      </Modal>
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
  onCheckCentralTenantPerm: PropTypes.func,
  validate: PropTypes.func.isRequired,
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
