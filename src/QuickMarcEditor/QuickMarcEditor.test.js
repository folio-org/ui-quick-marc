import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({
    open,
    onCancel,
    onConfirm,
  }) => (open
    ? (
      <div>
        <span>Confirmation modal</span>
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          id="confirmButton"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    )
    : null)),
}));

jest.mock('./QuickMarcRecordInfo', () => {
  return {
    QuickMarcRecordInfo: () => <span>QuickMarcRecordInfo</span>,
  };
});

const onCloseMock = jest.fn();
const onSubmitMock = jest.fn();

const instance = {
  id: faker.random.uuid(),
  effectiveLocationId: 'locationId-1',
  title: 'Test title',
  callNumber: 'call number',
};

const locations = {
  records: [{
    id: 'locationId-1',
    name: 'Location 1',
  }, {
    id: 'locationId-2',
    name: 'Location 2',
  }],
};

const initialValues = {
  leader: 'assdfgs ds sdg',
  records: [{
    tag: 'LDR',
    content: 'assdfgs ds sdg',
    id: 'LDR',
  }, {
    tag: '110',
    content: '$a Test title',
    indicators: ['2', '\\'],
    id: 'test-id-1',
  }],
};

const stripesMock = {
  hasPerm: jest.fn(),
};

const renderQuickMarcEditor = (props) => (render(
  <MemoryRouter>
    <QuickMarcEditor
      action={QUICK_MARC_ACTIONS.EDIT}
      instance={instance}
      onClose={onCloseMock}
      onSubmit={onSubmitMock}
      mutators={{
        addRecord: jest.fn(),
        deleteRecord: jest.fn(),
        moveRecord: jest.fn(),
      }}
      initialValues={initialValues}
      marcType={MARC_TYPES.BIB}
      locations={locations}
      stripes={stripesMock}
      {...props}
    />
  </MemoryRouter>,
));

describe('Given QuickMarcEditor', () => {
  afterEach(cleanup);

  it('should display instance title in pane title', () => {
    const { getByText } = renderQuickMarcEditor();

    expect(getByText('ui-quick-marc.bib-record.edit.title')).toBeDefined();
  });

  it('should display pane footer', () => {
    const { getByText } = renderQuickMarcEditor();

    expect(getByText('stripes-acq-components.FormFooter.cancel')).toBeDefined();
    expect(getByText('stripes-acq-components.FormFooter.save')).toBeDefined();
  });

  it('should display QuickMarcEditorRows', () => {
    const { getByTestId } = renderQuickMarcEditor();

    expect(getByTestId('quick-marc-editor-rows')).toBeDefined();
  });

  describe('when clearing LDR field', () => {
    it('should not crash the app', () => {
      const { getByTestId } = renderQuickMarcEditor();

      const contentField = getByTestId('content-field-0');

      fireEvent.change(contentField, { target: { value: '' } });

      expect(getByTestId('quick-marc-editor-rows')).toBeDefined();
    });
  });

  describe('when deleted a row', () => {
    it('should not display ConfirmationModal', () => {
      const {
        getByRole,
        queryByText,
      } = renderQuickMarcEditor();

      fireEvent.click(getByRole('button', { name: 'ui-quick-marc.record.deleteField' }));

      expect(queryByText('Confirmation modal')).toBeNull();
    });
  });

  describe('when clicked save button', () => {
    it('should handle onSubmit', () => {
      const {
        getByTestId,
        getByText,
      } = renderQuickMarcEditor();

      const contentField = getByTestId('content-field-1');

      fireEvent.change(contentField, { target: { value: 'Changed test title' } });
      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(onSubmitMock).toHaveBeenCalled();
    });

    describe('when there are deleted fields', () => {
      it('should display ConfirmationModal', () => {
        const {
          getByRole,
          getByText,
        } = renderQuickMarcEditor();

        fireEvent.click(getByRole('button', { name: 'ui-quick-marc.record.deleteField' }));
        fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        expect(getByText('Confirmation modal')).toBeDefined();
      });
    });
  });

  describe('when confirmationModal is opened', () => {
    describe('when click Confirm', () => {
      it('should hide ConfirmationModal and handle onSubmit', () => {
        const {
          getByRole,
          getByText,
          queryByText,
        } = renderQuickMarcEditor();

        fireEvent.click(getByRole('button', { name: 'ui-quick-marc.record.deleteField' }));
        fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
        fireEvent.click(getByText('Confirm'));

        expect(queryByText('Confirmation modal')).toBeNull();
        expect(onSubmitMock).toHaveBeenCalled();
      });
    });

    describe('when click Cancel', () => {
      it('should hide ConfirmationModal and restore deleted fields', async () => {
        const {
          getByRole,
          getByText,
          queryByText,
        } = renderQuickMarcEditor();

        fireEvent.click(getByRole('button', { name: 'ui-quick-marc.record.deleteField' }));

        expect(queryByText('$a Test title')).toBeNull();

        fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
        fireEvent.click(getByText('Cancel'));

        expect(queryByText('Confirmation modal')).toBeNull();

        expect(getByText('$a Test title')).toBeDefined();
      });
    });
  });

  describe('when marc record is of type HOLDINGS', () => {
    describe('when action is create', () => {
      it('should display create holdings record pane title', () => {
        const { getByText } = renderQuickMarcEditor({
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(getByText('ui-quick-marc.holdings-record.create.title')).toBeDefined();
      });
    });

    describe('when action is edit', () => {
      it('should display edit holdings record pane title', () => {
        const { getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(getByText('ui-quick-marc.holdings-record.edit.title')).toBeDefined();
      });
    });
  });

  describe('when marc record is of type AUTHORITY', () => {
    it('should display edit authority record pane title', () => {
      const { getByText } = renderQuickMarcEditor({
        marcType: MARC_TYPES.AUTHORITY,
      });

      expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
    });

    describe('when delete last 1XX field', () => {
      it('should display edit authority record pane title', () => {
        const { getByRole, getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.AUTHORITY,
        });

        fireEvent.click(getByRole('button', { name: 'ui-quick-marc.record.deleteField' }));

        expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
      });
    });
  });
});
