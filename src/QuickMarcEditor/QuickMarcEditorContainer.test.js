import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  render,
  cleanup,
  act,
  fireEvent,
  screen,
} from '@testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorContainer from './QuickMarcEditorContainer';
import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

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

const locations = [];

const externalRecordPath = '/external/record/path';

const renderQuickMarcEditorContainer = ({
  onClose,
  mutator,
  action,
  wrapper,
  marcType = MARC_TYPES.BIB,
  history = createMemoryHistory(),
}) => (render(
  <Router history={history}>
    <QuickMarcEditorContainer
      onClose={onClose}
      match={match}
      mutator={mutator}
      wrapper={wrapper}
      action={action}
      marcType={marcType}
      externalRecordPath={externalRecordPath}
    />
  </Router>,
));

describe('Given Quick Marc Editor Container', () => {
  let mutator;
  let instance;
  let history;

  beforeEach(() => {
    jest.clearAllMocks();
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
    history = {
      action: 'PUSH',
      goBack: jest.fn(),
      go: jest.fn(),
      listen: jest.fn(),
      push: jest.fn(),
      block: jest.fn(),
      createHref: jest.fn(),
      replace: jest.fn(),
      location: {
        pathname: 'fake-path-name',
        hash: 'fake-hash',
        search: 'fake-search',
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

  describe('when data cannot be fetched', () => {
    const onClose = jest.fn();

    beforeEach(async () => {
      mutator.quickMarcEditMarcRecord.GET = jest.fn(() => Promise.reject());

      await act(async () => {
        renderQuickMarcEditorContainer({
          mutator,
          onClose,
          action: QUICK_MARC_ACTIONS.DUPLICATE,
          wrapper: QuickMarcEditWrapper,
        });
      });
    });

    it('should navigate back', () => {
      expect(onClose).toHaveBeenCalled();
    });

    it('should not display Quick Marc Editor', () => {
      expect(screen.queryByTestId('quick-marc-editor')).not.toBeInTheDocument();
    });
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
