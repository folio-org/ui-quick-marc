import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import faker from 'faker';

import { runAxeTest } from '@folio/stripes-testing';
import { useShowCallout } from '@folio/stripes-acq-components';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

import Harness from '../../test/jest/helpers/harness';
/* eslint-disable max-lines */
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({
    search: 'authRefType=Authorized',
  }),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({ linkingRules: [] }),
  useLinkSuggestions: jest.fn().mockReturnValue({ isLoading: false, fetchLinkSuggestions: jest.fn() }),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(),
}));

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
const onSubmitMock = jest.fn(() => Promise.resolve({ version: 1 }));
const mockShowCallout = jest.fn();
const mockValidate = jest.fn();

useShowCallout.mockClear().mockReturnValue(mockShowCallout);

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
  records: [
    {
      tag: 'LDR',
      content: 'assdfgs ds sdg',
      id: 'LDR',
    },
    {
      _isDeleted: false,
      _isLinked: false,
      content: '$a n  931006645',
      id: 'af322498-097b-4c74-af15-c9166884aa6a',
      indicators: ['\\', '\\'],
      isProtected: false,
      tag: '010',
    },
    {
      tag: '100',
      content: '$a Coates, Ta-Nehisi $e author.',
      indicators: ['1', '\\'],
      _isLinked: true,
      id: '100',
    },
    {
      tag: '110',
      content: '$a Test title',
      indicators: ['2', '\\'],
      id: 'test-id-1',
    },
  ],
};

const linksCount = 0;

const renderQuickMarcEditor = (props) => (render(
  <Harness>
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
      linksCount={linksCount}
      validate={mockValidate}
      {...props}
    />
  </Harness>,
));

describe('Given QuickMarcEditor', () => {
  beforeEach(() => {
    mockValidate.mockClear().mockReturnValue(undefined);
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcEditor();

    await runAxeTest({
      rootNode: container,
    });
  });

  it('should display instance title in pane title', () => {
    const { getByText } = renderQuickMarcEditor();

    expect(getByText('ui-quick-marc.bibliographic-record.edit.title')).toBeDefined();
  });

  describe('when action is CREATE and marc type is BIB', () => {
    it('should display instance title in pane title', () => {
      const { getByText } = renderQuickMarcEditor({
        action: QUICK_MARC_ACTIONS.CREATE,
      });

      expect(getByText('ui-quick-marc.bibliographic-record.create.title')).toBeDefined();
    });
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
        getAllByRole,
        queryByText,
      } = renderQuickMarcEditor();
      const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteButtons[deleteButtons.length - 1]);

      expect(queryByText('Confirmation modal')).toBeNull();
    });
  });

  describe('when clicked save and keep editing button', () => {
    it('should handle onSubmit and keep editor open', async () => {
      const {
        getByTestId,
        getByText,
      } = renderQuickMarcEditor();

      const contentField = getByTestId('content-field-3');

      fireEvent.change(contentField, { target: { value: 'Changed test title' } });
      fireEvent.click(getByText('ui-quick-marc.record.save.continue'));

      expect(onSubmitMock).toHaveBeenCalled();
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('when clicked save button', () => {
    it('should handle onSubmit and close editor', async () => {
      const {
        getByTestId,
        getByText,
      } = renderQuickMarcEditor();

      const contentField = getByTestId('content-field-3');

      fireEvent.change(contentField, { target: { value: 'Changed test title' } });
      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(onSubmitMock).toHaveBeenCalled();

      waitFor(() => expect(onCloseMock).toHaveBeenCalledWith());
    });
  });

  describe('when there are deleted fields', () => {
    it('should display ConfirmationModal', () => {
      const {
        getAllByRole,
        getByText,
      } = renderQuickMarcEditor();
      const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(getByText('Confirmation modal')).toBeDefined();
    });
  });

  describe('when confirmationModal is opened', () => {
    describe('when click Confirm', () => {
      it('should hide ConfirmationModal and handle onSubmit', () => {
        const {
          getAllByRole,
          getByText,
          queryByText,
        } = renderQuickMarcEditor();
        const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

        fireEvent.click(deleteButtons[deleteButtons.length - 1]);
        fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
        fireEvent.click(getByText('Confirm'));

        expect(queryByText('Confirmation modal')).toBeNull();
        expect(onSubmitMock).toHaveBeenCalled();
      });
    });

    describe('when click Cancel', () => {
      it('should hide ConfirmationModal and restore deleted fields', async () => {
        const {
          getAllByRole,
          getByText,
          queryByText,
        } = renderQuickMarcEditor();
        const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

        fireEvent.click(deleteButtons[deleteButtons.length - 1]);

        expect(queryByText('$a Test title')).toBeNull();

        fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
        fireEvent.click(getByText('Cancel'));

        expect(queryByText('Confirmation modal')).toBeNull();

        expect(getByText('$a Test title')).toBeDefined();
      });
    });
  });

  describe('when saving form with validation errors and deleted fields', () => {
    beforeEach(() => {
      mockValidate.mockClear().mockReturnValue('Validation error');
    });

    it('should show errors and not show confirmation modal', () => {
      const {
        getAllByRole,
        getByText,
        queryByText,
        getByTestId,
      } = renderQuickMarcEditor();

      const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });
      const contentField = getByTestId('content-field-3');

      fireEvent.change(contentField, { target: { value: '' } });
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(queryByText('Confirmation modal')).toBeNull();
      expect(mockShowCallout).toHaveBeenCalledWith({
        message: 'Validation error',
        type: 'error',
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

      it('should not show "Save & keep editing" button', () => {
        const { queryByText } = renderQuickMarcEditor({
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(queryByText('ui-quick-marc.record.save.continue')).not.toBeInTheDocument();
      });
    });

    describe('when action is edit', () => {
      it('should display edit holdings record pane title', () => {
        const { getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(getByText('ui-quick-marc.holdings-record.edit.title')).toBeDefined();
      });

      it('should display "Save & keep editing" button', () => {
        const { getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(getByText('ui-quick-marc.record.save.continue')).toBeDefined();
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
        const { getAllByRole, getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.AUTHORITY,
        });
        const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

        fireEvent.click(deleteButtons[deleteButtons.length - 1]);

        expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
      });
    });

    describe('when 010 $a field is updated', () => {
      const authority = { naturalId: 'n931006645' };

      describe('when click on save&close button', () => {
        it('should open confirmation modal', () => {
          const { getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '$a n  9310066' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(getByText('Confirmation modal')).toBeDefined();
        });

        it('should close the modal, save the updates and close the editor on clicking save and close button', async () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
          fireEvent.click(getByText('Confirm'));

          expect(onSubmitMock).toHaveBeenCalled();
          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
          waitFor(() => expect(onCloseMock).toHaveBeenCalledWith());
        });

        it('should close the modal on clicking keep editing button ', () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Cancel'));

          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should open confirmation modal', () => {
          const { getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(getByText('Confirmation modal')).toBeDefined();
        });

        it('should close the modal, save the updates and editor should be open - on clickng save and keep editing button', async () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Confirm'));

          expect(onSubmitMock).toHaveBeenCalled();
          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
          expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
        });

        it('should close the modal on clicking keep editing button ', () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Cancel'));

          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
        });
      });
    });

    describe('when update 1xx field', () => {
      describe('when click on save&close button', () => {
        it('should open confirmation modal', () => {
          const { getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(getByText('Confirmation modal')).toBeDefined();
        });

        it('should close the modal, save the updates and close the editor on clickng save and close button', async () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));
          fireEvent.click(getByText('Confirm'));

          expect(onSubmitMock).toHaveBeenCalled();
          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
          waitFor(() => expect(onCloseMock).toHaveBeenCalledWith());
        });

        it('should close the modal on clicking keep editing button ', () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Cancel'));

          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should open confirmation modal', () => {
          const { getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(getByText('Confirmation modal')).toBeDefined();
        });

        it('should close the modal, save the updates and editor should be open - on clicking save and keep editing button', async () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Confirm'));

          expect(onSubmitMock).toHaveBeenCalled();
          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
          expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
        });

        it('should close the modal on clicking keep editing button ', () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          fireEvent.click(getByText('ui-quick-marc.record.save.continue'));
          fireEvent.click(getByText('Cancel'));

          waitFor(() => expect(queryByText('Confirmation modal')).toBeNull());
        });
      });
    });

    describe('when fields other than 010 or 1xx are updated', () => {
      describe('when click on save&close button', () => {
        it('should not open confirmation modal, but save the updates', () => {
          const { getByTestId, getByText, queryByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a (OCoLC)oca034754512',
                  id: 'ec7304d1-929c-403a-bf4c-8d51c5f50b2a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '035',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-2');

          fireEvent.change(contentField, { target: { value: '$a (OCoLC)oca03475451' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(queryByText('Confirmation modal')).toBeNull();
          expect(onSubmitMock).toHaveBeenCalled();
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should not open confirmation modal, but save the updates', () => {
          const { getByTestId, getByText, queryByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            initialValues: {
              leader: 'assdfgs ds sdg',
              records: [
                {
                  tag: 'LDR',
                  content: 'assdfgs ds sdg',
                  id: 'LDR',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a n  931006645',
                  id: 'af322498-097b-4c74-af15-c9166884aa6a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '010',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a (OCoLC)oca034754512',
                  id: 'ec7304d1-929c-403a-bf4c-8d51c5f50b2a',
                  indicators: ['\\', '\\'],
                  isProtected: false,
                  tag: '035',
                },
                {
                  _isDeleted: false,
                  _isLinked: false,
                  content: '$a Yuan, Bing',
                  id: 'e95af4e5-008c-42c4-999c-4e103da9de13',
                  indicators: ['1', '\\'],
                  isProtected: false,
                  tag: '100',
                },
              ],
            },
          });

          const contentField = getByTestId('content-field-2');

          fireEvent.change(contentField, { target: { value: '$a (OCoLC)oca03475451' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(queryByText('Confirmation modal')).toBeNull();
          expect(onSubmitMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when confirmRemoveAuthorityLinking prop is true and records are linked', () => {
    it('should open remove authority linking modal', () => {
      const { getByText } = renderQuickMarcEditor({ confirmRemoveAuthorityLinking: true });

      expect(getByText('Confirmation modal')).toBeDefined();
    });

    it('should close the modal on clicking keep linking button', () => {
      const { queryByText, getByText } = renderQuickMarcEditor({ confirmRemoveAuthorityLinking: true });

      fireEvent.click(getByText('Cancel'));

      expect(queryByText('Confirmation modal')).toBeNull();
    });

    it('should close the modal on clicking remove linking button', () => {
      const { queryByText, getByText } = renderQuickMarcEditor({ confirmRemoveAuthorityLinking: true });

      fireEvent.click(getByText('Confirm'));

      expect(queryByText('Confirmation modal')).toBeNull();
    });
  });

  describe('when confirmRemoveAuthorityLinking prop is false or records are not linked', () => {
    it('should not open remove authority linking modal when record with tag 100 is not linked', () => {
      const { queryByText } = renderQuickMarcEditor(
        {
          confirmRemoveAuthorityLinking: true,
          initialValues: {
            leader: 'assdfgs ds sdg',
            records: [
              {
                tag: 'LDR',
                content: 'assdfgs ds sdg',
                id: 'LDR',
              },
              {
                tag: '100',
                content: '$a Coates, Ta-Nehisi $e author.',
                indicators: ['1', '\\'],
                _isLinked: false,
                id: '100',
              },
              {
                tag: '110',
                content: '$a Test title',
                indicators: ['2', '\\'],
                id: 'test-id-1',
              },
            ],
          },
        },
      );

      expect(queryByText('Confirmation modal')).toBeNull();
    });

    it('should not open remove authority linking modal when confirmRemoveAuthorityLinking prop is false', () => {
      const { queryByText } = renderQuickMarcEditor(
        {
          confirmRemoveAuthorityLinking: false,
        },
      );

      expect(queryByText('Confirmation modal')).toBeNull();
    });
  });
});
