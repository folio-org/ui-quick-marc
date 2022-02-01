import React, {
  useMemo,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import find from 'lodash/find';

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
} from '@folio/stripes/components';

import { FormSpy } from 'react-final-form';

import { QuickMarcRecordInfo } from './QuickMarcRecordInfo';
import { QuickMarcEditorRows } from './QuickMarcEditorRows';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import {
  addNewRecord,
  deleteRecordByIndex,
  reorderRecords,
  restoreRecordAtIndex,
  getCorrespondingMarcTag,
  getContentSubfieldValue,
  getLocationValue,
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
}) => {
  const [records, setRecords] = useState([]);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [permanentLocation, setPermanentLocation] = useState('');
  const [isLocationLookupUsed, setIsLocationLookupUsed] = useState(false);

  const isLocationLookupNeeded = marcType === MARC_TYPES.HOLDINGS
    && (action === QUICK_MARC_ACTIONS.CREATE || action === QUICK_MARC_ACTIONS.EDIT);

  const saveFormDisabled = action === QUICK_MARC_ACTIONS.EDIT
    ? (!isLocationLookupUsed && pristine) || submitting
    : submitting;

  const confirmSubmit = useCallback((e) => {
    if (deletedRecords.length) {
      setIsDeleteModalOpened(true);

      return;
    }

    handleSubmit(e);
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
    setDeletedRecords([]);
  };

  const onConfirmModal = (e) => {
    setIsDeleteModalOpened(false);
    handleSubmit(e);
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

      if (isLocationLookupNeeded) {
        const locationField = values.records.find(field => field.tag === '852');

        const matchedLocation = getLocationValue(locationField.content);

        setPermanentLocation(matchedLocation);
      }
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

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <form>
        <Paneset>
          <Pane
            id="quick-marc-editor-pane"
            dismissible
            onClose={onClose}
            defaultWidth="100%"
            paneTitle={getPaneTitle()}
            paneSub={<QuickMarcRecordInfo {...recordInfoProps} />}
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
                  isLocationLookupNeeded={isLocationLookupNeeded}
                  permanentLocation={permanentLocation}
                  setPermanentLocation={setPermanentLocation}
                  isLocationLookupUsed={isLocationLookupUsed}
                  setIsLocationLookupUsed={setIsLocationLookupUsed}
                  marcType={marcType}
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
      <FormSpy
        subscription={spySubscription}
        onChange={changeRecords}
      />
    </HasCommand>
  );
};

QuickMarcEditor.propTypes = {
  action: PropTypes.oneOf(Object.values(QUICK_MARC_ACTIONS)).isRequired,
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
  locations: PropTypes.shape({
    records: PropTypes.array.isRequired,
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
    restoreRecord: ([{ index, record }], state, tools) => {
      const records = restoreRecordAtIndex(index, record, state);

      tools.changeValue(state, 'records', () => records);
    },
  },
})(QuickMarcEditor);
