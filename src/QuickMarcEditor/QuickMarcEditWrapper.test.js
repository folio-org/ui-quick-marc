import React from 'react';
import {
  render,
  act,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import { useAuthorityLinking } from '../hooks';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

import Harness from '../../test/jest/helpers/harness';
import { useAuthorityLinkingRules } from '../queries';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: jest.fn().mockReturnValue(({
    search: 'relatedRecordVersion=1',
  })),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useAuthorityLinkingRules: jest.fn().mockReturnValue({ linkingRules: [] }),
}));

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useAuthorityLinking: jest.fn(),
}));

const mockRecords = {
  [MARC_TYPES.BIB]: [
    {
      tag: 'LDR',
      content: '01178nam\\a2200277ic\\4500',
      id: 'LDR',
    }, {
      tag: '001',
      content: 'in00000000003',
      id: '595a98e6-8e59-448d-b866-cd039b990423',
    }, {
      tag: '004',
      content: 'in00000000022',
      id: '93213747-46fb-4861-b8e8-8774bf4a46a4',
    }, {
      tag: '008',
      content: {
        Type: 'a',
        BLvl: 'm',
        Desc: 'c',
        Entered: '211212',
        DtSt: '|',
        Date1: '2016',
        Date2: '||||',
        Ctry: '|||',
        Lang: 'mul',
        MRec: '|',
        Srce: '|',
        Ills: ['|', '|', '|', '|'],
        Audn: '|',
        Form: '\\',
        Cont: ['\\', '\\', '\\', '\\'],
        GPub: '\\',
        Conf: '\\',
        Fest: '|',
        Indx: '|',
        LitF: '|',
        Biog: '|',
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
      content: '$a Title',
      tag: '245',
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
      content: '20221228135005.0',
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c6',
    }, {
      tag: '999',
      indicators: ['f', 'f'],
      content: '$s 9585bca7-8e4c-4cbb-bab4-46c5832e7654 $i 9012727e-bffc-4298-a424-7da30d6008aa',
      id: '4a844042-5c7e-4e71-823e-599582a5d7ab',
    },
  ],
  [MARC_TYPES.AUTHORITY]: [
    {
      tag: 'LDR',
      content: '02949cama2200517Kni50000',
      id: 'LDR',
    },
    {
      tag: '001',
      content: '971255',
      isProtected: true,
    },
    {
      tag: '005',
      content: '20120323070509.0',
    },
    {
      tag: '008',
      content: {
        'Date Ent': '860211',
        'Geo Subd': 'i',
        Roman: '|',
        Lang: '\\',
        'Kind rec': 'a',
        'Cat Rules': 'n',
        'SH Sys': 'a',
        Series: 'n',
        'Numb Series': 'n',
        'Main use': 'b',
        'Subj use': 'a',
        'Series use': 'b',
        'Type Subd': 'n',
        Undef_18: '\\\\\\\\\\\\\\\\\\\\',
        'Govt Ag': '|',
        RefEval: 'b',
        Undef_30: '\\',
        RecUpd: 'a',
        'Pers Name': 'n',
        'Level Est': 'a',
        Undef_34: '\\\\\\\\',
        'Mod Rec Est': '\\',
        Source: '\\',
      },
    },
    {
      tag: '010',
      content: '$a sh 85026421 ',
      indicators: ['\\', '\\'],
    },
    {
      tag: '035',
      content: '$a (DLC)sh 85026421',
      indicators: ['\\', '\\'],
    },
    {
      tag: '035',
      content: '$a (DLC)25463',
      indicators: ['\\', '\\'],
    },
    {
      tag: '040',
      content: '$a DLC $c DLC $d DLC $d ViU',
      indicators: ['\\', '\\'],
    },
    {
      tag: '150',
      content: '$a Civil war',
      indicators: ['\\', '\\'],
    },
    {
      tag: '360',
      content: '$i individual civil wars, e.g. $a United States--History--Civil War, 1861-1865',
      indicators: ['\\', '\\'],
    },
    {
      tag: '450',
      content: '$a Civil wars',
      indicators: ['\\', '\\'],
    },
    {
      tag: '550',
      content: '$w g $a Revolutions',
      indicators: ['\\', '\\'],
    },
    {
      tag: '999',
      content: '$s 2c85c168-a821-434a-981a-7e95df2fbd84 $i 06d6033f-dd91-400d-b0db-58817d05654f',
      indicators: ['f', 'f'],
    },
  ],
};

const mockLeaders = {
  [MARC_TYPES.BIB]: '01178nam\\a2200277ic\\4500',
  [MARC_TYPES.AUTHORITY]: '02949cama2200517Kni50000',
};

const mockFormValues = jest.fn((marcType) => ({
  fields: undefined,
  externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
  marcFormat: marcType,
  leader: mockLeaders[marcType],
  parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  records: mockRecords[marcType],
  suppressDiscovery: false,
  updateInfo: { recordState: 'NEW' },
}));

const mockActualizeLinks = jest.fn((formValuesToProcess) => Promise.resolve(formValuesToProcess));

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
          addRecord: jest.fn(),
          deleteRecord: jest.fn(),
          markRecordDeleted: jest.fn(),
          markRecordLinked: jest.fn(),
          markRecordUnlinked: jest.fn(),
          moveRecord: jest.fn(),
          restoreRecord: jest.fn(),
          updateRecord: jest.fn(),
        },
        reset: jest.fn(),
        getState: jest.fn().mockReturnValue({ values: formValues }),
      }}
      marcType={marcType}
      {...props}
    />
  );
});

const mockShowCallout = jest.fn();

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(() => mockShowCallout),
}));

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
  title: 'ui-quick-marc.record.edit.title',
  _version: 1,
});

const linkingRules = {
  linkingRules: [{
    id: 1,
    bibField: '100',
    authorityField: '100',
    authoritySubfields: ['a', 'b', 't', 'd'],
    subfieldModifications: [],
    validation: {},
    autoLinkingEnabled: true,
  }],
  isLoading: false,
};

const record = {
  id: faker.random.uuid(),
  fields: [],
};

const locations = [{
  code: 'KU/CC/DI/A',
}];

const renderQuickMarcEditWrapper = ({
  instance,
  mutator,
  marcType = MARC_TYPES.BIB,
  ...props
}) => (render(
  <Harness>
    <Form
      onSubmit={jest.fn()}
      mutators={arrayMutators}
      initialValues={{
        leader: mockLeaders[marcType],
        records: mockRecords[marcType],
        relatedRecordVersion: 1,
      }}
      render={(renderProps) => (
        <QuickMarcEditWrapper
          onClose={noop}
          mutator={mutator}
          action={QUICK_MARC_ACTIONS.EDIT}
          marcType={marcType}
          instance={instance}
          location={{}}
          locations={locations}
          externalRecordPath="/some-record"
          refreshPageData={jest.fn().mockResolvedValue()}
          {...renderProps}
          {...props}
        />
      )}
    />
  </Harness>,
));

describe('Given QuickMarcEditWrapper', () => {
  let mutator;
  let instance;

  beforeEach(() => {
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
        GET: () => Promise.resolve({}),
      },
    };

    useAuthorityLinking.mockReturnValue({
      linkableBibFields: [],
      actualizeLinks: mockActualizeLinks,
      autoLinkingEnabled: true,
      autoLinkableBibFields: [],
      autoLinkAuthority: jest.fn(),
    });

    useAuthorityLinkingRules.mockReturnValue(linkingRules);

    jest.clearAllMocks();
  });

  describe('when is bib marc type', () => {
    describe('when click on "Save & keep editing" button', () => {
      it('should show on save message and stay on the edit page', async () => {
        const mockOnClose = jest.fn();

        const { getByText } = renderQuickMarcEditWrapper({
          instance,
          mutator,
          onClose: mockOnClose,
        });

        await act(async () => { fireEvent.click(getByText('ui-quick-marc.record.save.continue')); });

        expect(mutator.quickMarcEditInstance.GET).toHaveBeenCalled();
        expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    describe('when click on save button', () => {
      it('should show on save message and redirect on load page', async () => {
        const mockOnClose = jest.fn();

        const { getByText } = renderQuickMarcEditWrapper({
          instance,
          mutator,
          onClose: mockOnClose,
        });

        await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

        expect(mutator.quickMarcEditInstance.GET).toHaveBeenCalled();
        expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
        expect(mockOnClose).toHaveBeenCalled();
      });

      describe('when there is an error during POST request', () => {
        it('should show an error message', async () => {
          const { getByText } = renderQuickMarcEditWrapper({
            instance,
            mutator,
          });

          // eslint-disable-next-line prefer-promise-reject-errors
          mutator.quickMarcEditMarcRecord.PUT = jest.fn(() => Promise.reject({
            json: () => Promise.resolve({}),
          }));

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

          expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

          expect(mockShowCallout).toHaveBeenCalledWith({
            messageId: 'ui-quick-marc.record.save.error.generic',
            type: 'error',
          });
        });
      });

      describe('when there is an error during POST request due to optimistic locking', () => {
        it('should show optimistic locking banner', async () => {
          const { getByText } = renderQuickMarcEditWrapper({
            instance,
            mutator,
          });

          // eslint-disable-next-line prefer-promise-reject-errors
          mutator.quickMarcEditMarcRecord.PUT = jest.fn(() => Promise.reject({
            json: () => Promise.resolve({ message: 'optimistic locking' }),
          }));

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

          expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();
          expect(getByText('stripes-components.optimisticLocking.saveError')).toBeDefined();
        });
      });

      describe('when there is a record returned with different version', () => {
        it('should show up a conflict detection banner and not make an update request', async () => {
          mutator.quickMarcEditInstance.GET = jest.fn(() => Promise.resolve({
            ...instance,
            _version: '2',
          }));

          const { getByText } = renderQuickMarcEditWrapper({
            instance: {
              ...instance,
              _version: '1',
            },
            mutator,
          });

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

          expect(mutator.quickMarcEditInstance.GET).toHaveBeenCalled();
          expect(mutator.quickMarcEditMarcRecord.PUT).not.toHaveBeenCalled();
          expect(getByText('stripes-components.optimisticLocking.saveError')).toBeDefined();
        });
      });

      describe('when record not found (already deleted)', () => {
        it('should reveal an error message', async () => {
          mutator.quickMarcEditInstance.GET = jest.fn(() => Promise.reject(new Error('Not found')));

          const { getByText } = renderQuickMarcEditWrapper({
            instance,
            mutator,
          });

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });
          expect(mockShowCallout).toHaveBeenCalledWith({
            messageId: 'ui-quick-marc.record.save.error.notFound',
            type: 'error',
          });
        });
      });

      it('should actualize links', async () => {
        const { getByText } = renderQuickMarcEditWrapper({
          instance,
          mutator,
        });

        await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

        const expectedFormValues = {
          marcFormat: MARC_TYPES.BIB,
          records: expect.arrayContaining([
            expect.objectContaining({
              tag: 'LDR',
              content: mockRecords[MARC_TYPES.BIB][0].content,
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

      describe('when marc type is not a bibliographic', () => {
        it('should not be called actualizeLinks', async () => {
          const { getByText } = renderQuickMarcEditWrapper({
            instance,
            mutator,
            marcType: MARC_TYPES.AUTHORITY,
          });

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

          expect(mockActualizeLinks).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('when is authority marc type', () => {
    describe('and record is linked to a bib record', () => {
      describe('and changing 1XX field', () => {
        it('should display confirmation modal', async () => {
          const {
            getByTestId,
            getByText,
          } = renderQuickMarcEditWrapper({
            instance,
            mutator,
            marcType: MARC_TYPES.AUTHORITY,
            linksCount: 1,
          });

          await act(async () => { fireEvent.change(getByTestId('content-field-8'), { target: { value: '$a Civil war edited' } }); });
          await act(async () => { fireEvent.click(getByText('ui-quick-marc.record.save.continue')); });

          expect(getByText('ui-quick-marc.update-linked-bib-fields.modal.label')).toBeDefined();
        });
      });
    });

    describe('when click on "Save & keep editing" button', () => {
      it('should show on save message and stay on the edit page', async () => {
        const mockOnClose = jest.fn();

        const { getByText } = renderQuickMarcEditWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.AUTHORITY,
          onClose: mockOnClose,
        });

        await act(async () => { fireEvent.click(getByText('ui-quick-marc.record.save.continue')); });

        expect(mutator.quickMarcEditInstance.GET).toHaveBeenCalled();
        expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.updated' });
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });

    describe('when click on save button', () => {
      it('should show on save message and redirect on load page', async () => {
        const mockOnClose = jest.fn();

        const { getByText } = renderQuickMarcEditWrapper({
          instance,
          mutator,
          marcType: MARC_TYPES.AUTHORITY,
          onClose: mockOnClose,
        });

        await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

        expect(mutator.quickMarcEditInstance.GET).toHaveBeenCalled();
        expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.updated' });

        expect(mockOnClose).toHaveBeenCalled();
      });

      describe('when there is an error during POST request', () => {
        it('should show an error message', async () => {
          const { getByText } = renderQuickMarcEditWrapper({
            instance,
            mutator,
            marcType: MARC_TYPES.AUTHORITY,
          });

          // eslint-disable-next-line prefer-promise-reject-errors
          mutator.quickMarcEditMarcRecord.PUT = jest.fn(() => Promise.reject({
            json: () => Promise.resolve({}),
          }));

          await act(async () => { fireEvent.click(getByText('stripes-acq-components.FormFooter.save')); });

          expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

          expect(mockShowCallout).toHaveBeenCalledWith({
            messageId: 'ui-quick-marc.record.save.error.generic',
            type: 'error',
          });
        });
      });
    });
  });
});
