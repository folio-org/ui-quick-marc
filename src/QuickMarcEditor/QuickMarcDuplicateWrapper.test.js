import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcDuplicateWrapper from './QuickMarcDuplicateWrapper';
import { QUICK_MARC_ACTIONS } from './constants';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({ open }) => (open ? <span>Confirmation modal</span> : null)),
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.record.edit.title',
});

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const renderQuickMarcDuplicateWrapper = ({
  instance,
  onClose,
  mutator,
  history,
}) => (render(
  <MemoryRouter>
    <QuickMarcDuplicateWrapper
      onClose={onClose}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.DUPLICATE}
      initialValues={{ leader: 'assdfgs ds sdg' }}
      history={history}
    />
  </MemoryRouter>,
));

describe('Given QuickMarcDuplicateWrapper', () => {
  let mutator;
  let instance;
  let history;

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
    history = {
      push: jest.fn(),
    };
  });

  afterEach(cleanup);

  describe('when click on cancel pane button', () => {
    it('Than it should display pane footer', () => {
      const instance = getInstance();
      const { getByText } = renderQuickMarcDuplicateWrapper({
        instance,
        mutator,
        history,
        onClose: jest.fn(),
      });
  
      fireEvent.click(getByText('stripes-acq-components.FormFooter.cancel'));

      expect('Confirmation modal').toBeDefined();
    });
  });
});
