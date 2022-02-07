import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcEditWrapper from './QuickMarcEditWrapper';
import { QUICK_MARC_ACTIONS } from './constants';
import { MARC_TYPES } from '../common/constants';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
}));

const mockRecords = {
  [MARC_TYPES.BIB]: [
    {
      tag: 'LDR',
      content: '01178nam\\a22002773c\\4500',
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
      content: {
        Type: 'a',
        BLvl: 'm',
        ELvl: '3',
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
      content: '04706cam a2200865Ii 4500',
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
      id: '5aa1a643-b9f2-47e8-bb68-6c6457b5c9c5',
    }, {
      tag: '999',
      indicators: ['f', 'f'],
      id: '4a844042-5c7e-4e71-823e-599582a5d7ab',
    },
  ],
  [MARC_TYPES.AUTHORITY]: [
    {
      tag: 'LDR',
      content: '02949cama2200517Kii50000',
      id: 'LDR',
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
  [MARC_TYPES.BIB]: '01178nam\\a22002773c\\4500',
  [MARC_TYPES.AUTHORITY]: '02949cama2200517Kii50000',
};

const mockFormValues = jest.fn((marcType) => ({
  fields: undefined,
  externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
  leader: mockLeaders[marcType],
  parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  records: mockRecords[marcType],
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
        mutators: {},
        reset: jest.fn(),
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
  title: 'ui-quick-marc.record.edit.title',
});

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
  <MemoryRouter>
    <QuickMarcEditWrapper
      onClose={noop}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.EDIT}
      marcType={marcType}
      initialValues={{ leader: mockLeaders[marcType], records: [] }}
      instance={instance}
      location={{}}
      locations={locations}
      {...props}
    />
  </MemoryRouter>,
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
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        PUT: jest.fn(() => Promise.resolve()),
      },
      locations: {
        GET: () => Promise.resolve({}),
      },
    };
  });

  afterEach(cleanup);

  describe('when is bib marc type', () => {
    describe('when click on save button', () => {
      it('should show on save message and redirect on load page', async () => {
        let getByText;
        const mockOnClose = jest.fn();

        await act(async () => {
          getByText = renderQuickMarcEditWrapper({
            instance,
            mutator,
            location: {
              search: 'relatedRecordVersion=1',
            },
            onClose: mockOnClose,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();
        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mockOnClose).toHaveBeenCalledWith();

            resolve();
          }, 10);
        });
      }, 1000);

      describe('when there is an error during POST request', () => {
        it('should show an error message', async () => {
          let getByText;

          await act(async () => {
            getByText = renderQuickMarcEditWrapper({
              instance,
              mutator,
              location: {
                search: 'relatedRecordVersion=1',
              },
            }).getByText;
          });

          mutator.quickMarcEditMarcRecord.PUT = jest.fn(() => Promise.reject());

          await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

          await new Promise(resolve => {
            setTimeout(() => {
              expect(mockShowCallout).toHaveBeenCalledWith({
                messageId: 'ui-quick-marc.record.save.error.generic',
                type: 'error',
              });

              resolve();
            }, 100);
          });
        }, 1000);
      });
    });
  });

  describe('when is authority marc type', () => {
    describe('when click on save button', () => {
      it('should show on save message and redirect on load page', async () => {
        let getByText;
        const mockOnClose = jest.fn();

        await act(async () => {
          getByText = renderQuickMarcEditWrapper({
            instance,
            mutator,
            marcType: MARC_TYPES.AUTHORITY,
            onClose: mockOnClose,
          }).getByText;
        });

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

        expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.updated' });

        await new Promise(resolve => {
          setTimeout(() => {
            expect(mockOnClose).toHaveBeenCalledWith();

            resolve();
          }, 10);
        });
      }, 1000);

      describe('when there is an error during POST request', () => {
        it('should show an error message', async () => {
          let getByText;

          await act(async () => {
            getByText = renderQuickMarcEditWrapper({
              instance,
              mutator,
              marcType: MARC_TYPES.AUTHORITY,
            }).getByText;
          });

          mutator.quickMarcEditMarcRecord.PUT = jest.fn(() => Promise.reject());

          await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

          expect(mutator.quickMarcEditMarcRecord.PUT).toHaveBeenCalled();

          await new Promise(resolve => {
            setTimeout(() => {
              expect(mockShowCallout).toHaveBeenCalledWith({
                messageId: 'ui-quick-marc.record.save.updated.error',
                type: 'error',
                values: {
                  errorMsg: undefined,
                },
              });

              resolve();
            }, 100);
          });
        }, 1000);
      });
    });
  });
});
