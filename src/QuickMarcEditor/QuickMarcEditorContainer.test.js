import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorContainer from './QuickMarcEditorContainer';
import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  EXTERNAL_INSTANCE_APIS,
  MARC_TYPES,
} from '../common/constants';

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.bib-record.edit.title',
});

const match = {
  params: {
    externalId: 'external-id',
    instanceId: 'instance-id',
  },
};

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const locations = {};

const renderQuickMarcEditorContainer = ({
  onClose,
  mutator,
  action,
  wrapper,
  marcType = MARC_TYPES.BIB,
}) => (render(
  <MemoryRouter>
    <QuickMarcEditorContainer
      onClose={onClose}
      match={match}
      mutator={mutator}
      wrapper={wrapper}
      action={action}
      marcType={marcType}
    />
  </MemoryRouter>,
));

describe('Given Quick Marc Editor Container', () => {
  let mutator;
  let instance;

  beforeEach(() => {
    instance = getInstance();
    mutator = {
      externalInstanceApi: {
        update: jest.fn(),
      },
      quickMarcEditInstance: {
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        PUT: jest.fn(() => Promise.resolve()),
      },
      locations: {
        GET: () => Promise.resolve(locations),
      },
    };
  });

  afterEach(cleanup);

  it('should fetch MARC record', async () => {
    await act(async () => {
      await renderQuickMarcEditorContainer({
        mutator,
        onClose: jest.fn(),
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
      });
    });

    expect(mutator.quickMarcEditMarcRecord.GET).toHaveBeenCalled();
  });

  it('should display Quick Marc Editor with fetched instance', async () => {
    let getByText;

    await act(async () => {
      const renderer = await renderQuickMarcEditorContainer({
        mutator,
        onClose: jest.fn(),
        action: QUICK_MARC_ACTIONS.EDIT,
        wrapper: QuickMarcEditWrapper,
      });

      getByText = renderer.getByText;
    });

    expect(getByText(instance.title)).toBeDefined();
  });

  describe('When close button is pressed', () => {
    it('should invoke onClose', async () => {
      let getByText;
      const onClose = jest.fn();

      await act(async () => {
        const renderer = await renderQuickMarcEditorContainer({
          mutator,
          onClose,
          action: QUICK_MARC_ACTIONS.EDIT,
          wrapper: QuickMarcEditWrapper,
          marcType: MARC_TYPES.BIB,
        });

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
