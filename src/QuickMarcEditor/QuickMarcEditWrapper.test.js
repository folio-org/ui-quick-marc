import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import { QUICK_MARC_ACTIONS } from './constants';

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.record.edit.title',
});

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const renderQuickMarcEditWrapper = ({
  onClose,
  mutator,
  instance,
}) => (render(
  <MemoryRouter>
    <QuickMarcEditWrapper
      onClose={onClose}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.EDIT}
      initialValues={{ leader: 'assdfgs ds sdg' }}
    />
  </MemoryRouter>,
));

describe('Given QuickMarcEditWrapper', () => {
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

  describe('When save button is pressed', () => {
    it('Than it should invoke PUT action', async () => {
      let getByText;
      let queryByTestId;
      const onClose = jest.fn();

      await act(async () => {
        const renderer = await renderQuickMarcEditWrapper({
          mutator,
          onClose,
          instance,
        });

        getByText = renderer.getByText;
        queryByTestId = renderer.queryByTestId
      });

      const leaderField = queryByTestId('content-field-0');
      const saveButton = getByText('stripes-acq-components.FormFooter.save');

      fireEvent.change(leaderField, { target: { value: '01338casa22004094500' } });

      fireEvent(saveButton, new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }));

      expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
