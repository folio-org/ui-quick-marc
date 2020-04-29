import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorContainer from './QuickMarcEditorContainer';

const getInstance = () => ({
  id: faker.random.uuid(),
  title: faker.lorem.sentence(),
});

const match = {
  params: {
    instanceId: faker.random.uuid(),
  },
};

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const messages = {
  'ui-quick-marc.record.edit.title': '{title}',
  'ui-quick-marc.record.subfield': 'Subfield',
  'ui-quick-marc.record.field': 'Field',
};

const renderQuickMarcEditorContainer = ({ onClose, mutator }) => (render(
  <IntlProvider locale="en" messages={messages}>
    <MemoryRouter>
      <QuickMarcEditorContainer
        onClose={onClose}
        match={match}
        mutator={mutator}
      />
    </MemoryRouter>
  </IntlProvider>,
));

describe('Given Quick Marc Editor Container', () => {
  let mutator;
  let instance;

  beforeEach(() => {
    instance = getInstance();
    mutator = {
      quickMarcEditInstance: {
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        PUT: jest.fn(() => Promise.resolve()),
      },
    };
  });

  afterEach(cleanup);

  it('Than it should fetch MARC record', async () => {
    await act(async () => {
      await renderQuickMarcEditorContainer({ mutator, onClose: jest.fn() });
    });

    expect(mutator.quickMarcEditMarcRecord.GET).toHaveBeenCalled();
  });

  it('Than it should display Quick Marc Editor with fetched instance', async () => {
    let getByText;

    await act(async () => {
      const renderer = await renderQuickMarcEditorContainer({ mutator, onClose: jest.fn() });

      getByText = renderer.getByText;
    });

    expect(getByText(instance.title)).toBeDefined();
  });

  describe('When close button is pressed', () => {
    it('Than it should invoke onCancel', async () => {
      let getByText;
      const onClose = jest.fn();

      await act(async () => {
        const renderer = await renderQuickMarcEditorContainer({ mutator, onClose });

        getByText = renderer.getByText;
      });

      const closeButton = getByText('stripes-acq-components.FormFooter.cancel');

      expect(onClose).not.toHaveBeenCalled();

      fireEvent(closeButton, new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }));

      expect(onClose).toHaveBeenCalled();
    });
  });
});
