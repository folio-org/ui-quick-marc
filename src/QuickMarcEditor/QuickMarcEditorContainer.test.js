import React from 'react';
import { createMemoryHistory } from 'history';
import {
  render,
  act,
  fireEvent,
  screen,
  within,
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
import {
  authorityLeaderString,
  bibLeaderString,
  holdingsLeaderString,
} from '../../test/jest/fixtures/leaders';
import { useAuthorityLinksCount } from '../queries';
import { applyCentralTenantInHeaders } from './utils';

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
  useLccnDuplicateConfig: jest.fn().mockReturnValue({
    isLoading: false,
    duplicateLccnCheckingEnabled: false,
  }),
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: `ui-quick-marc.${MARC_TYPES.BIB}-record.edit.title`,
  _version: '1',
});

const record = {
  id: faker.random.uuid(),
  leader: bibLeaderString,
  marcFormat: MARC_TYPES.BIB.toUpperCase(),
  fields: [],
};

const resources = {};

const locations = [];

const externalRecordPath = '/external/record/path';

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

const renderQuickMarcEditorContainer = ({ history, ...props } = {}) => (render(
  <Harness history={history}>
    <QuickMarcEditorContainer
      marcType={MARC_TYPES.BIB}
      externalRecordPath={externalRecordPath}
      onClose={mockOnClose}
      onSave={mockOnSave}
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

      expect(history.replace).not.toHaveBeenCalled();
    });
  });

  describe('Leader field', () => {
    describe('when the action is CREATE a bib record', () => {
      let recordLengthField;
      let statusField;
      let typeField;
      let blvlField;
      let ctrlField;
      let positions9to16Field;
      let elvlField;
      let descField;
      let multiLvlField;
      let positions20to23Field;

      beforeEach(async () => {
        await act(async () => {
          await renderQuickMarcEditorContainer({
            mutator,
            onClose: jest.fn(),
            action: QUICK_MARC_ACTIONS.CREATE,
            wrapper: QuickMarcEditWrapper,
          });
        });

        recordLengthField = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.Record length' });
        statusField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Status' });
        typeField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Type' });
        blvlField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.BLvl' });
        ctrlField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Ctrl' });
        positions9to16Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.9-16 positions' });
        elvlField = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.tip.ELvl' });
        descField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Desc' });
        multiLvlField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.MultiLvl' });
        positions20to23Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.20-23 positions' });
      });

      it('should display correct default values', () => {
        expect(recordLengthField).toHaveValue('00000');
        expect(statusField).toHaveValue('n');
        expect(typeField).toHaveValue('\\');
        expect(blvlField).toHaveValue('\\');
        expect(ctrlField).toHaveValue('\\');
        expect(positions9to16Field).toHaveValue('a2200000');
        expect(elvlField).toHaveValue('u');
        expect(descField).toHaveValue('u');
        expect(multiLvlField).toHaveValue('\\');
        expect(positions20to23Field).toHaveValue('4500');
      });

      it('should display correct Status dropdown options', () => {
        const statusFieldOptions = within(statusField).getAllByRole('option');

        expect(statusFieldOptions[0]).toHaveTextContent('a - ui-quick-marc.leader.Increase in encoding level');
        expect(statusFieldOptions[1]).toHaveTextContent('c - ui-quick-marc.leader.Corrected or revised');
        expect(statusFieldOptions[2]).toHaveTextContent('d - ui-quick-marc.leader.Deleted');
        expect(statusFieldOptions[3]).toHaveTextContent('n - ui-quick-marc.leader.New');
        expect(statusFieldOptions[4]).toHaveTextContent('p - ui-quick-marc.leader.Increase in encoding level from prepublication');
      });

      it('should display correct Type dropdown options', () => {
        const typeFieldOptions = within(typeField).getAllByRole('option');

        expect(typeFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.record.fixedField.invalid.value');
        expect(typeFieldOptions[1]).toHaveTextContent('a - ui-quick-marc.leader.Language material');
        expect(typeFieldOptions[2]).toHaveTextContent('c - ui-quick-marc.leader.Notated music');
        expect(typeFieldOptions[3]).toHaveTextContent('d - ui-quick-marc.leader.Manuscript notated music');
        expect(typeFieldOptions[4]).toHaveTextContent('e - ui-quick-marc.leader.Cartographic material');
        expect(typeFieldOptions[5]).toHaveTextContent('f - ui-quick-marc.leader.Manuscript cartographic material');
        expect(typeFieldOptions[6]).toHaveTextContent('g - ui-quick-marc.leader.Projected medium');
        expect(typeFieldOptions[7]).toHaveTextContent('i - ui-quick-marc.leader.Nonmusical sound recording');
        expect(typeFieldOptions[8]).toHaveTextContent('j - ui-quick-marc.leader.Musical sound recording');
        expect(typeFieldOptions[9]).toHaveTextContent('k - ui-quick-marc.leader.Two-dimensional nonprojectable graphic');
        expect(typeFieldOptions[10]).toHaveTextContent('m - ui-quick-marc.leader.Computer file');
        expect(typeFieldOptions[11]).toHaveTextContent('o - ui-quick-marc.leader.Kit');
        expect(typeFieldOptions[12]).toHaveTextContent('p - ui-quick-marc.leader.Mixed materials');
        expect(typeFieldOptions[13]).toHaveTextContent('r - ui-quick-marc.leader.Three-dimensional artifact or naturally occurring object');
        expect(typeFieldOptions[14]).toHaveTextContent('t - ui-quick-marc.leader.Manuscript language material');
      });

      it('should display correct BLvl dropdown options', () => {
        const blvlFieldOptions = within(blvlField).getAllByRole('option');

        expect(blvlFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.record.fixedField.invalid.value');
        expect(blvlFieldOptions[1]).toHaveTextContent('a - ui-quick-marc.leader.Monographic component part');
        expect(blvlFieldOptions[2]).toHaveTextContent('b - ui-quick-marc.leader.Serial component part');
        expect(blvlFieldOptions[3]).toHaveTextContent('c - ui-quick-marc.leader.Collection');
        expect(blvlFieldOptions[4]).toHaveTextContent('d - ui-quick-marc.leader.Subunit');
        expect(blvlFieldOptions[5]).toHaveTextContent('i - ui-quick-marc.leader.Integrating resource');
        expect(blvlFieldOptions[6]).toHaveTextContent('m - ui-quick-marc.leader.Monograph/Item');
        expect(blvlFieldOptions[7]).toHaveTextContent('s - ui-quick-marc.leader.Serial');
      });

      it('should display correct Ctrl dropdown options', () => {
        const ctrlFieldOptions = within(ctrlField).getAllByRole('option');

        expect(ctrlFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.leader.No specified type');
        expect(ctrlFieldOptions[1]).toHaveTextContent('a - ui-quick-marc.leader.Archival');
      });

      it('should display correct Desc dropdown options', () => {
        const descFieldOptions = within(descField).getAllByRole('option');

        expect(descFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.leader.Non-ISBD');
        expect(descFieldOptions[1]).toHaveTextContent('a - ui-quick-marc.leader.AACR2');
        expect(descFieldOptions[2]).toHaveTextContent('c - ui-quick-marc.leader.ISBD punctuation omitted');
        expect(descFieldOptions[3]).toHaveTextContent('i - ui-quick-marc.leader.ISBD punctuation included');
        expect(descFieldOptions[4]).toHaveTextContent('n - ui-quick-marc.leader.Non-ISBD punctuation omitted');
        expect(descFieldOptions[5]).toHaveTextContent('u - ui-quick-marc.leader.Unknown');
      });

      it('should display correct MultiLvl dropdown options', () => {
        const multiLvlFieldOptions = within(multiLvlField).getAllByRole('option');

        expect(multiLvlFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.leader.Not specified or not applicable');
        expect(multiLvlFieldOptions[1]).toHaveTextContent('a - ui-quick-marc.leader.Set');
        expect(multiLvlFieldOptions[2]).toHaveTextContent('b - ui-quick-marc.leader.Part with independent title');
        expect(multiLvlFieldOptions[3]).toHaveTextContent('c - ui-quick-marc.leader.Part with dependent title');
      });
    });

    describe('when the action is CREATE an authority record', () => {
      let recordLengthField;
      let statusField;
      let typeField;
      let positions7to16Field;
      let elvlField;
      let punctField;
      let positions19to23Field;

      beforeEach(async () => {
        await act(async () => {
          await renderQuickMarcEditorContainer({
            mutator: {
              ...mutator,
              quickMarcEditMarcRecord: {
                GET: jest.fn().mockResolvedValue({
                  id: faker.random.uuid(),
                  leader: authorityLeaderString,
                  marcFormat: MARC_TYPES.AUTHORITY.toUpperCase(),
                  fields: [],
                }),
              },
            },
            onClose: jest.fn(),
            action: QUICK_MARC_ACTIONS.CREATE,
            marcType: MARC_TYPES.AUTHORITY,
            wrapper: QuickMarcEditWrapper,
          });
        });

        recordLengthField = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.Record length' });
        statusField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Status' });
        typeField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Type' });
        positions7to16Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.7-16 positions' });
        elvlField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.ELvl' });
        punctField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Punct' });
        positions19to23Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.19-23 positions' });
      });

      it('should display correct default values', () => {
        expect(recordLengthField).toHaveValue('00000');
        expect(statusField).toHaveValue('n');
        expect(typeField).toHaveValue('z');
        expect(positions7to16Field).toHaveValue('\\\\a2200000');
        expect(elvlField).toHaveValue('o');
        expect(punctField).toHaveValue('\\');
        expect(positions19to23Field).toHaveValue('\\4500');
      });

      it('should display correct Status dropdown options', () => {
        const statusFieldOptions = within(statusField).getAllByRole('option');

        expect(statusFieldOptions[0]).toHaveTextContent('a - ui-quick-marc.leader.Increase in encoding level');
        expect(statusFieldOptions[1]).toHaveTextContent('c - ui-quick-marc.leader.Corrected or revised');
        expect(statusFieldOptions[2]).toHaveTextContent('d - ui-quick-marc.leader.Deleted');
        expect(statusFieldOptions[3]).toHaveTextContent('n - ui-quick-marc.leader.New');
        expect(statusFieldOptions[4]).toHaveTextContent('o - ui-quick-marc.leader.Obsolete');
        expect(statusFieldOptions[5]).toHaveTextContent('s - ui-quick-marc.leader.Deleted; heading split into two or more headings');
        expect(statusFieldOptions[6]).toHaveTextContent('x - ui-quick-marc.leader.Deleted; heading replaced by another heading');
      });

      it('should display correct Type dropdown options', () => {
        const typeFieldOptions = within(typeField).getAllByRole('option');

        expect(typeFieldOptions[0]).toHaveTextContent('z - ui-quick-marc.leader.Authority data');
      });

      it('should display correct ELvl dropdown options', () => {
        const elvlFieldOptions = within(elvlField).getAllByRole('option');

        expect(elvlFieldOptions[0]).toHaveTextContent('n - ui-quick-marc.leader.Complete authority record');
        expect(elvlFieldOptions[1]).toHaveTextContent('o - ui-quick-marc.leader.Incomplete authority record');
      });

      it('should display correct Punct dropdown options', () => {
        const punctFieldOptions = within(punctField).getAllByRole('option');

        expect(punctFieldOptions[0]).toHaveTextContent('\\ - ui-quick-marc.leader.No information provided');
        expect(punctFieldOptions[1]).toHaveTextContent('c - ui-quick-marc.leader.Punctuation omitted');
        expect(punctFieldOptions[2]).toHaveTextContent('i - ui-quick-marc.leader.Punctuation included');
        expect(punctFieldOptions[3]).toHaveTextContent('u - ui-quick-marc.leader.Unknown');
      });
    });

    describe('when the action is CREATE a holdings record', () => {
      let recordLengthField;
      let statusField;
      let typeField;
      let positions7to16Field;
      let elvlField;
      let itemField;
      let positions19to23Field;

      beforeEach(async () => {
        await act(async () => {
          await renderQuickMarcEditorContainer({
            mutator: {
              ...mutator,
              quickMarcEditMarcRecord: {
                GET: jest.fn().mockResolvedValue({
                  id: faker.random.uuid(),
                  leader: holdingsLeaderString,
                  marcFormat: MARC_TYPES.HOLDINGS.toUpperCase(),
                  fields: [],
                }),
              },
            },
            onClose: jest.fn(),
            action: QUICK_MARC_ACTIONS.CREATE,
            marcType: MARC_TYPES.HOLDINGS,
            wrapper: QuickMarcEditWrapper,
          });
        });

        recordLengthField = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.Record length' });
        statusField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Status' });
        typeField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Type' });
        positions7to16Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.7-16 positions' });
        elvlField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.ELvl' });
        itemField = screen.getByRole('combobox', { name: 'ui-quick-marc.record.fixedField.tip.Item' });
        positions19to23Field = screen.getByRole('textbox', { name: 'ui-quick-marc.record.fixedField.19-23 positions' });
      });

      it('should display correct default values', async () => {
        expect(recordLengthField).toHaveValue('00000');
        expect(statusField).toHaveValue('n');
        expect(typeField).toHaveValue('u');
        expect(positions7to16Field).toHaveValue('\\\\\\2200000');
        expect(elvlField).toHaveValue('u');
        expect(itemField).toHaveValue('n');
        expect(positions19to23Field).toHaveValue('\\4500');
      });

      it('should display correct Status dropdown options', () => {
        const statusFieldOptions = within(statusField).getAllByRole('option');

        expect(statusFieldOptions[0]).toHaveTextContent('c - ui-quick-marc.leader.Corrected or revised');
        expect(statusFieldOptions[1]).toHaveTextContent('d - ui-quick-marc.leader.Deleted');
        expect(statusFieldOptions[2]).toHaveTextContent('n - ui-quick-marc.leader.New');
      });

      it('should display correct Type dropdown options', () => {
        const typeFieldOptions = within(typeField).getAllByRole('option');

        expect(typeFieldOptions[0]).toHaveTextContent('u - ui-quick-marc.leader.Unknown');
        expect(typeFieldOptions[1]).toHaveTextContent('v - ui-quick-marc.leader.Multipart item holdings');
        expect(typeFieldOptions[2]).toHaveTextContent('x - ui-quick-marc.leader.Single-part item holdings');
        expect(typeFieldOptions[3]).toHaveTextContent('y - ui-quick-marc.leader.Serial item holdings');
      });

      it('should display correct ELvl dropdown options', () => {
        const elvlFieldOptions = within(elvlField).getAllByRole('option');

        expect(elvlFieldOptions[0]).toHaveTextContent('1 - ui-quick-marc.leader.Holdings level 1');
        expect(elvlFieldOptions[1]).toHaveTextContent('2 - ui-quick-marc.leader.Holdings level 2');
        expect(elvlFieldOptions[2]).toHaveTextContent('3 - ui-quick-marc.leader.Holdings level 3');
        expect(elvlFieldOptions[3]).toHaveTextContent('4 - ui-quick-marc.leader.Holdings level 4');
        expect(elvlFieldOptions[4]).toHaveTextContent('5 - ui-quick-marc.leader.Holdings level 4 with piece designation');
        expect(elvlFieldOptions[5]).toHaveTextContent('m - ui-quick-marc.leader.Mixed level');
        expect(elvlFieldOptions[6]).toHaveTextContent('u - ui-quick-marc.leader.Unknown');
        expect(elvlFieldOptions[7]).toHaveTextContent('z - ui-quick-marc.leader.Other level');
      });

      it('should display correct ELvl dropdown options', () => {
        const itemFieldOptions = within(itemField).getAllByRole('option');

        expect(itemFieldOptions[0]).toHaveTextContent('i - ui-quick-marc.leader.Item information');
        expect(itemFieldOptions[1]).toHaveTextContent('n - ui-quick-marc.leader.No item information');
      });
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
