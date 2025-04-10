import { act } from 'react';
import { useParams } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import faker from 'faker';

import { checkIfUserInCentralTenant } from '@folio/stripes/core';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { QUICK_MARC_ACTIONS } from '../constants';
import { ERROR_TYPES, MARC_TYPES } from '../../common';
import { useAuthorityLinking } from '../../hooks';
import {
  useMarcRecordMutation,
  useValidate,
} from '../../queries';
import Harness from '../../../test/jest/helpers/harness';
import { useSaveRecord } from './useSaveRecord';
import fixedFieldSpecBib from '../../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../../test/mocks/fixedFieldSpecAuth';
import {
  authorityLeader,
  bibLeader,
  bibLeaderString,
  holdingsLeader,
} from '../../../test/jest/fixtures/leaders';
import {
  applyCentralTenantInHeaders,
  saveLinksToNewRecord,
} from '../utils';

const mockShowCallout = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({})),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(() => mockShowCallout),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  applyCentralTenantInHeaders: jest.fn(() => false),
  saveLinksToNewRecord: jest.fn().mockResolvedValue(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAuthorityLinking: jest.fn(),
}));

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  useMarcRecordMutation: jest.fn(),
  useLccnDuplicateConfig: jest.fn().mockReturnValue({
    isLoading: false,
    duplicateLccnCheckingEnabled: false,
  }),
  useValidate: jest.fn(),
}));

jest.mock('../getQuickMarcRecordStatus', () => {
  return jest.fn().mockResolvedValue({ externalId: 'externalId-1' });
});

const getWrapper = ({ quickMarcContext, history }) => ({ children }) => (
  <Harness
    translations={[]}
    quickMarcContext={quickMarcContext}
    history={history}
  >
    {children}
  </Harness>
);

const getMutator = (instance) => ({
  quickMarcEditMarcRecord: {
    POST: jest.fn().mockResolvedValue({}),
  },
  quickMarcRecordStatus: {
    GET: jest.fn(() => Promise.resolve({})),
  },
  quickMarcEditInstance: {
    GET: jest.fn(() => Promise.resolve(instance)),
  },
  locations: {
    GET: () => Promise.resolve({}),
  },
});
const mockRefreshPageData = jest.fn().mockResolvedValue(null);
const mockOnClose = jest.fn();
const mockOnSave = jest.fn();
const mockActualizeLinks = jest.fn((formValuesToProcess) => Promise.resolve(formValuesToProcess));
const mockUpdateMarcRecord = jest.fn().mockResolvedValue();
const mockValidateFetch = jest.fn().mockResolvedValue({});

const basePath = '/base-path';

const locations = [{
  code: 'KU/CC/DI/A',
}];

const mockSpecs = {
  [MARC_TYPES.BIB]: fixedFieldSpecBib,
  [MARC_TYPES.AUTHORITY]: fixedFieldSpecAuth,
};

const getInstance = () => ({
  id: faker.random.uuid(),
  title: 'ui-quick-marc.record.edit.title',
});

const getInitialProps = (marcType, instance) => ({
  linksCount: 0,
  locations,
  fixedFieldSpec: mockSpecs[marcType],
  mutator: getMutator(instance),
  refreshPageData: mockRefreshPageData,
  onClose: mockOnClose,
  onSave: mockOnSave,
});

const leadersMap = {
  [MARC_TYPES.BIB]: bibLeader,
  [MARC_TYPES.HOLDINGS]: holdingsLeader,
  [MARC_TYPES.AUTHORITY]: authorityLeader,
};

const recordsMap = {
  [QUICK_MARC_ACTIONS.CREATE]: () => ({
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
  }),
  [QUICK_MARC_ACTIONS.EDIT]: () => ({
    [MARC_TYPES.HOLDINGS]: [],
    [MARC_TYPES.BIB]: [
      {
        tag: 'LDR',
        content: bibLeader,
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
        'content': {
          'Type': 'a',
          'BLvl': 'm',
          'Entered': '240404',
          'DtSt': 'u',
          'Date1': '\\\\\\\\',
          'Date2': '\\\\\\\\',
          'Ctry': '\\\\\\',
          'Lang': '\\\\\\',
          'MRec': '\\',
          'Srce': '\\',
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
          'SpFm': ['\\', '\\'],
          'Relf': ['a', 'b', 'c', 'd'],
          'Proj': '\\\\',
          'CrTp': 'a',
        },
      }, {
        'tag': '035',
        'content': '$a 12883376',
        'indicators': ['\\', '\\'],
        'isProtected': false,
        _isDeleted: true,
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
        content: authorityLeader,
        id: 'LDR',
      },
      {
        id: 1,
        tag: '001',
        content: '971255',
        isProtected: true,
      },
      {
        id: 2,
        tag: '005',
        content: '20120323070509.0',
      },
      {
        id: 3,
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
        id: 4,
        tag: '010',
        content: '$a sh 85026421 ',
        indicators: ['\\', '\\'],
      },
      {
        id: 5,
        tag: '035',
        content: '$a (DLC)sh 85026421',
        indicators: ['\\', '\\'],
      },
      {
        id: 6,
        tag: '035',
        content: '$a (DLC)25463',
        indicators: ['\\', '\\'],
      },
      {
        id: 7,
        tag: '040',
        content: '$a DLC $c DLC $d DLC $d ViU',
        indicators: ['\\', '\\'],
      },
      {
        id: 8,
        tag: '150',
        content: '$a Civil war',
        indicators: ['\\', '\\'],
      },
      {
        id: 9,
        tag: '360',
        content: '$i individual civil wars, e.g. $a United States--History--Civil War, 1861-1865',
        indicators: ['\\', '\\'],
      },
      {
        id: 10,
        tag: '450',
        content: '$a Civil wars',
        indicators: ['\\', '\\'],
      },
      {
        id: 11,
        tag: '550',
        content: '$w g $a Revolutions',
        indicators: ['\\', '\\'],
      },
      {
        id: 12,
        tag: '999',
        content: '$s 2c85c168-a821-434a-981a-7e95df2fbd84 $i 06d6033f-dd91-400d-b0db-58817d05654f',
        indicators: ['f', 'f'],
      },
    ],
  }),
  [QUICK_MARC_ACTIONS.DERIVE]: () => ({
    [MARC_TYPES.BIB]: [
      {
        tag: 'LDR',
        content: bibLeader,
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
          Date2: '\\\\\\\\',
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
  }),
};

const getIdsOfFields = (action, marcType) => {
  return recordsMap[action]()[marcType]
    .slice(1)
    .filter(field => !field._isDeleted)
    .map(field => field.id);
};

const getInitialValues = (action, marcType) => {
  const initialValuesMap = {
    [QUICK_MARC_ACTIONS.CREATE]: () => ({}),
    [QUICK_MARC_ACTIONS.EDIT]: () => ({
      leader: leadersMap[marcType],
      records: recordsMap[action]()[marcType],
      relatedRecordVersion: 1,
    }),
    [QUICK_MARC_ACTIONS.DERIVE]: () => ({
      leader: bibLeader,
      records: [
        {
          tag: 'LDR',
          content: bibLeader,
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
    }),
  };

  return initialValuesMap[action]();
};

const getFormValues = (action, marcType) => {
  const formValuesMap = {
    [QUICK_MARC_ACTIONS.CREATE]: () => ({
      externalHrid: 'in00000000022',
      externalId: '00000000-0000-0000-0000-000000000000',
      leader: leadersMap[marcType],
      marcFormat: marcType.toUpperCase(),
      parsedRecordDtoId: '00000000-0000-0000-0000-000000000000',
      records: recordsMap[action]()[marcType],
      relatedRecordVersion: 1,
      suppressDiscovery: false,
      updateInfo: { recordState: 'NEW' },
    }),
    [QUICK_MARC_ACTIONS.EDIT]: () => ({
      externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
      marcFormat: marcType.toUpperCase(),
      leader: leadersMap[marcType],
      parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
      parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
      records: recordsMap[action]()[marcType],
      suppressDiscovery: false,
      updateInfo: { recordState: 'NEW' },
    }),
    [QUICK_MARC_ACTIONS.DERIVE]: () => ({
      externalId: '17064f9d-0362-468d-8317-5984b7efd1b5',
      leader: bibLeader,
      parsedRecordDtoId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
      parsedRecordId: '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
      marcFormat: MARC_TYPES.BIB.toUpperCase(),
      records: recordsMap[action]()[marcType],
      suppressDiscovery: false,
      updateInfo: { recordState: 'NEW' },
    }),
  };

  return formValuesMap[action]();
};

const linkingRules = [{
  id: 1,
  bibField: '100',
  authorityField: '100',
  authoritySubfields: ['a', 'b', 't', 'd'],
  subfieldModifications: [],
  validation: {},
  autoLinkingEnabled: true,
}];

describe('useSaveRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    checkIfUserInCentralTenant.mockClear().mockReturnValue(false);

    useAuthorityLinking.mockReturnValue({
      linkableBibFields: [],
      actualizeLinks: mockActualizeLinks,
      autoLinkingEnabled: true,
      autoLinkableBibFields: [],
      autoLinkAuthority: jest.fn(),
      linkingRules,
      sourceFiles: [],
    });

    useMarcRecordMutation.mockReturnValue({
      updateMarcRecord: mockUpdateMarcRecord,
      isLoading: false,
    });

    useValidate.mockReturnValue({
      validate: mockValidateFetch,
    });

    applyCentralTenantInHeaders.mockReturnValue(false);
    useParams.mockReturnValue({});
  });

  describe('when creating', () => {
    describe('when marc type is not a bib', () => {
      it('should not call actualizeLinks', async () => {
        const marcType = MARC_TYPES.HOLDINGS;
        const action = QUICK_MARC_ACTIONS.CREATE;

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        expect(mockActualizeLinks).not.toHaveBeenCalled();
      });
    });

    it('should actualize links', async () => {
      const marcType = MARC_TYPES.BIB;

      const { result } = renderHook(useSaveRecord, {
        initialProps: getInitialProps(marcType),
        wrapper: getWrapper({
          quickMarcContext: {
            action: QUICK_MARC_ACTIONS.CREATE,
            marcType,
          },
        }),
      });

      await result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.CREATE, marcType));

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

    describe('when there is a linked field', () => {
      it('should call the saveLinksToNewRecord', async () => {
        const marcType = MARC_TYPES.BIB;
        const mutator = getMutator();

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator,
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action: QUICK_MARC_ACTIONS.CREATE,
              marcType,
            },
          }),
        });

        await result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.CREATE, marcType));

        expect(saveLinksToNewRecord).toHaveBeenCalledWith(
          mutator,
          'externalId-1',
          expect.objectContaining({ _actionType: 'create' }),
        );
      });
    });

    it('should create bib record with correct payload', async () => {
      const marcType = MARC_TYPES.BIB;
      const mutator = getMutator();

      const { result } = renderHook(useSaveRecord, {
        initialProps: {
          ...getInitialProps(marcType),
          mutator,
        },
        wrapper: getWrapper({
          quickMarcContext: {
            action: QUICK_MARC_ACTIONS.CREATE,
            marcType,
          },
        }),
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

      await result.current.onSubmit(formValues);

      expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalledWith(formValuesForCreate);
    });

    it('should create authority record with correct payload and call onSave', async () => {
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

      const marcType = MARC_TYPES.AUTHORITY;
      const mutator = getMutator();

      const { result } = renderHook(useSaveRecord, {
        initialProps: {
          ...getInitialProps(marcType),
          mutator,
        },
        wrapper: getWrapper({
          quickMarcContext: {
            action: QUICK_MARC_ACTIONS.CREATE,
            marcType,
          },
        }),
      });

      await result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.CREATE, marcType));

      expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalledWith(payload);
      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.save.success.processing' });
      expect(mockShowCallout).toHaveBeenCalledWith({ messageId: 'ui-quick-marc.record.saveNew.success' });
      expect(mockOnSave).toHaveBeenCalled();
    });

    describe('when hitting save&continue', () => {
      it('should call refreshPageData', async () => {
        const action = QUICK_MARC_ACTIONS.CREATE;
        const marcType = MARC_TYPES.BIB;
        const history = createMemoryHistory({
          initialEntries: [`${basePath}?sort=title`],
        });

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: true },
            },
            history,
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        const fieldIds = getIdsOfFields(action, marcType);

        expect(mockRefreshPageData).toHaveBeenCalledWith(fieldIds, QUICK_MARC_ACTIONS.EDIT, 'externalId-1');
      });

      it('should redirect to the edit page', async () => {
        const action = QUICK_MARC_ACTIONS.CREATE;
        const marcType = MARC_TYPES.BIB;
        const history = createMemoryHistory({
          initialEntries: [`${basePath}?sort=title`],
        });

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: true },
            },
            history,
          }),
        });

        await act(async () => result.current.onSubmit(getFormValues(action, marcType)));

        expect(history.location.pathname).toBe(`${basePath}/edit-bibliographic/externalId-1`);
        expect(history.location.search).toBe('?sort=title');
      });
    });

    describe('when a user is in a central tenant', () => {
      beforeEach(() => {
        checkIfUserInCentralTenant.mockClear().mockReturnValue(true);
      });

      it('should add "shared=true" parameter to the url', async () => {
        const action = QUICK_MARC_ACTIONS.CREATE;
        const marcType = MARC_TYPES.BIB;
        const history = createMemoryHistory({
          initialEntries: [`${basePath}?sort=title`],
        });

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: true },
            },
            history,
          }),
        });

        await act(async () => result.current.onSubmit(getFormValues(action, marcType)));

        expect(history.location.pathname).toBe(`${basePath}/edit-bibliographic/externalId-1`);
        expect(history.location.search).toBe('?sort=title&shared=true');
      });
    });

    describe('when hitting save&close', () => {
      it('should call onSave with `externalId`', async () => {
        const marcType = MARC_TYPES.BIB;

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action: QUICK_MARC_ACTIONS.CREATE,
              marcType,
              continueAfterSave: { current: false },
            },
          }),
        });

        await result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.CREATE, marcType));

        expect(mockOnSave).toHaveBeenCalledWith('externalId-1');
      });
    });
  });

  describe('when editing', () => {
    describe('when marc type is not a bib', () => {
      it('should not call actualizeLinks', async () => {
        const marcType = MARC_TYPES.AUTHORITY;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        expect(mockActualizeLinks).not.toHaveBeenCalled();
      });
    });

    it('should actualize links', async () => {
      const marcType = MARC_TYPES.BIB;
      const action = QUICK_MARC_ACTIONS.EDIT;

      const { result } = renderHook(useSaveRecord, {
        initialProps: {
          ...getInitialProps(marcType),
          mutator: getMutator(getInstance()),
        },
        wrapper: getWrapper({
          quickMarcContext: {
            action,
            marcType,
            initialValues: getInitialValues(action, marcType),
            instance: getInstance(),
          },
        }),
      });

      result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.EDIT, marcType));

      const expectedFormValues = {
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        records: expect.arrayContaining([
          expect.objectContaining({
            tag: 'LDR',
            content: bibLeaderString,
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

    it('should edit record with correct payload', async () => {
      const marcType = MARC_TYPES.BIB;
      const action = QUICK_MARC_ACTIONS.EDIT;

      const { result } = renderHook(useSaveRecord, {
        initialProps: {
          ...getInitialProps(marcType),
          mutator: getMutator(getInstance()),
        },
        wrapper: getWrapper({
          quickMarcContext: {
            action,
            marcType,
            initialValues: getInitialValues(action, marcType),
            instance: getInstance(),
          },
        }),
      });

      const formValuesForEdit = {
        '_actionType': 'edit',
        'externalId': '17064f9d-0362-468d-8317-5984b7efd1b5',
        'fields': [
          {
            'content': 'in00000000003',
            'indicators': undefined,
            'linkDetails': undefined,
            'tag': '001',
          },
          {
            'content': 'in00000000022',
            'indicators': undefined,
            'linkDetails': undefined,
            'tag': '004',
          },
          {
            'content': {
              'Audn': 'j',
              'BLvl': 'm',
              'Biog': '\\',
              'Conf': '0',
              'Cont': ['6', '5', '2', 'y'],
              'CrTp': 'a',
              'Ctry': '\\\\\\',
              'Date1': '\\\\\\\\',
              'Date2': '\\\\\\\\',
              'DtSt': 'u',
              'Entered': '240404',
              'Fest': '1',
              'Form': 's',
              'GPub': 's',
              'Ills': ['p', 'o', 'm', 'l'],
              'Indx': '0',
              'Lang': '\\\\\\',
              'LitF': 'p',
              'MRec': '\\',
              'Proj': '\\\\',
              'Srce': '\\',
              'Type': 'a',
            },
            'indicators': undefined,
            'linkDetails': undefined,
            'tag': '008',
          },
          {
            'content': '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 4808f6ae-8379-41e9-a795-915ac4751668',
            'indicators': [
              '1',
              '\\',
            ],
            'linkDetails': {
              'authorityId': '4808f6ae-8379-41e9-a795-915ac4751668',
              'authorityNaturalId': 'n2008001084',
              'linkingRuleId': 1,
              'status': 'ACTUAL',
            },
            'tag': '100',
          },
          {
            'content': '$a Ma, Wei $0 id.loc.gov/authorities/names/n84160718 $9 495884af-28d7-4d69-85e4-e84c5de693db',
            'indicators': [
              '\\',
              '\\',
            ],
            'linkDetails': {
              'authorityId': '495884af-28d7-4d69-85e4-e84c5de693db',
              'authorityNaturalId': 'n84160718',
              'linkingRuleId': 1,
              'status': 'NEW',
            },
            'tag': '100',
          },
          {
            'content': '$a Title',
            'indicators': undefined,
            'linkDetails': undefined,
            'tag': '245',
          },
          {
            'content': '$b KU/CC/DI/A $t 3 $h M3 $i .M93 1955 $m + $x Rec\'d in Music Lib ;',
            'indicators': [
              '0',
              '1',
            ],
            'linkDetails': undefined,
            'tag': '852',
          },
          {
            'content': '$a ABS3966CU004',
            'indicators': [
              '1',
              '\\',
            ],
            'linkDetails': undefined,
            'tag': '014',
          },
          {
            'content': '20221228135005.0',
            'indicators': undefined,
            'linkDetails': undefined,
            'tag': '005',
          },
          {
            'content': '$s 9585bca7-8e4c-4cbb-bab4-46c5832e7654 $i 9012727e-bffc-4298-a424-7da30d6008aa',
            'indicators': [
              'f',
              'f',
            ],
            'linkDetails': undefined,
            'tag': '999',
          },
        ],
        'leader': '00000nam\\a2200000uu\\4500',
        'marcFormat': 'BIBLIOGRAPHIC',
        'parsedRecordDtoId': '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
        'parsedRecordId': '1bf159d9-4da8-4c3f-9aac-c83e68356bbf',
        'records': undefined,
        'suppressDiscovery': false,
        'updateInfo': {
          'recordState': 'NEW',
        },
      };

      await result.current.onSubmit(getFormValues(action, marcType));

      expect(mockUpdateMarcRecord).toHaveBeenCalledWith(formValuesForEdit);
    });

    describe('and there is a linked field', () => {
      it('should run backend validation with the content from all split fields', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
            },
          }),
        });

        const field240 = {
          'tag': '240',
          'content': '$a a $0 http://id.loc.gov/authorities/names/n2016004081 $9 58e3deb0-d1c9-4e22-918d-a393f627e18c',
          'indicators': ['\\', '\\'],
          'isProtected': false,
          'linkDetails': {
            'authorityId': '58e3deb0-d1c9-4e22-918d-a393f627e18c',
            'authorityNaturalId': 'n2016004081',
            'linkingRuleId': 5,
            'status': 'ACTUAL',
          },
          'id': '5cc17747-0b0a-44f6-807e-fd28138bbcaa',
          '_isDeleted': false,
          '_isLinked': true,
          'subfieldGroups': {
            'controlled': '$a a',
            'uncontrolledAlpha': '$3 test',
            'zeroSubfield': '$0 http://id.loc.gov/authorities/names/n2016004081',
            'nineSubfield': '$9 58e3deb0-d1c9-4e22-918d-a393f627e18c',
            'uncontrolledNumber': '',
          },
        };

        const formValues = getFormValues(action, marcType);

        const newFormValues = {
          ...formValues,
          records: [
            field240,
            ...formValues.records,
          ],
        };

        await result.current.runValidation(newFormValues);

        expect(mockValidateFetch).toHaveBeenCalledWith(expect.objectContaining({
          body: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                tag: '240',
                content: '$a a $3 test $0 http://id.loc.gov/authorities/names/n2016004081 $9 58e3deb0-d1c9-4e22-918d-a393f627e18c',
                indicators: ['\\', '\\'],
              }),
            ]),
          }),
        }));
      });
    });

    describe('when there is a record returned with different version', () => {
      it('should return the optimistic locking error', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator({
              ...getInstance(),
              _version: '2',
            }),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: {
                ...getInstance(),
                _version: '1',
              },
            },
          }),
        });

        await act(async () => result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.EDIT, marcType)));

        expect(result.current.httpError).toEqual({
          errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
          message: 'ui-quick-marc.record.save.error.derive',
        });
        expect(mockUpdateMarcRecord).not.toHaveBeenCalled();
      });
    });

    describe('when there is an error during PUT request due to optimistic locking', () => {
      it('should return the error', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
            },
          }),
        });

        mockUpdateMarcRecord.mockRejectedValueOnce({
          json: jest.fn().mockResolvedValue({ message: 'optimistic locking' }),
        });

        await act(async () => result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.EDIT, marcType)));

        expect(mockUpdateMarcRecord).toHaveBeenCalled();

        expect(result.current.httpError).toEqual({
          errorType: ERROR_TYPES.OPTIMISTIC_LOCKING,
          message: 'optimistic locking',
        });
      });
    });

    describe('when record not found (already deleted)', () => {
      it('should return the error', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: {
              ...getMutator(getInstance()),
              quickMarcEditInstance: { GET: jest.fn().mockRejectedValue({ httpStatus: 404 }) },
            },
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
            },
          }),
        });

        await act(async () => result.current.onSubmit(getFormValues(QUICK_MARC_ACTIONS.EDIT, marcType)));

        expect(result.current.httpError).toEqual({
          errorType: 'other',
          httpStatus: 404,
        });
      });
    });

    describe('when a member tenant edits a shared record', () => {
      it('should apply the central tenant id for all authority linking ', async () => {
        applyCentralTenantInHeaders.mockReturnValue(true);

        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
            },
          }),
        });

        expect(useAuthorityLinking).toHaveBeenCalledWith({
          marcType: MARC_TYPES.BIB,
          action: QUICK_MARC_ACTIONS.EDIT,
        });
        expect(useMarcRecordMutation).toHaveBeenCalledWith({ tenantId: 'consortia' });
      });
    });

    describe('when hitting save&continue', () => {
      it('should call refreshPageData', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
              continueAfterSave: { current: true },
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        const fieldIds = getIdsOfFields(action, marcType);

        expect(mockRefreshPageData).toHaveBeenCalledWith(fieldIds);
      });
    });

    describe('when hitting save&close', () => {
      it('should call onSave with `externalId`', async () => {
        const marcType = MARC_TYPES.BIB;
        const action = QUICK_MARC_ACTIONS.EDIT;

        useParams.mockReturnValue({
          externalId: 'externalId-url',
        });

        const { result } = renderHook(useSaveRecord, {
          initialProps: {
            ...getInitialProps(marcType),
            mutator: getMutator(getInstance()),
          },
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              initialValues: getInitialValues(action, marcType),
              instance: getInstance(),
              continueAfterSave: { current: false },
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        expect(mockRefreshPageData).not.toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalledWith('externalId-url');
      });
    });
  });

  describe('when deriving', () => {
    it('should actualize links', async () => {
      const action = QUICK_MARC_ACTIONS.DERIVE;
      const marcType = MARC_TYPES.BIB;

      const { result } = renderHook(useSaveRecord, {
        initialProps: getInitialProps(marcType),
        wrapper: getWrapper({
          quickMarcContext: {
            action,
            marcType,
          },
        }),
      });

      await result.current.onSubmit(getFormValues(action, marcType));

      const expectedFormValues = {
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        records: expect.arrayContaining([
          expect.objectContaining({
            tag: 'LDR',
            content: bibLeaderString,
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

    it('should derive record with correct payload', async () => {
      const action = QUICK_MARC_ACTIONS.DERIVE;
      const marcType = MARC_TYPES.BIB;
      const mutator = getMutator();

      const { result } = renderHook(useSaveRecord, {
        initialProps: {
          ...getInitialProps(marcType),
          mutator,
        },
        wrapper: getWrapper({
          quickMarcContext: {
            action,
            marcType,
          },
        }),
      });

      const formValues = {
        '_actionType': 'view',
        'leader': {
          'Record length': '00246',
          'Status': 'n',
          'Type': 'a',
          'BLvl': 'm',
          'Ctrl': '\\',
          '9-16 positions': 'a2200085',
          'ELvl': 'u',
          'Desc': 'u',
          'MultiLvl': '\\',
          '20-23 positions': '4500',
        },
        'suppressDiscovery': false,
        'marcFormat': 'BIBLIOGRAPHIC',
        'parsedRecordId': '2b56625f-1ca0-4ada-a32d-2667be1bd509',
        'parsedRecordDtoId': '2b56625f-1ca0-4ada-a32d-2667be1bd509',
        'externalId': 'e72f49c9-9bbf-4d2b-89eb-3d2ee5878530',
        'externalHrid': 'in00000000035',
        'updateInfo': {
          'recordState': 'NEW',
        },
        'records': [
          {
            'tag': 'LDR',
            'content': {
              'Record length': '00246',
              'Status': 'n',
              'Type': 'e',
              'BLvl': 'm',
              'Ctrl': '\\',
              '9-16 positions': 'a2200085',
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
            'content': '',
            'isProtected': true,
            'id': 'dea3aafd-9367-4592-9996-606592ea4947',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '005',
            'content': '',
            'isProtected': false,
            'id': 'c392e6ca-29cc-4511-9afe-79f9d6472ea9',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '008',
            'content': {
              'Type': 'a',
              'BLvl': 'm',
              'DtSt': 'u',
              'Date1': '\\\\\\\\',
              'Date2': '\\\\\\\\',
              'Ctry': '\\\\\\',
              'Lang': '\\\\\\',
              'MRec': '\\',
              'Srce': '\\',
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
              'SpFm': ['\\', '\\'],
              'Relf': ['a', 'b', 'c', 'd'],
              'Proj': '\\\\',
              'CrTp': 'a',
            },
            'isProtected': false,
            'id': 'c52b10e1-074e-4728-bd6a-440be762aed2',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '245',
            'content': '$a rec3',
            'indicators': ['\\', '\\'],
            'isProtected': false,
            'id': '6d7001a2-ba49-42e9-a7a1-b5597c9b6449',
            '_isDeleted': false,
            '_isLinked': false,
          },
          {
            'tag': '999',
            'content': '',
            'indicators': ['f', 'f'],
            'isProtected': true,
            'id': '61b93d22-6857-4e68-bfeb-240ed4956318',
            '_isDeleted': false,
            '_isLinked': false,
          },
        ],
      };
      const formValuesForDerive = {
        '_actionType': 'create',
        'leader': '00246nem\\a2200085uu\\4500',
        'fields': [
          {
            'tag': '008',
            'content': {
              'Type': 'e',
              'BLvl': 'm',
              'DtSt': 'u',
              'Date1': '\\\\\\\\',
              'Date2': '\\\\\\\\',
              'Ctry': '\\\\\\',
              'Lang': '\\\\\\',
              'MRec': '\\',
              'Srce': '\\',
              'Audn': 'j',
              'Form': 's',
              'GPub': 's',
              'Conf': '0',
              'Fest': '1',
              'Indx': '0',
              'LitF': 'p',
              'Biog': '\\',
              'SpFm': ['\\', '\\'],
              'Relf': ['a', 'b', 'c', 'd'],
              'Proj': '\\\\',
              'CrTp': 'a',
            },
          },
          {
            'tag': '245',
            'content': '$a rec3',
            'indicators': ['\\', '\\'],
          },
        ],
        'suppressDiscovery': false,
        'marcFormat': 'BIBLIOGRAPHIC',
        'parsedRecordId': '2b56625f-1ca0-4ada-a32d-2667be1bd509',
        'parsedRecordDtoId': '2b56625f-1ca0-4ada-a32d-2667be1bd509',
        'externalId': 'e72f49c9-9bbf-4d2b-89eb-3d2ee5878530',
        'externalHrid': 'in00000000035',
        'relatedRecordVersion': 1,
      };

      await result.current.onSubmit(formValues);

      expect(mutator.quickMarcEditMarcRecord.POST).toHaveBeenCalledWith(formValuesForDerive);
    });

    describe('when hitting save&close', () => {
      it('should call onClose with `id` string and externalId', async () => {
        const action = QUICK_MARC_ACTIONS.DERIVE;
        const marcType = MARC_TYPES.BIB;

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: false },
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        expect(mockOnClose).toHaveBeenCalledWith('id');
        expect(mockOnClose).toHaveBeenCalledWith('externalId-1');
      });
    });

    describe('when hitting save&continue', () => {
      it('should call refreshPageData', async () => {
        const action = QUICK_MARC_ACTIONS.DERIVE;
        const marcType = MARC_TYPES.BIB;

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: true },
            },
          }),
        });

        await result.current.onSubmit(getFormValues(action, marcType));

        const fieldIds = getIdsOfFields(action, marcType);

        expect(mockRefreshPageData).toHaveBeenCalledWith(fieldIds, QUICK_MARC_ACTIONS.EDIT, 'externalId-1');
      });

      it('should redirect to the edit page', async () => {
        const action = QUICK_MARC_ACTIONS.DERIVE;
        const marcType = MARC_TYPES.BIB;
        const history = createMemoryHistory({
          initialEntries: [`${basePath}?sort=title`],
        });

        const { result } = renderHook(useSaveRecord, {
          initialProps: getInitialProps(marcType),
          wrapper: getWrapper({
            quickMarcContext: {
              action,
              marcType,
              continueAfterSave: { current: true },
            },
            history,
          }),
        });

        await act(async () => result.current.onSubmit(getFormValues(action, marcType)));

        expect(history.location.pathname).toBe(`${basePath}/edit-bibliographic/externalId-1`);
        expect(history.location.search).toBe('?sort=title');
      });
    });
  });
});
