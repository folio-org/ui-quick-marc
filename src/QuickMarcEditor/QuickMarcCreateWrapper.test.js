import React from 'react';
import {
  act,
  render,
  fireEvent,
  screen,
} from '@testing-library/react';
import faker from 'faker';
import noop from 'lodash/noop';

import { runAxeTest } from '@folio/stripes-testing';

import '@folio/stripes-acq-components/test/jest/__mock__';

import QuickMarcCreateWrapper from './QuickMarcCreateWrapper';
import { MARC_TYPES } from '../common/constants';
import { QUICK_MARC_ACTIONS } from './constants';

import Harness from '../../test/jest/helpers/harness';
import { useAuthorityLinking } from '../hooks';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  FormSpy: jest.fn(() => (<span>FormSpy</span>)),
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
  [MARC_TYPES.HOLDINGS]: [
    {
      tag: 'LDR',
      content: '00000nu\\\\\\2200000un\\4500',
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
      'content': '01178nam\\a2200277ic\\4500',
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
      'tag': '100',
      'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001085 $9 a84dd631-dfa4-469f-b167-24e61bc22578',
      'indicators': ['1', '\\'],
      'linkDetails': {
        'authorityId': 'a84dd631-dfa4-469f-b167-24e61bc22578',
        'authorityNaturalId': 'n2008001085',
        'linkingRuleId': 1,
        'status': 'NEW',
      },
    }, {
      'content': '$a Title',
      'tag': '245',
    },
  ],
};

const mockLeaders = {
  [MARC_TYPES.BIB]: '01178nam\\a2200277ic\\4500',
  [MARC_TYPES.HOLDINGS]: '00000nu\\\\\\2200000un\\4500',
};

const mockFormValues = jest.fn((marcType) => ({
  fields: undefined,
  externalHrid: 'in00000000022',
  externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
  leader: mockLeaders[marcType],
  marcFormat: marcType,
  parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
  parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
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
  leader: faker.random.uuid(),
  fields: [],
};

const locations = [{
  code: 'KU/CC/DI/A',
}];

const renderQuickMarcCreateWrapper = ({
  instance,
  onClose = noop,
  mutator,
  history,
  location,
  marcType = MARC_TYPES.HOLDINGS,
}) => (render(
  <Harness>
    <QuickMarcCreateWrapper
      onClose={onClose}
      instance={instance}
      mutator={mutator}
      action={QUICK_MARC_ACTIONS.CREATE}
      marcType={marcType}
      initialValues={{ leader: 'assdfgs ds sdg' }}
      history={history}
      location={location}
      locations={locations}
    />
  </Harness>,
));

describe('Given QuickMarcCreateWrapper', () => {
  let mutator;
  let instance;
  let history;
  let location;

  beforeEach(() => {
    instance = getInstance();
    mutator = {
      quickMarcEditInstance: {
        GET: () => Promise.resolve(instance),
      },
      quickMarcEditMarcRecord: {
        GET: jest.fn(() => Promise.resolve(record)),
        POST: jest.fn(() => Promise.resolve({})),
      },
      quickMarcRecordStatus: {
        GET: jest.fn(() => Promise.resolve({})),
      },
    };
    history = {
      push: jest.fn(),
    };
    location = {
      search: '?filters=source.MARC',
    };

    useAuthorityLinking.mockReturnValue({
      linkableBibFields: [],
      actualizeLinks: mockActualizeLinks,
      autoLinkingEnabled: true,
      autoLinkableBibFields: [],
      autoLinkAuthority: jest.fn(),
    });

    jest.clearAllMocks();
  });

  it('should render with no axe errors', async () => {
    const { container } = renderQuickMarcCreateWrapper({
      instance,
      mutator,
      history,
      location,
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
        history,
        onClose,
        location,
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
          history,
          location,
        }).getByText;
      });

      await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
    }, 100);

    describe('when there is an error during POST request', () => {
      it('should show an error message', async () => {
        let getByText;

        await act(async () => {
          getByText = renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
          }).getByText;
        });

        // eslint-disable-next-line prefer-promise-reject-errors
        mutator.quickMarcEditMarcRecord.POST = jest.fn(() => Promise.reject({
          json: () => Promise.resolve({}),
        }));

        await fireEvent.click(getByText('stripes-acq-components.FormFooter.save'));

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
        renderQuickMarcCreateWrapper({
          instance,
          mutator,
          history,
          location,
          marcType: MARC_TYPES.BIB,
        });
      });

      await act(async () => { fireEvent.click(screen.getByText('stripes-acq-components.FormFooter.save')); });

      const expectedFormValues = {
        leader: mockLeaders[MARC_TYPES.BIB],
        marcFormat: MARC_TYPES.BIB,
        fields: expect.arrayContaining([
          expect.objectContaining({
            tag: '100',
            content: '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001085 $9 a84dd631-dfa4-469f-b167-24e61bc22578',
            linkDetails: {
              authorityId: 'a84dd631-dfa4-469f-b167-24e61bc22578',
              authorityNaturalId: 'n2008001085',
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
        await act(async () => {
          renderQuickMarcCreateWrapper({
            instance,
            mutator,
            history,
            location,
            marcType: MARC_TYPES.HOLDINGS,
          });
        });

        await act(async () => { fireEvent.click(screen.getByText('stripes-acq-components.FormFooter.save')); });

        expect(mockActualizeLinks).not.toHaveBeenCalled();
      });
    });
  });
});
