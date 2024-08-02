import React from 'react';
import {
  act,
  render,
  fireEvent,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';

import { runAxeTest } from '@folio/stripes-testing';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcCreateWrapper from './QuickMarcCreateWrapper';
import QuickMarcEditor from './QuickMarcEditor';
import { MARC_TYPES } from '../common/constants';
import { QUICK_MARC_ACTIONS } from './constants';

import Harness from '../../test/jest/helpers/harness';
import { useAuthorityLinking } from '../hooks';
import { saveLinksToNewRecord } from './utils';
import {
  authorityLeader,
  bibLeader,
  bibLeaderString,
  holdingsLeader,
} from '../../test/jest/fixtures/leaders';
import fixedFieldSpecBib from '../../test/mocks/fixedFieldSpecBib';

const runWithDelayedPromise = (fn, delay) => () => {
  return new Promise(resolve => setTimeout(() => resolve(fn()), delay));
};

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  saveLinksToNewRecord: jest.fn(),
}));

jest.mock('./QuickMarcEditor', () => {
  const RealQuickMarcEditor = jest.requireActual('./QuickMarcEditor').default;

  return jest.fn(props => <RealQuickMarcEditor {...props} />);
});
jest.mock('./getQuickMarcRecordStatus', () => {
  return jest.fn().mockResolvedValue({
    externalId: 'externalId-1',
  });
});

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
}));

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useAuthorityLinking: jest.fn(),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useLccnDuplicateConfig: jest.fn().mockReturnValue({
    isLoading: false,
    duplicateLccnCheckingEnabled: false,
  }),
}));

const mockRecords = {
  [MARC_TYPES.HOLDINGS]: [
    {
      tag: 'LDR',
      content: holdingsLeader,
      id: 'LDR',
    }, {
      tag: '001',
      id: '595a98e6-8e59-448d-b866-cd039b990423',
    }, {
      tag: '004',
      content: 'in00000000022',
      id: '93213747-46fb-4861-b8e8-8774bf4a46a4',
    }, {
      tag: '008',
      content: {},
      indicators: ['\\', '\\'],
    }, {
      tag: '852',
      content: '$b KU/CC/DI/A $t 3 $h M3 $i .M93 1955 $m + $x Rec\'d in Music Lib ;',
      indicators: ['0', '1'],
      id: '6abdaf9b-ac58-4f83-9687-73c939c3c21a',
    }, {
      tag: '014',
      content: '$a ABS3966CU004',
      indicators: ['1', '\\'],
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
    }, {
      tag: '005',
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
    }, {
      tag: '999',
      indicators: ['f', 'f'],
      id: '4a844042-5c7e-4e71-823e-599582a5d7ab',
    },
  ],
  [MARC_TYPES.BIB]: [
    {
      'tag': 'LDR',
      'content': bibLeader,
      'id': 'LDR',
    }, {
      'tag': '001',
      'content': 'in00000000003',
      'id': '595a98e6-8e59-448d-b866-cd039b990423',
    }, {
      'tag': '008',
      'content': {
        'Type': 'a',
        'BLvl': 'm',
        'Desc': 'c',
        'Entered': '211212',
        'DtSt': '|',
        'Date1': '2016',
        'Date2': '||||',
        'Ctry': '|||',
        'Lang': 'mul',
        'MRec': '|',
        'Srce': '|',
        'Ills': ['|', '|', '|', '|'],
        'Audn': '|',
        'Form': '\\',
        'Cont': ['\\', '\\', '\\', '\\'],
        'GPub': '\\',
        'Conf': '\\',
        'Fest': '|',
        'Indx': '|',
        'LitF': '|',
        'Biog': '|',
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
      'content': '$a Title',
      'tag': '245',
    },
  ],
  [MARC_TYPES.AUTHORITY]: [
    {
      'tag': 'LDR',
      'content': authorityLeader,
      'id': 'LDR',
    },
    {
      'tag': '001',
      'content': 'value1',
    },
    {
      'tag': '008',
      'content': {
        'Undef_18': '\\\\\\\\\\\\\\\\\\\\',
        'Undef_30': '\\',
        'Undef_34': '\\\\\\\\',
        'Geo Subd': '\\',
        'Roman': '\\',
        'Lang': '\\',
        'Kind rec': '\\',
        'Cat Rules': '\\',
        'SH Sys': '\\',
        'Series': '\\',
        'Numb Series': '\\',
        'Main use': '\\',
        'Subj use': '\\',
        'Series use': '\\',
        'Type Subd': '\\',
        'Govt Ag': '\\',
        'RefEval': '\\',
        'RecUpd': '\\',
        'Pers Name': '\\',
        'Level Est': '\\',
        'Mod Rec Est': '\\',
        'Source': '\\',
      },
    },
    {
      'tag': '010',
      'content': '$a value1',
      'indicators': ['\\', '\\'],
    },
    {
      'tag': '100',
      'content': '$a value2',
      'indicators': ['\\', '\\'],
    },
  ],
};

const mockLeaders = {
  [MARC_TYPES.BIB]: bibLeader,
  [MARC_TYPES.HOLDINGS]: holdingsLeader,
  [MARC_TYPES.AUTHORITY]: authorityLeader,
};

const mockFormValues = jest.fn((marcType) => ({
  fields: undefined,
  externalHrid: 'in00000000022',
  externalId: '00000000-0000-0000-0000-000000000000',
  leader: mockLeaders[marcType],
  marcFormat: marcType.toUpperCase(),
  parsedRecordDtoId: '00000000-0000-0000-0000-000000000000',
  records: mockRecords[marcType],
  relatedRecordVersion: 1,
  suppressDiscovery: false,
  updateInfo: { recordState: 'NEW' },
}));

jest.mock('@folio/stripes/final-form', () => () => (Component) => ({
  onSubmit,
  marcType,
  ...props
}) => {
  const formValues = mockFormValues(marcType);

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
      marcType={marcType}
      {...props}
    />
  );
});

const mockActualizeLinks = jest.fn((formValuesToProcess) => Promise.resolve(formValuesToProcess));
const mockShowCallout = jest.fn();

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

jest.mock('./constants', () => ({
  ...jest.requireActual('./constants'),
  QM_RECORD_STATUS_TIMEOUT: 5,
  QM_RECORD_STATUS_BAIL_TIME: 20,
}));

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-inventory.instanceRecordTitle',
});

const record = {
  id: faker.random.uuid(),
  leader: bibLeader,
  fields: [],
};

const locations = [{
  code: 'KU/CC/DI/A',
}];

const renderQuickMarcCreateWrapper = ({
  instance,
  onClose = noop,
  onSave = noop,
  mutator,
  marcType = MARC_TYPES.HOLDINGS,
}) => (render(
  <Harness>
    <QuickMarcCreateWrapper
      onClose={onClose}
      onSave={onSave}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.CREATE}
      marcType={marcType}
      fixedFieldSpec={fixedFieldSpecBib}
      initialValues={mockFormValues(marcType)}
      locations={locations}
    />
  </Harness>,
));

describe('Given QuickMarcCreateWrapper', () => {
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
        POST: jest.fn(() => Promise.resolve({})),
        PUT: jest.fn().mockResolvedValue({}),
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
      linkingRules: [],
      sourceFiles: [],
    });

    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcCreateWrapper({
      instance,
      mutator,
    });

    await runAxeTest({
      rootNode: container,
    });
  });

  describe('when click on cancel pane button', () => {
    const onClose = jest.fn();

    it('should handle onClose action', () => {
      const { getByText } = renderQuickMarcCreateWrapper({
        instance,
        mutator,
        onClose,
      });

      fireEvent.click(getByText('stripes-acq-components.FormFooter.cancel'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('when click on save button', () => {
    it('should show on save message and redirect on load page', async () => {
      let getByText;

      await act(async () => {
        getByText = renderQuickMarcCreateWrapper({
          instance,
          mutator,
        }).getByText;
      });

      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      await waitFor(() => {
        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
      });
    });

    it('should create bib record with correct payload', async () => {
      renderQuickMarcCreateWrapper({
        instance,
        mutator,
        marcType: MARC_TYPES.BIB,
      });

      const formValues = {
        'externalId': '00000000-0000-0000-0000-000000000000',
        'leader': {
          'Record length': '00000',
          'Status': 'n',
          'Type': '\\',
          'BLvl': '\\',
          'Ctrl': '\\',
          '9-16 positions': 'a2200000',
          'ELvl': 'u',
          'Desc': 'u',
          'MultiLvl': '\\',
          '20-23 positions': '4500',
        },
        'records': [
          {
            'tag': 'LDR',
            'content': {
              'Record length': '00000',
              'Status': 'n',
              'Type': 'a',
              'BLvl': 'm',
              'Ctrl': '\\',
              '9-16 positions': 'a2200000',
              'ELvl': 'u',
              'Desc': 'u',
              'MultiLvl': '\\',
              '20-23 positions': '4500',
            },
            'id': 'LDR',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '001',
            'id': '977127cc-efdd-4aa2-b941-ba92f4606e2c',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '005',
            'id': '4b643154-0d45-4876-9afb-1e2a21d74055',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '008',
            'id': 'a15db153-9d34-4dc8-b246-31f1e1254d33',
            'content': {
              'Type': 'a',
              'BLvl': 'm',
              'DtSt': 'u',
              'Date1': '\\\\\\\\',
              'Date2': '\\\\\\\\',
              'Ctry': '\\\\\\',
              'Ills': ['p', 'o', 'm', 'l'],
              'Audn': 'j',
              'Form': 's',
              'Cont': ['6', '5', '2', 'y'],
              'GPub': 's',
              'Conf': '0',
              'Fest': '1',
              'Indx': '0',
              'LitF': 'p',
              'Biog': '\\',
              'Lang': '\\\\\\',
              'MRec': '\\',
              'Srce': '\\',
            },
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '245',
            'id': 'ad563802-dd44-4c7a-b429-79f2bd877aef',
            'indicators': ['\\', '\\'],
            'content': '$a rec2',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '999',
            'id': '7ad9a9ab-3107-4fee-acd7-19cc4249b12e',
            'indicators': ['f', 'f'],
            '_isDeleted': false,
            '_isLinked': false,
          },
        ],
        'parsedRecordDtoId': '00000000-0000-0000-0000-000000000000',
        'relatedRecordVersion': 1,
        'marcFormat': 'BIBLIOGRAPHIC',
        'suppressDiscovery': false,
        'updateInfo': {
          'recordState': 'NEW',
        },
      };

      const formValuesForCreate = {
        'externalId': '00000000-0000-0000-0000-000000000000',
        'leader': '00000nam\\a2200000uu\\4500',
        'fields': [
          {
            'tag': '008',
            'content': {
              'Type': 'a',
              'BLvl': 'm',
              'DtSt': 'u',
              'Date1': '\\\\\\\\',
              'Date2': '\\\\\\\\',
              'Ctry': '\\\\\\',
              'Ills': ['p', 'o', 'm', 'l'],
              'Audn': 'j',
              'Form': 's',
              'Cont': ['6', '5', '2', 'y'],
              'GPub': 's',
              'Conf': '0',
              'Fest': '1',
              'Indx': '0',
              'LitF': 'p',
              'Biog': '\\',
              'Lang': '\\\\\\',
              'MRec': '\\',
              'Srce': '\\',
            },
          },
          {
            'tag': '245',
            'content': '$a rec2',
            'indicators': ['\\', '\\'],
          },
        ],
        'parsedRecordDtoId': '00000000-0000-0000-0000-000000000000',
        'relatedRecordVersion': 1,
        'marcFormat': 'BIBLIOGRAPHIC',
        'suppressDiscovery': false,
        'updateInfo': {
          'recordState': 'NEW',
        },
        '_actionType': 'create',
      };

      await QuickMarcEditor.mock.calls[0][0].onSubmit(formValues);

      expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalledWith(formValuesForCreate);
    });

    it('should create authority record with correct payload and call onSave', async () => {
      const mockOnSave = jest.fn();

      const payload = {
        externalId: '00000000-0000-0000-0000-000000000000',
        externalHrid: 'in00000000022',
        leader: '00000nz\\\\a2200000o\\\\4500',
        marcFormat: MARC_TYPES.AUTHORITY.toUpperCase(),
        parsedRecordDtoId: '00000000-0000-0000-0000-000000000000',
        records: undefined,
        relatedRecordVersion: 1,
        suppressDiscovery: false,
        updateInfo: { recordState: 'NEW' },
        _actionType: 'create',
        fields: [
          {
            tag: '001',
            content: 'value1',
            indicators: undefined,
            linkDetails: undefined,
          },
          {
            tag: '008',
            content: {
              'Undef_18': '\\\\\\\\\\\\\\\\\\\\',
              'Undef_30': '\\',
              'Undef_34': '\\\\\\\\',
              'Geo Subd': '\\',
              'Roman': '\\',
              'Lang': '\\',
              'Kind rec': '\\',
              'Cat Rules': '\\',
              'SH Sys': '\\',
              'Series': '\\',
              'Numb Series': '\\',
              'Main use': '\\',
              'Subj use': '\\',
              'Series use': '\\',
              'Type Subd': '\\',
              'Govt Ag': '\\',
              'RefEval': '\\',
              'RecUpd': '\\',
              'Pers Name': '\\',
              'Level Est': '\\',
              'Mod Rec Est': '\\',
              'Source': '\\',
            },
            indicators: undefined,
            linkDetails: undefined,
          },
          {
            tag: '010',
            content: '$a value1',
            indicators: ['\\', '\\'],
            linkDetails: undefined,
          },
          {
            tag: '100',
            content: '$a value2',
            indicators: ['\\', '\\'],
            linkDetails: undefined,
          },
        ],
      };

      const { getByText } = renderQuickMarcCreateWrapper({
        instance,
        mutator,
        marcType: MARC_TYPES.AUTHORITY,
        onSave: mockOnSave,
      });

      fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      await waitFor(() => {
        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.success' });
        expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalledWith(payload);

        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    describe('when click on save button in an authority record', () => {
      it('should wait for redirection in onSubmit function', async () => {
        let isRedirectWaited = false;

        const onSave = runWithDelayedPromise(() => {
          isRedirectWaited = true;
        });

        renderQuickMarcCreateWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.AUTHORITY,
          onSave,
        });

        await QuickMarcEditor.mock.calls[0][0].onSubmit(mockFormValues(MARC_TYPES.AUTHORITY));

        expect(isRedirectWaited).toBeTruthy();
      });
    });

    describe('when click on save button in a holding record', () => {
      it('should wait for redirection in onSubmit function', async () => {
        let isRedirectWaited = false;

        const onSave = runWithDelayedPromise(() => {
          isRedirectWaited = true;
        });

        renderQuickMarcCreateWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.HOLDINGS,
          onSave,
        });

        await QuickMarcEditor.mock.calls[0][0].onSubmit(mockFormValues(MARC_TYPES.HOLDINGS));

        expect(isRedirectWaited).toBeTruthy();
      });
    });

    describe('when click on save button in a bib record', () => {
      it('should wait for links saving and redirection in onSubmit function', async () => {
        const calledFn = [];

        saveLinksToNewRecord.mockImplementationOnce(runWithDelayedPromise(() => {
          calledFn.push('saveLinksToNewRecord');
        }, 20));

        const onSave = runWithDelayedPromise(() => {
          calledFn.push('onSave');
        });

        renderQuickMarcCreateWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.BIB,
          onSave,
        });

        await QuickMarcEditor.mock.calls[0][0].onSubmit(mockFormValues(MARC_TYPES.BIB));

        expect(calledFn).toEqual(['saveLinksToNewRecord', 'onSave']);
      });
    });

    describe('when there is an error during POST request', () => {
      it('should show an error message', async () => {
        let getByText;

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
          }).getByText;
        });

        // eslint-disable-next-line prefer-promise-reject-errors
        mutator.quickMarcEditMarcRecord.POST = jest.fn(() => Promise.reject({
          json: () => Promise.resolve({}),
        }));

        await act(async () => fireEvent.click(getByText('stripes-acq-components.FormFooter.save')));

        expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalled();

        expect(mockShowCallout).toHaveBeenCalledWith({
          messageId: 'ui-quick-marc.record.save.error.generic',
          type: 'error',
        });
      });
    });

    it('should actualize links', async () => {
      await act(async () => {
        renderQuickMarcCreateWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.BIB,
        });
      });

      await act(async () => { fireEvent.click(screen.getByText('stripes-acq-components.FormFooter.save')); });

      const expectedFormValues = {
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        records: expect.arrayContaining([
          expect.objectContaining({
            tag: 'LDR',
            content: bibLeaderString,
          }),
          expect.objectContaining({
            tag: '100',
            content: '$a Ma, Wei $0 id.loc.gov/authorities/names/n84160718 $9 495884af-28d7-4d69-85e4-e84c5de693db',
            prevContent: '$a test',
            linkDetails: {
              authorityId: '495884af-28d7-4d69-85e4-e84c5de693db',
              authorityNaturalId: 'n84160718',
              linkingRuleId: 1,
              status: 'NEW',
            },
          }),
        ]),
      };

      expect(mockActualizeLinks).toHaveBeenCalledWith(expect.objectContaining(expectedFormValues));
    });

    describe('when marc type is not a bibliographic', () => {
      it('should not call actualizeLinks', async () => {
        await act(async () => {
          renderQuickMarcCreateWrapper({
            instance,
            mutator,
            marcType: MARC_TYPES.HOLDINGS,
          });
        });

        await act(async () => { fireEvent.click(screen.getByText('stripes-acq-components.FormFooter.save')); });

        expect(mockActualizeLinks).not.toHaveBeenCalled();
      });
    });
  });
});
