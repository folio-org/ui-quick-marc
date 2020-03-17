import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditor from './QuickMarcEditor';

const getInstance = () => ({
  id: faker.random.uuid(),
  title: faker.lorem.sentence(),
});

const renderQuickMarcEditor = ({ instance, onClose }) => (render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <QuickMarcEditor
        instance={instance}
        onClose={onClose}
      />
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Quick Marc Editor', () => {
  afterEach(cleanup);

  it('Than it should display instance title in pane title', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({ instance, onClose: jest.fn() });

    expect(getByText(instance.title)).toBeDefined();
  });

  it('Than it should display pane footer', () => {
    const instance = getInstance();
    const { getByText } = renderQuickMarcEditor({ instance, onClose: jest.fn() });

    expect(getByText('stripes-acq-components.FormFooter.cancel')).toBeDefined();
  });
});
