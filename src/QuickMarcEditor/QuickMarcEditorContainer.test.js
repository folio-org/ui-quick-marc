import React from 'react';
import { createMemoryHistory } from 'history';
import {
  render,
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

import Harness from '../../test/jest/helpers/harness';
import { useAuthorityLinksCount } from '../queries';
import QuickMarcCreateBibWrapper from './QuickMarcCreateBibWrapper';

const mockFetchLinksCount = jest.fn().mockResolvedValue();

const match = {
  path: '/marc-authorities/quick-marc/edit-authority/:externalId',
  url: '/marc-authorities/quick-marc/edit-authority/external-id',
  params: {
    externalId: 'external-id',
    instanceId: 'instance-id',
  },
};

const location = {
  pathname: '/marc-authorities/quick-marc/edit-authority/external-id',
  search: '?authRefType=Authorized&headingRef=Beatles&segment=search&relatedRecordVersion=3',
  hash: '',
  key: 'vepmmg',
};

const mockHistory = createMemoryHistory();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  withRouter: Component => props => <Component {...props} match={match} location={location} history={mockHistory} />,
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({
    linkingRules: [],
    isLoading: false,
  }),
  useAuthoritySourceFiles: jest.fn().mockReturnValue({
    sourceFiles: [],
    isLoading: false,
  }),
  useAuthorityLinksCount: jest.fn().mockReturnValue({
    fetchLinksCount: jest.fn().mockResolvedValue({
      links: [{ totalLinks: 0 }],
    }),
  }),
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.bib-record.edit.title',
  _version: '1',
});

const record = {
  id: faker.random.uuid(),
  leader: faker.random.uuid(),
  fields: [],
};

const resources = {};

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
  <Harness history={history}>
    <QuickMarcEditorContainer
      onClose={onClose}
      mutator={mutator}
      wrapper={wrapper}
      action={action}
      marcType={marcType}
      externalRecordPath={externalRecordPath}
      resources={resources}
    />
  </Harness>,
));

describe('Given Quick Marc Editor Container', () => {
  let mutator;
  let instance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = getInstance();
    mutator = {
      externalInstanceApi: {
        update: jest.fn(),
      },
      quickMarcEditInstance: {
        GET: jest.fn(() => Promise.resolve(instance)),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        PUT: jest.fn(() => Promise.resolve()),
      },
      locations: {
        GET: jest.fn(() => Promise.resolve(locations)),
      },
    };
  });

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

  describe('when the marc type is authority', () => {
    it('should make a request to get the number of links', async () => {
      useAuthorityLinksCount.mockClear().mockReturnValue({
        fetchLinksCount: mockFetchLinksCount,
      });

      await act(async () => {
        await renderQuickMarcEditorContainer({
          mutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.EDIT,
          wrapper: QuickMarcEditWrapper,
          marcType: MARC_TYPES.AUTHORITY,
        });
      });

      expect(mockFetchLinksCount).toHaveBeenCalledWith([match.params.externalId]);
    });
  });

  describe('when data cannot be fetched', () => {
    const onClose = jest.fn();

    beforeEach(async () => {
      mutator.quickMarcEditMarcRecord.GET = jest.fn(() => Promise.reject());

      await act(async () => {
        renderQuickMarcEditorContainer({
          mutator,
          onClose,
          action: QUICK_MARC_ACTIONS.DERIVE,
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

  describe('when the action is not CREATE', () => {
    it('should append the relatedRecordVersion parameter to URL', async () => {
      const spyHistory = jest.spyOn(mockHistory, 'replace');

      await act(async () => {
        await renderQuickMarcEditorContainer({
          mutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.EDIT,
          wrapper: QuickMarcEditWrapper,
        });
      });

      expect(spyHistory).toHaveBeenCalledWith({ search: expect.stringContaining('relatedRecordVersion=1') });
    });
  });

  describe('when the action is CREATE_BIB', () => {
    it('should not to fetch the data and should fetch location', async () => {
      renderQuickMarcEditorContainer({
        mutator,
        onClose: jest.fn(),
        action: QUICK_MARC_ACTIONS.CREATE_BIB,
        wrapper: QuickMarcCreateBibWrapper,
        marcType: MARC_TYPES.BIB,
      });

      expect(mutator.quickMarcEditInstance.GET).not.toHaveBeenCalled();
      expect(mutator.quickMarcEditMarcRecord.GET).not.toHaveBeenCalled();
      expect(mutator.locations.GET).toHaveBeenCalled();
    });
  });

  describe('when the action is CREATE', () => {
    it('should not append the relatedRecordVersion parameter to URL', async () => {
      const history = createMemoryHistory();

      history.replace = jest.fn();

      await act(async () => {
        await renderQuickMarcEditorContainer({
          mutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.CREATE,
          wrapper: QuickMarcEditWrapper,
          history,
        });
      });

      expect(history.replace).not.toBeCalled();
    });
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
