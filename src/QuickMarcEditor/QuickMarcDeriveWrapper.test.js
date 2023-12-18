import React from 'react';
import {
  act,
  render,
  fireEvent,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import faker from 'faker';

import { runAxeTest } from '@folio/stripes-testing';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcDeriveWrapper from './QuickMarcDeriveWrapper';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

import Harness from '../../test/jest/helpers/harness';
import { useAuthorityLinking } from '../hooks';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useLinkSuggestions: jest.fn().mockReturnValue({ isLoading: false, fetchLinkSuggestions: jest.fn() }),
}));

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useAuthorityLinking: jest.fn(),
}));

const mockFormValues = jest.fn(() => ({
  fields: undefined,
  externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
  leader: '14706cam a2200865Ii 4500',
  parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  marcFormat: MARC_TYPES.BIB,
  records: [
    {
      tag: 'LDR',
      content: '14706cam a2200865Ii 4500',
      id: 'LDR',
    }, {
      tag: '001',
      content: '',
      indicators: [],
      id: '595a98e6-8e59-448d-b866-cd039b990423',
    }, {
      tag: '008',
      content: {
        Audn: '\\',
        BLvl: 'm',
        Biog: '\\',
        Conf: '0',
        Cont: ['b', '\\', '\\', '\\'],
        Ctry: 'miu',
        Date1: '2009',
        Date2: '\\\\',
        Desc: 'i',
        DtSt: 's',
        Entered: '130325',
        Fest: '0',
        Form: 'o',
        GPub: '\\',
        Ills: ['\\', '\\', '\\', '\\'],
        Indx: '1',
        Lang: 'eng',
        LitF: '0',
        MRec: '\\',
        Srce: 'd',
        Type: 'a',
      },
      indicators: [],
      id: '93213747-46fb-4861-b8e8-8774bf4a46a4',
    }, {
      tag: '050',
      content: '$a BS1545.53 $b .J46 2009eb',
      indicators: [],
      id: '6abdaf9b-ac58-4f83-9687-73c939c3c21a',
    }, {
      tag: '100',
      content: '$a value $0 http://some-url/naturalId',
      linkDetails: {
        authorityId: 'authority-id',
        authorityNaturalId: 'naturalId',
        linkingRuleId: 1,
      },
    }, {
      'tag': '100',
      'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 4808f6ae-8379-41e9-a795-915ac4751668',
      'indicators': ['1', '\\'],
      'isProtected': false,
      'id': '5481472d-a621-4571-9ef9-438a4c7044fd',
      '_isDeleted': false,
      '_isLinked': true,
      'linkDetails': {
        'authorityNaturalId': 'n2008001084',
        'authorityId': '4808f6ae-8379-41e9-a795-915ac4751668',
        'linkingRuleId': 1,
        'status': 'ACTUAL',
      },
      'subfieldGroups': {
        'controlled': '$a Coates, Ta-Nehisi',
        'uncontrolledAlpha': '$e author.',
        'zeroSubfield': '$0 id.loc.gov/authorities/names/n2008001084',
        'nineSubfield': '$9 4808f6ae-8379-41e9-a795-915ac4751668',
        'uncontrolledNumber': '',
      },
    }, {
      'id': '0b3938b5-3ed6-45a0-90f9-fcf24dfebc7c',
      'tag': '100',
      'content': '$a Ma, Wei $0 id.loc.gov/authorities/names/n84160718 $9 495884af-28d7-4d69-85e4-e84c5de693db',
      'indicators': ['\\', '\\'],
      '_isAdded': true,
      '_isLinked': true,
      'prevContent': '$a test',
      'linkDetails': {
        'authorityNaturalId': 'n84160718',
        'authorityId': '495884af-28d7-4d69-85e4-e84c5de693db',
        'linkingRuleId': 1,
        'status': 'NEW',
      },
      'subfieldGroups': {
        'controlled': '$a Ma, Wei',
        'uncontrolledAlpha': '',
        'zeroSubfield': '$0 id.loc.gov/authorities/names/n84160718',
        'nineSubfield': '$9 495884af-28d7-4d69-85e4-e84c5de693db',
        'uncontrolledNumber': '',
      },
    }, {
      content: '$a (derived2)/Ezekiel / $c Robert W. Jenson.',
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
      indicators: ['1', '0'],
      tag: '245',
    }, {
      tag: '999',
      content: '',
      indicators: [],
      id: '4a844042-5c7e-4e71-823e-599582a5d7ab',
    },
  ],
  suppressDiscovery: false,
  updateInfo: { recordState: 'NEW' },
}));

const mockDerivedRecord = () => {
  const record = mockFormValues();

  return {
    ...record,
    fields: record.records,
  };
};

jest.mock('@folio/stripes/final-form', () => () => (Component) => ({ onSubmit, ...props }) => {
  const formValues = mockFormValues();

  return (
    <Component
      handleSubmit={() => onSubmit(formValues)}
      form={{
        mutators: {
          markRecordsLinked: jest.fn(),
        },
        reset: jest.fn(),
        getState: jest.fn().mockReturnValue({ values: formValues }),
      }}
      {...props}
    />
  );
});

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({
    open,
    onCancel,
    onConfirm,
  }) => (open ? (
    <div>
      <span>Confirmation modal</span>
      <button
        type="button"
        onClick={onCancel}
      >
        Close
      </button>
      <button
        type="button"
        onClick={onConfirm}
      >
        Keep editing
      </button>
    </div>
  ) : null)),
}));

const mockActualizeLinks = jest.fn((formValuesToProcess) => Promise.resolve(formValuesToProcess));
const mockShowCallout = jest.fn();
const mockOnClose = jest.fn();

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(() => mockShowCallout),
}));

jest.mock('./QuickMarcEditorRows', () => {
  return {
    QuickMarcEditorRows: () => (<span>QuickMarcEditorRows</span>),
  };
});

jest.mock('./QuickMarcRecordInfo', () => {
  return {
    QuickMarcRecordInfo: () => <span>QuickMarcRecordInfo</span>,
  };
});

jest.mock('./getQuickMarcRecordStatus', () => () => jest.fn().mockResolvedValue({}));

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  QM_RECORD_STATUS_TIMEOUT: 5,
  QM_RECORD_STATUS_BAIL_TIME: 20,
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.record.edit.title',
});

const linkingRules = [{
  id: 1,
  bibField: '100',
  authorityField: '100',
  authoritySubfields: ['a', 'b', 't', 'd'],
  subfieldModifications: [],
  validation: {},
  autoLinkingEnabled: true,
}];

const initialValues = {
  leader: '14706cam a2200865Ii 4500',
  records: [
    {
      tag: 'LDR',
      content: '14706cam a2200865Ii 4500',
      id: 'LDR',
    },
    {
      tag: '100',
      content: '$a Coates, Ta-Nehisi $e author.',
      indicators: ['1', '\\'],
      _isLinked: true,
      id: '100',
    },
    {
      tag: '110',
      content: '$a Test title',
      indicators: ['2', '\\'],
      id: 'test-id-1',
    },
  ],
};

const renderQuickMarcDeriveWrapper = (props) => (render(
  <Harness>
    <QuickMarcDeriveWrapper
      onClose={mockOnClose}
      action={QUICK_MARC_ACTIONS.DERIVE}
      initialValues={initialValues}
      marcType={MARC_TYPES.BIB}
      {...props}
    />
  </Harness>,
));

describe('Given QuickMarcDeriveWrapper', () => {
  let mutator;
  let instance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = getInstance();
    mutator = {
      quickMarcEditInstance: {
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(mockDerivedRecord())),
        POST: jest.fn(() => Promise.resolve({})),
        PUT: jest.fn(() => Promise.resolve({})),
      },
      quickMarcRecordStatus: {
        GET: jest.fn(() => Promise.resolve({})),
      },
    };

    useAuthorityLinking.mockReturnValue({
      linkableBibFields: [],
      actualizeLinks: mockActualizeLinks,
      autoLinkingEnabled: true,
      autoLinkableBibFields: [],
      autoLinkAuthority: jest.fn(),
      linkingRules,
    });
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcDeriveWrapper({
      instance,
      mutator,
    });

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when click on cancel pane button', () => {
    it('should display pane footer', () => {
      const { getByRole } = renderQuickMarcDeriveWrapper({
        instance,
        mutator,
      });

      fireEvent.click(getByRole('button', { name: 'stripes-acq-components.FormFooter.cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('when click on save button', () => {
    it('should show on save message and redirect on load page', async () => {
      let getByText;

      await act(async () => {
        getByText = renderQuickMarcDeriveWrapper({
          instance,
          mutator,
        }).getByText;
      });

      await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.onSave' });

      expect(mockOnClose).toHaveBeenCalledWith('id');
    });

    describe('when there is an error during POST request', () => {
      it('should show an error message', async () => {
        let getByText;

        await act(async () => {
          getByText = renderQuickMarcDeriveWrapper({
            instance,
            mutator,
          }).getByText;
        });

        // eslint-disable-next-line prefer-promise-reject-errors
        mutator.quickMarcEditMarcRecord.POST = jest.fn(() => Promise.reject({
          json: () => Promise.resolve({}),
        }));

        await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

        expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalled();

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mockShowCallout).toHaveBeenCalledWith({
              messageId: 'ui-quick-marc.record.save.error.generic',
              type: 'error',
            });

            resolve();
          }, 10);
        });
      }, 1000);
    });

    it('should actualize links', async () => {
      await act(async () => {
        renderQuickMarcDeriveWrapper({
          instance,
          mutator,
        });
      });

      await act(async () => { fireEvent.click(screen.getByText('stripes-acq-components.FormFooter.save')); });

      const expectedFormValues = {
        marcFormat: MARC_TYPES.BIB,
        records: expect.arrayContaining([
          expect.objectContaining({
            tag: 'LDR',
            content: '14706cam a2200865Ii 4500',
          }),
          expect.objectContaining({
            tag: '100',
            content: '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 4808f6ae-8379-41e9-a795-915ac4751668',
            linkDetails: {
              authorityId: '4808f6ae-8379-41e9-a795-915ac4751668',
              authorityNaturalId: 'n2008001084',
              linkingRuleId: 1,
              status: 'ACTUAL',
            },
          }),
          expect.objectContaining({
            tag: '100',
            content: '$a Ma, Wei $0 id.loc.gov/authorities/names/n84160718 $9 495884af-28d7-4d69-85e4-e84c5de693db',
            prevContent: '$a test',
            linkDetails: {
              authorityNaturalId: 'n84160718',
              authorityId: '495884af-28d7-4d69-85e4-e84c5de693db',
              linkingRuleId: 1,
              status: 'NEW',
            },
          }),
        ]),
      };

      expect(mockActualizeLinks).toHaveBeenCalledWith(expect.objectContaining(expectedFormValues));
    });
  });
});
