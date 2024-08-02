/* eslint-disable max-lines */
import React, { act } from 'react';
import faker from 'faker';
import { useLocation } from 'react-router';

import {
  render,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { runAxeTest } from '@folio/stripes-testing';
import { useShowCallout } from '@folio/stripes-acq-components';
import {
  checkIfUserInCentralTenant,
  useStripes,
} from '@folio/stripes/core';
import { Pane } from '@folio/stripes/components';
import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';
import { MISSING_FIELD_ID } from '../hooks';

import Harness from '../../test/jest/helpers/harness';
import buildStripes from '../../test/jest/__mock__/stripesCore.mock';
import { bibLeader } from '../../test/jest/fixtures/leaders';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: jest.fn(),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useLinkSuggestions: jest.fn().mockReturnValue({ isLoading: false, fetchLinkSuggestions: jest.fn() }),
}));

jest.mock('@folio/stripes-marc-components', () => ({
  ...jest.requireActual('@folio/stripes-marc-components'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({ linkingRules: [] }),
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
const onSaveMock = jest.fn();
const onSubmitMock = jest.fn(() => Promise.resolve({ version: 1 }));
const mockShowCallout = jest.fn();
const mockValidate = jest.fn().mockReturnValue({});

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
  leader: bibLeader,
  records: [
    {
      tag: 'LDR',
      content: bibLeader,
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
      onSave={onSaveMock}
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
    jest.clearAllMocks();
    mockValidate.mockClear().mockReturnValue({});
    useStripes.mockReturnValue(buildStripes());
    useLocation.mockReturnValue({
      search: 'authRefType=Authorized',
    });
    checkIfUserInCentralTenant.mockReturnValue(false);
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcEditor();

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('Pane title', () => {
    jest.spyOn(Pane, 'render');

    describe('when env is consortia', () => {
      beforeEach(() => {
        useStripes.mockReturnValue(buildStripes({
          hasInterface: () => true,
        }));
      });

      describe('when a user is central tenant', () => {
        beforeEach(() => {
          checkIfUserInCentralTenant.mockReturnValue(true);
        });

        describe('when the record is bib', () => {
          describe('when action is CREATE', () => {
            it('should have "shared" in title', () => {
              renderQuickMarcEditor({
                marcType: MARC_TYPES.BIB,
                action: QUICK_MARC_ACTIONS.CREATE,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.bibliographic-record.create.title',
                values: { shared: true },
              });
            });
          });

          describe('when action is EDIT', () => {
            it('should have "shared" in title', () => {
              useLocation.mockReturnValue({ search: '?shared=true' });

              renderQuickMarcEditor({
                marcType: MARC_TYPES.BIB,
                action: QUICK_MARC_ACTIONS.EDIT,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.bibliographic-record.edit.title',
                values: { title: 'Test title', shared: true },
              });
            });
          });

          describe('when action is DERIVE', () => {
            it('should have "shared" in title', () => {
              useLocation.mockReturnValue({ search: '?shared=true' });

              renderQuickMarcEditor({
                marcType: MARC_TYPES.BIB,
                action: QUICK_MARC_ACTIONS.DERIVE,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.bibliographic-record.derive.title',
                values: { shared: true },
              });
            });
          });
        });

        describe('when the record is authority', () => {
          describe('when action is CREATE', () => {
            it('should have "shared" in title', () => {
              renderQuickMarcEditor({
                action: QUICK_MARC_ACTIONS.CREATE,
                marcType: MARC_TYPES.AUTHORITY,
                initialValues: { records: [{ id: 'LDR' }] },

              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.authority-record.create.title',
                values: { shared: true },
              });
            });
          });

          describe('when action is EDIT', () => {
            it('should have "shared" in title', () => {
              useLocation.mockReturnValue({ search: '?shared=true' });

              renderQuickMarcEditor({
                action: QUICK_MARC_ACTIONS.EDIT,
                marcType: MARC_TYPES.AUTHORITY,
                initialValues: { records: [{ id: 'LDR' }] },
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.authority-record.edit.title',
                values: { shared: true },
              });
            });
          });
        });
      });

      describe('when a user is a member tenant', () => {
        beforeEach(() => {
          checkIfUserInCentralTenant.mockReturnValue(false);
        });

        describe('when the record is bib', () => {
          describe('when action is CREATE', () => {
            it('should have the "local" in title', () => {
              renderQuickMarcEditor({
                marcType: MARC_TYPES.BIB,
                action: QUICK_MARC_ACTIONS.CREATE,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.bibliographic-record.create.title',
                values: { shared: false },
              });
            });
          });

          describe('when action is EDIT', () => {
            describe('when the record is shared', () => {
              it('should have the "shared" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=true' });

                renderQuickMarcEditor({
                  marcType: MARC_TYPES.BIB,
                  action: QUICK_MARC_ACTIONS.EDIT,
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.bibliographic-record.edit.title',
                  values: { title: 'Test title', shared: true },
                });
              });
            });

            describe('when the record is local', () => {
              it('should have the "local" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=false' });

                renderQuickMarcEditor({
                  marcType: MARC_TYPES.BIB,
                  action: QUICK_MARC_ACTIONS.EDIT,
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.bibliographic-record.edit.title',
                  values: { title: 'Test title', shared: false },
                });
              });
            });
          });

          describe('when action is DERIVE', () => {
            describe('when the record is shared', () => {
              it('should have the "local" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=true' });

                renderQuickMarcEditor({
                  marcType: MARC_TYPES.BIB,
                  action: QUICK_MARC_ACTIONS.DERIVE,
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.bibliographic-record.derive.title',
                  values: { shared: false },
                });
              });
            });

            describe('whe the record is local', () => {
              it('should have the "local" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=false' });

                renderQuickMarcEditor({
                  marcType: MARC_TYPES.BIB,
                  action: QUICK_MARC_ACTIONS.DERIVE,
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.bibliographic-record.derive.title',
                  values: { shared: false },
                });
              });
            });
          });
        });

        describe('when the record is authority', () => {
          describe('when action is CREATE', () => {
            it('should have the "local" in title', () => {
              renderQuickMarcEditor({
                action: QUICK_MARC_ACTIONS.CREATE,
                marcType: MARC_TYPES.AUTHORITY,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                id: 'ui-quick-marc.authority-record.create.title',
                values: { shared: false },
              });
            });
          });

          describe('when action is EDIT', () => {
            describe('when the record is shared', () => {
              it('should have the "shared" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=true' });

                renderQuickMarcEditor({
                  action: QUICK_MARC_ACTIONS.EDIT,
                  marcType: MARC_TYPES.AUTHORITY,
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.authority-record.edit.title',
                  values: { title: 'Coates, Ta-Nehisi', shared: true },
                });
              });
            });

            describe('when the record is local', () => {
              it('should have the "local" in title', () => {
                useLocation.mockReturnValue({ search: '?shared=false' });

                renderQuickMarcEditor({
                  action: QUICK_MARC_ACTIONS.EDIT,
                  marcType: MARC_TYPES.AUTHORITY,
                  initialValues: { records: [{ id: 'LDR' }] },
                });

                expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
                  id: 'ui-quick-marc.authority-record.edit.title',
                  values: { shared: false },
                });
              });
            });
          });
        });

        describe('when the record is holdings', () => {
          describe('when action is CREATE', () => {
            it('should have title', () => {
              renderQuickMarcEditor({
                marcType: MARC_TYPES.HOLDINGS,
                action: QUICK_MARC_ACTIONS.CREATE,
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toMatchObject({
                id: 'ui-quick-marc.holdings-record.create.title',
              });
            });
          });

          describe('when action is EDIT', () => {
            it('should have title', () => {
              renderQuickMarcEditor({
                marcType: MARC_TYPES.HOLDINGS,
                action: QUICK_MARC_ACTIONS.EDIT,
                locations: [{
                  id: instance.effectiveLocationId,
                  name: 'locationName',
                }],
              });

              expect(Pane.render.mock.lastCall[0].paneTitle.props).toMatchObject({
                id: 'ui-quick-marc.holdings-record.edit.title',
                values: {
                  callNumber: 'call number',
                  location: 'locationName',
                },
              });
            });
          });
        });
      });
    });

    describe('when env is not consortia', () => {
      beforeEach(() => {
        useStripes.mockReturnValue(buildStripes({
          hasInterface: () => false,
        }));
        checkIfUserInCentralTenant.mockReturnValue(false);
      });

      describe('when the record is bib', () => {
        describe('when action is CREATE', () => {
          it('should have neither "local" nor "shared" in title', () => {
            renderQuickMarcEditor({
              marcType: MARC_TYPES.BIB,
              action: QUICK_MARC_ACTIONS.CREATE,
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
              id: 'ui-quick-marc.bibliographic-record.create.title',
              values: { shared: null },
            });
          });
        });

        describe('when action is EDIT', () => {
          it('should have neither "shared" nor "local" in title', () => {
            renderQuickMarcEditor({
              marcType: MARC_TYPES.BIB,
              action: QUICK_MARC_ACTIONS.EDIT,
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
              id: 'ui-quick-marc.bibliographic-record.edit.title',
              values: { title: 'Test title', shared: null },
            });
          });
        });

        describe('when action is DERIVE', () => {
          it('should have neither "shared" nor "local" in title', () => {
            renderQuickMarcEditor({
              marcType: MARC_TYPES.BIB,
              action: QUICK_MARC_ACTIONS.DERIVE,
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
              id: 'ui-quick-marc.bibliographic-record.derive.title',
              values: { shared: null },
            });
          });
        });
      });

      describe('when the record is authority', () => {
        describe('when action is CREATE', () => {
          it('should have neither "shared" nor "local" in title', () => {
            renderQuickMarcEditor({
              action: QUICK_MARC_ACTIONS.CREATE,
              marcType: MARC_TYPES.AUTHORITY,
              initialValues: { records: [{ id: 'LDR' }] },

            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
              id: 'ui-quick-marc.authority-record.create.title',
              values: { shared: null },
            });
          });
        });

        describe('when action is EDIT', () => {
          it('should have neither "shared" nor "local" in title', () => {
            renderQuickMarcEditor({
              action: QUICK_MARC_ACTIONS.EDIT,
              marcType: MARC_TYPES.AUTHORITY,
              initialValues: { records: [{ id: 'LDR' }] },
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toEqual({
              id: 'ui-quick-marc.authority-record.edit.title',
              values: { shared: null },
            });
          });
        });
      });

      describe('when the record is holdings', () => {
        describe('when action is CREATE', () => {
          it('should have title', () => {
            renderQuickMarcEditor({
              marcType: MARC_TYPES.HOLDINGS,
              action: QUICK_MARC_ACTIONS.CREATE,
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toMatchObject({
              id: 'ui-quick-marc.holdings-record.create.title',
            });
          });
        });

        describe('when action is EDIT', () => {
          it('should have title', () => {
            renderQuickMarcEditor({
              marcType: MARC_TYPES.HOLDINGS,
              action: QUICK_MARC_ACTIONS.EDIT,
              locations: [{
                id: instance.effectiveLocationId,
                name: 'locationName',
              }],
            });

            expect(Pane.render.mock.lastCall[0].paneTitle.props).toMatchObject({
              id: 'ui-quick-marc.holdings-record.edit.title',
              values: {
                callNumber: 'call number',
                location: 'locationName',
              },
            });
          });
        });
      });
    });
  });

  describe('when action is CREATE and marc type is BIB', () => {
    it('should have Save & Close button disabled by default', () => {
      const { getByRole } = renderQuickMarcEditor({
        action: QUICK_MARC_ACTIONS.CREATE,
      });

      expect(getByRole('button', { name: 'stripes-acq-components.FormFooter.save' })).toBeDisabled();
    });
  });

  it('should display pane footer', () => {
    const { getByText } = renderQuickMarcEditor();

    expect(getByText('stripes-acq-components.FormFooter.cancel')).toBeDefined();
    expect(getByText('stripes-acq-components.FormFooter.save')).toBeDefined();
  });

  describe('when clicking Cancel pane button', () => {
    it('should invoke the onClose callback without any args', () => {
      const { getByText } = renderQuickMarcEditor();

      const cancelPaneButton = getByText('stripes-acq-components.FormFooter.cancel');

      fireEvent.click(cancelPaneButton);

      expect(onCloseMock).toHaveBeenCalledWith();
    });
  });

  it('should display QuickMarcEditorRows', () => {
    const { getByTestId } = renderQuickMarcEditor();

    expect(getByTestId('quick-marc-editor-rows')).toBeDefined();
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

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
        expect(onCloseMock).not.toHaveBeenCalled();
      });
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
      await act(() => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalled();
        expect(onSaveMock).toHaveBeenCalledWith();
      });
    });
  });

  describe('when there are deleted fields', () => {
    it('should display ConfirmationModal', async () => {
      const {
        getAllByRole,
        getByText,
      } = renderQuickMarcEditor();
      const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      await waitFor(() => expect(getByText('Confirmation modal')).toBeDefined());
    });
  });

  describe('when confirmationModal is opened', () => {
    describe('when click Confirm', () => {
      it('should hide ConfirmationModal and handle onSubmit', async () => {
        const {
          getAllByRole,
          getByText,
          queryByText,
        } = renderQuickMarcEditor();
        const deleteButtons = getAllByRole('button', { name: 'ui-quick-marc.record.deleteField' });

        fireEvent.click(deleteButtons[deleteButtons.length - 1]);
        await act(() => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

        const confirmButton = await getByText('Confirm');

        fireEvent.click(confirmButton);

        await waitFor(() => {
          expect(queryByText('Confirmation modal')).toBeNull();
          expect(onSubmitMock).toHaveBeenCalled();
        });
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

        await waitFor(() => {
          fireEvent.click(getByText('Cancel'));
          expect(queryByText('Confirmation modal')).toBeNull();
          expect(getByText('$a Test title')).toBeDefined();
        });
      });
    });
  });

  describe('when saving form with validation errors and deleted fields', () => {
    beforeEach(() => {
      mockValidate.mockClear().mockResolvedValue({ [MISSING_FIELD_ID]: [{ id: 'some error', values: {} }] });
    });

    it('should show errors and not show confirmation modal', async () => {
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

      await act(() => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

      await waitFor(() => {
        expect(queryByText('Confirmation modal')).toBeNull();
        expect(mockShowCallout).toHaveBeenCalledWith({
          messageId: 'some error',
          values: {},
          type: 'error',
        });
      });
    });
  });

  describe('when marc record is of type HOLDINGS', () => {
    describe('when action is create', () => {
      it('should not show "Save & keep editing" button', () => {
        const { queryByText } = renderQuickMarcEditor({
          action: QUICK_MARC_ACTIONS.CREATE,
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(queryByText('ui-quick-marc.record.save.continue')).not.toBeInTheDocument();
      });
    });

    describe('when action is edit', () => {
      it('should display "Save & keep editing" button', () => {
        const { getByText } = renderQuickMarcEditor({
          marcType: MARC_TYPES.HOLDINGS,
        });

        expect(getByText('ui-quick-marc.record.save.continue')).toBeDefined();
      });
    });
  });

  describe('when marc record is of type AUTHORITY', () => {
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
        it('should open confirmation modal', async () => {
          const { getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '$a n  9310066' } });
          fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          await waitFor(() => expect(getByText('Confirmation modal')).toBeDefined());
        });

        it('should close the modal, save the updates and close the editor on clicking save and close button', async () => {
          const { queryByText, getByTestId, getByText } = renderQuickMarcEditor({
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
            instance: authority,
          });

          const contentField = getByTestId('content-field-1');

          fireEvent.change(contentField, { target: { value: '1xx update' } });
          await act(() => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

          const confirmButton = await getByText('Confirm');

          fireEvent.click(confirmButton);

          await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalled();
            expect(queryByText('Confirmation modal'));
            expect(onSaveMock).toHaveBeenCalledWith();
          });
        });

        it('should close the modal on clicking keep editing button ', async () => {
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

          await waitFor(() => {
            fireEvent.click(getByText('Cancel'));
            expect(queryByText('Confirmation modal')).toBeNull();
          });
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should open confirmation modal', async () => {
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

          await waitFor(() => expect(getByText('Confirmation modal')).toBeDefined());
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
          await act(() => fireEvent.click(getByText('ui-quick-marc.record.save.continue')));
          fireEvent.click(await getByText('Confirm'));

          await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalled();
            expect(queryByText('Confirmation modal')).toBeNull();
            expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
          });
        });

        it('should close the modal on clicking keep editing button ', async () => {
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
          await act(() => fireEvent.click(getByText('ui-quick-marc.record.save.continue')));

          await waitFor(() => expect(getByText('Confirmation modal')).toBeInTheDocument());

          fireEvent.click(await getByText('Cancel'));

          await waitFor(() => {
            expect(queryByText('Confirmation modal')).toBeNull();
          });
        });
      });
    });

    describe('when update 1xx field', () => {
      describe('when click on save&close button', () => {
        it('should open confirmation modal', async () => {
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

          await waitFor(() => expect(getByText('Confirmation modal')).toBeDefined());
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
          await act(() => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

          const confirmButton = await getByText('Confirm');

          await act(() => fireEvent.click(confirmButton));

          await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalled();
            expect(queryByText('Confirmation modal')).toBeNull();
            expect(onSaveMock).toHaveBeenCalled();
          });
        });

        it('should close the modal on clicking keep editing button ', async () => {
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

          await waitFor(() => {
            fireEvent.click(getByText('Cancel'));
            expect(queryByText('Confirmation modal')).toBeNull();
          });
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should open confirmation modal', async () => {
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

          await waitFor(() => expect(getByText('Confirmation modal')).toBeDefined());
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

          await act(() => fireEvent.click(getByText('ui-quick-marc.record.save.continue')));

          const confirmButton = await getByText('Confirm');

          fireEvent.click(confirmButton);

          await waitFor(async () => {
            expect(onSubmitMock).toHaveBeenCalled();
            expect(queryByText('Confirmation modal')).toBeNull();
            expect(getByText('ui-quick-marc.authority-record.edit.title')).toBeDefined();
          });
        });

        it('should close the modal on clicking keep editing button ', async () => {
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
          await act(() => fireEvent.click(getByText('ui-quick-marc.record.save.continue')));
          fireEvent.click(await getByText('Cancel'));

          await waitFor(() => {
            expect(queryByText('Confirmation modal')).toBeNull();
          });
        });
      });
    });

    describe('when fields other than 010 or 1xx are updated', () => {
      describe('when click on save&close button', () => {
        it('should not open confirmation modal, but save the updates', async () => {
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

          await waitFor(() => {
            expect(queryByText('Confirmation modal')).toBeNull();
            expect(onSubmitMock).toHaveBeenCalled();
          });
        });
      });

      describe('when click on save&keep editing button', () => {
        it('should not open confirmation modal, but save the updates', async () => {
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

          await waitFor(() => {
            expect(queryByText('Confirmation modal')).toBeNull();
            expect(onSubmitMock).toHaveBeenCalled();
          });
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
