import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

jest.mock('./QuickMarcEditorRows', () => {
  return {
    QuickMarcEditorRows: () => <span>QuickMarcEditorRows</span>,
  };
});

const getInstance = () => ({
  id: faker.random.uuid(),
  title: faker.lorem.sentence(),
});

const messages = {
  'ui-quick-marc.record.edit.title': '{title}',
  'ui-quick-marc.record.moveUpRow': 'Move field up a row',
  'ui-quick-marc.record.moveDownRow': 'Move field down a row',
  'ui-quick-marc.record.field': 'Field',
  'ui-quick-marc.record.indicator': 'Indicator',
  'ui-quick-marc.record.subfield': 'Subfield',
  'ui-quick-marc.record.addField': 'Add a new field',
  'ui-quick-marc.record.deleteField': 'Delete this field',
};

const renderQuickMarcEditor = ({ instance, onClose, onSubmit, mutators }) => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
      <QuickMarcEditor
        instance={instance}
        onClose={onClose}
        onSubmit={onSubmit}
        mutators={mutators}
      />
    </MemoryRouter>
  </IntlProvider>,
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
