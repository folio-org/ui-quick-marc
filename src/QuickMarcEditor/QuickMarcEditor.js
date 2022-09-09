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
  reorderRecords,
  restoreRecordAtIndex,
  getCorrespondingMarcTag,
  getContentSubfieldValue,
  deleteRecordByIndex,
} from './utils';

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
}) => {
  const history = useHistory();
  const location = useLocation();
  const showCallout = useShowCallout();
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const continueAfterSave = useRef(false);

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

  const confirmSubmit = useCallback((e, isKeepEditing = false) => {
    continueAfterSave.current = isKeepEditing;

    if (deletedRecords.length) {
      setIsDeleteModalOpened(true);

      return;
    }

    handleSubmit(e).then((updatedRecord) => {
      handleSubmitResponse(updatedRecord);
    });
  }, [deletedRecords, handleSubmit, handleSubmitResponse]);

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
            disabled={saveFormDisabled}
            id="quick-marc-record-save-edit"
            onClick={(event) => confirmSubmit(event, true)}
            marginBottom0
          >
            <FormattedMessage id="ui-quick-marc.record.save.continue" />
          </Button>
        )}
        <Button
          buttonStyle="primary mega"
          disabled={saveFormDisabled}
          id="quick-marc-record-save"
          onClick={confirmSubmit}
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

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <form>
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
};

QuickMarcEditor.defaultProps = {
  httpError: null,
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
