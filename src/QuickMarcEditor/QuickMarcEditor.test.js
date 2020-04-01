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
};

const renderQuickMarcEditor = ({ instance, onClose, onSubmit, form }) => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
      <QuickMarcEditor
        instance={instance}
        onClose={onClose}
        onSubmit={onSubmit}
        form={form}
      />
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Quick Marc Editor', () => {
  let mutators;

  beforeEach(() => {
    mutators = {
      addRecord: jest.fn()
    }
  })

  afterEach(cleanup);

  it('Than it should display instance title in pane title', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({
      instance,
      onClose: jest.fn(),
      onSubmit: jest.fn(),
      form: {
        mutators,
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
      form: {
        mutators,
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
      form: {
        mutators,
      },
    });

    expect(getByText('QuickMarcEditorRows')).toBeDefined();
  });
});
