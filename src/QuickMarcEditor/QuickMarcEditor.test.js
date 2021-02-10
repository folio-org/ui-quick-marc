import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

jest.mock('./QuickMarcEditorRows', () => {
  return {
    QuickMarcEditorRows: () => <span>QuickMarcEditorRows</span>,
  };
});

jest.mock('./QuickMarcRecordInfo', () => {
  return {
    QuickMarcRecordInfo: () => <span>QuickMarcRecordInfo</span>,
  };
});

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.record.edit.title',
});

const renderQuickMarcEditor = ({ instance, onClose, onSubmit, mutators }) => (render(
  <MemoryRouter>
    <QuickMarcEditor
      action="edit"
      instance={instance}
      onClose={onClose}
      onSubmit={onSubmit}
      mutators={mutators}
      initialValues={{ leader: 'assdfgs ds sdg' }}
    />
  </MemoryRouter>,
));

describe('Given Quick Marc Editor', () => {
  afterEach(cleanup);

  it('Than it should display instance title in pane title', () => {
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

    expect(getByText(instance.title)).toBeDefined();
  });

  it('Than it should display pane footer', () => {
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

  it('Than it should display QuickMarcEditorRows', () => {
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
});
