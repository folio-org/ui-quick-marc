import React from 'react';
import { createMemoryHistory } from 'history';
import {
  render,
  act,
  fireEvent,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import faker from 'faker';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditorContainer from './QuickMarcEditorContainer';
import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import QuickMarcDeriveWrapper from './QuickMarcDeriveWrapper';
import { QUICK_MARC_ACTIONS } from './constants';
import {
  MARC_TYPES,
  OKAPI_TENANT_HEADER,
} from '../common/constants';

import Harness from '../../test/jest/helpers/harness';
import buildStripes from '../../test/jest/__mock__/stripesCore.mock';
import { useAuthorityLinksCount } from '../queries';
import { applyCentralTenantInHeaders } from './utils';

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

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  applyCentralTenantInHeaders: jest.fn(),
  changeTenantHeader: jest.fn(ky => ky),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  withRouter: Component => props => <Component match={match} location={location} history={mockHistory} {...props} />,
}));

jest.mock('@folio/stripes-marc-components', () => ({
  ...jest.requireActual('@folio/stripes-marc-components'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({
    linkingRules: [],
    isLoading: false,
  }),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useAuthoritySourceFiles: jest.fn().mockReturnValue({
    sourceFiles: [],
    isLoading: false,
  }),
  useAuthorityLinksCount: jest.fn().mockReturnValue({
    fetchLinksCount: jest.fn().mockResolvedValue({
      links: [{ totalLinks: 0 }],
    }),
  }),
  useLinkSuggestions: jest.fn().mockReturnValue({
    fetchLinkSuggestions: jest.fn(),
    isLoading: false,
  }),
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: `ui-quick-marc.${MARC_TYPES.BIB}-record.edit.title`,
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

const mockOnClose = jest.fn();

const renderQuickMarcEditorContainer = ({ history, ...props } = {}) => (render(
  <Harness history={history}>
    <QuickMarcEditorContainer
      marcType={MARC_TYPES.BIB}
      externalRecordPath={externalRecordPath}
      onClose={mockOnClose}
      resources={resources}
      {...props}
      onCheckCentralTenantPerm={() => false}
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
      linkingRules: {
        GET: jest.fn().mockResolvedValue([]),
      },
      fixedFieldSpec: {
        GET: jest.fn(() => Promise.resolve()),
      },
    };

    applyCentralTenantInHeaders.mockReturnValue(false);
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
      await act(async () => {
        await renderQuickMarcEditorContainer({
          mutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.EDIT,
          wrapper: QuickMarcEditWrapper,
          marcType: MARC_TYPES.AUTHORITY,
        });
      });

      expect(useAuthorityLinksCount).toHaveBeenCalledWith({ id: match.params.externalId });
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

  describe('when a user is in a member tenant and derives a shared record', () => {
    it('should take the record data from the central tenant', async () => {
      applyCentralTenantInHeaders.mockReturnValue(true);

      const stripes = buildStripes({
        okapi: { tenant: 'university', locale: 'en' },
        user: { user: { consortium: { centralTenantId: 'consortium' } } },
      });

      await act(async () => {
        renderQuickMarcEditorContainer({
          mutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.DERIVE,
          wrapper: QuickMarcDeriveWrapper,
          stripes,
        });
      });

      const requests = [
        mutator.quickMarcEditInstance.GET,
        mutator.quickMarcEditMarcRecord.GET,
        mutator.linkingRules.GET,
      ];

      requests.forEach(request => {
        expect(request).toHaveBeenCalledWith(expect.objectContaining({
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'en',
            'Content-Type': 'application/json',
            'X-Okapi-Tenant': 'consortium',
          },
        }));
      });
    });
  });

  describe('when a user is in a member tenant and derives a local record', () => {
    it('should take the record data from the member tenant', async () => {
      const newLocation = {
        ...location,
        search: '?shared=false',
      };
      const newMutator = {
        ...mutator,
        quickMarcEditInstance: {
          GET: jest.fn(() => Promise.resolve({ ...instance, source: 'FOLIO' })),
        },
      };
      const stripes = buildStripes({
        okapi: { tenant: 'university' },
        user: { user: { consortium: { centralTenantId: 'consortium' } } },
      });

      await act(async () => {
        renderQuickMarcEditorContainer({
          mutator: newMutator,
          onClose: jest.fn(),
          action: QUICK_MARC_ACTIONS.DERIVE,
          wrapper: QuickMarcDeriveWrapper,
          stripes,
          location: newLocation,
        });
      });

      const requests = [
        newMutator.quickMarcEditInstance.GET,
        newMutator.quickMarcEditMarcRecord.GET,
        newMutator.linkingRules.GET,
      ];

      requests.forEach(request => {
        expect(request).toHaveBeenCalledWith(expect.not.objectContaining({
          headers: {
            [OKAPI_TENANT_HEADER]: 'consortium',
          },
        }));
      });
    });
  });
});
