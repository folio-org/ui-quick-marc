/* eslint-disable react/prop-types */

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, fireEvent } from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({ open }) => (open ? <span>Confirmation modal</span> : null)),
}));

jest.mock('./QuickMarcEditorRows', () => {
  return {
    QuickMarcEditorRows: ({ setDeletedRecords }) => (
      <>
        <span>QuickMarcEditorRows</span>
        <button
          type="button"
          onClick={() => setDeletedRecords({
            index: 1,
            record: {},
          })}
        >
          Delete row
        </button>
      </>
    ),
  };
});

jest.mock('./QuickMarcRecordInfo', () => {
  return {
    QuickMarcRecordInfo: () => <span>QuickMarcRecordInfo</span>,
  };
});

const getInstance = () => ({
  id: faker.random.uuid(),
  effectiveLocationId: 'locationId-1',
  title: 'Test title',
  callNumber: 'call number',
});

const locations = {
  records: [{
    id: 'locationId-1',
    name: 'Location 1',
  }, {
    id: 'locationId-2',
    name: 'Location 2',
  }],
};

const renderQuickMarcEditor = ({
  instance,
  onClose,
  onSubmit,
  mutators,
  marcType = 'bib',
}) => (render(
  <MemoryRouter>
    <QuickMarcEditor
      action="edit"
      instance={instance}
      onClose={onClose}
      onSubmit={onSubmit}
      mutators={mutators}
      initialValues={{ leader: 'assdfgs ds sdg' }}
      marcType={marcType}
      locations={locations}
    />
  </MemoryRouter>,
));

describe('Given Quick Marc Editor', () => {
  afterEach(cleanup);

  it('should display instance title in pane title', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({
      instance,
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      mutators: {
        addRecord: jest.fn(),
        deleteRecord: jest.fn(),
        moveRecord: jest.fn(),
      },
    });

    expect(getByText('ui-quick-marc.bib-record.edit.title')).toBeDefined();
  });

  it('should display pane footer', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({
      instance,
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      mutators: {
        addRecord: jest.fn(),
        deleteRecord: jest.fn(),
        moveRecord: jest.fn(),
      },
    });

    expect(getByText('stripes-acq-components.FormFooter.cancel')).toBeDefined();
  });

  it('should display QuickMarcEditorRows', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({
      instance,
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      mutators: {
        addRecord: jest.fn(),
        deleteRecord: jest.fn(),
        moveRecord: jest.fn(),
      },
    });

    expect(getByText('QuickMarcEditorRows')).toBeDefined();
  });

  describe('When deleting a row', () => {
    it('should not display ConfirmationModal', () => {
      const instance = getInstance();
      const {
        getByText,
        queryByText,
      } = renderQuickMarcEditor({
        instance,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        mutators: {
          addRecord: jest.fn(),
          deleteRecord: jest.fn(),
          moveRecord: jest.fn(),
        },
      });

      fireEvent.click(getByText('Delete row'));

      expect(queryByText('Confirmation modal')).toBeNull();
    });
  });

  describe('when marc record is of type HOLDINGS', () => {
    it('should display holdings record pane title', () => {
      const instance = getInstance();
      const { getByText } = renderQuickMarcEditor({
        instance,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        mutators: {
          addRecord: jest.fn(),
          deleteRecord: jest.fn(),
          moveRecord: jest.fn(),
        },
        marcType: 'holdings',
      });

      expect(getByText('ui-quick-marc.holdings-record.edit.title')).toBeDefined();
    });
  });
});
