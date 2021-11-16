/* eslint-disable max-lines */
import faker from 'faker';

import uuid from 'uuid';
import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
  CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
} from './constants';
import { MARC_TYPES } from '../common/constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import * as utils from './utils';

jest.mock('uuid', () => {
  return () => 'uuid';
});

describe('QuickMarcEditor utils', () => {
  describe('dehydrateMarcRecordResponse', () => {
    it('should return dehydrated marc record', () => {
      const marcRecord = {
        id: faker.random.uuid(),
        leader: faker.random.uuid(),
        fields: [
          {
            tag: '001',
            content: '$a fss $b asd',
          },
        ],
      };
      const dehydratedMarcRecord = utils.dehydrateMarcRecordResponse(marcRecord);

      expect(dehydratedMarcRecord.fields).not.toBeDefined();

      expect(dehydratedMarcRecord.records[0].tag).toBe(LEADER_TAG);
      expect(dehydratedMarcRecord.records[0].id).toBe(LEADER_TAG);
      expect(dehydratedMarcRecord.records[0].content).toBe(marcRecord.leader);

      expect(dehydratedMarcRecord.records[1].id).toBe('uuid');
    });
  });

  describe('hydrateMarcRecord', () => {
    it('should return hydrated marc record from form', () => {
      const marcRecord = {
        records: [
          {
            content: '05addsdg asd hds a',
          },
          {
            id: '1',
            tag: '001',
            content: '$a fss $b asd',
          },
        ],
      };
      const hydratedMarcRecord = utils.hydrateMarcRecord(marcRecord);

      expect(hydratedMarcRecord.records).not.toBeDefined();

      expect(hydratedMarcRecord.leader).toBe(marcRecord.records[0].content);

      expect(hydratedMarcRecord.fields).toBeDefined();
      expect(hydratedMarcRecord.fields.length).toBe(marcRecord.records.length - 1);
      expect(hydratedMarcRecord.fields[0].id).not.toBeDefined();
    });
  });

  describe('addNewRecord', () => {
    it('should return records with new row', () => {
      const state = {
        formState: {
          values: {
            records: [
              {
                tag: '010',
                content: '$a fss $b asd',
              },
              {
                tag: '011',
                content: '$a fss $b asd',
              },
              {
                tag: '012',
                content: '$a fss $b asd',
              },
            ],
          },
        },
      };
      const insertIndex = 1;
      const newRecords = utils.addNewRecord(insertIndex, state);

      expect(newRecords.length).toBe(state.formState.values.records.length + 1);
    });
  });

  describe('restoreRecordAtIndex', () => {
    it('should return records with new row', () => {
      const state = {
        formState: {
          values: {
            records: [
              {
                tag: '010',
                content: '$a fss $b asd',
              },
              {
                tag: '011',
                content: '$a fss $b asd',
              },
              {
                tag: '012',
                content: '$a fss $b asd',
              },
            ],
          },
        },
      };

      const insertIndex = 1;
      const insertedRecord = {
        tag: '013',
        content: '$a fss $b asd',
      };
      const newRecords = utils.restoreRecordAtIndex(insertIndex, insertedRecord, state);

      expect(newRecords[1]).toBe(insertedRecord);
    });
  });

  describe('validateLeader', () => {
    it('should not return error message when leader is valid', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706cam a2200865Ii 4500'),
      ).not.toBeDefined();

      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706dam a2200865nfa4500'),
      ).not.toBeDefined();
    });

    it('should return length error message when leader is not 24 length', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706dam a2200865nfa45').props.id,
      ).toBe('ui-quick-marc.record.error.leader.length');

      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706dam a2200865nfa45gf sdg s').props.id,
      ).toBe('ui-quick-marc.record.error.leader.length');
    });

    it('should return edit error message when forbidden bytes are edited', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706cam a2200865Ii 4501').props.id,
      ).toBe('ui-quick-marc.record.error.leader.forbiddenBytes.bib');

      expect(
        utils.validateLeader('14706cam a2200865Ii 4500', '04706cam a2200865Ii 4500').props.id,
      ).toBe('ui-quick-marc.record.error.leader.forbiddenBytes.bib');
    });

    describe('when marcType is bib', () => {
      it('should return edit error message when unsupported bytes are found', () => {
        expect(
          utils.validateLeader('00194cx  a22000851  4500', '00194ox  a22000851  4500').props.id,
        ).toBe('ui-quick-marc.record.error.bib.leader.invalid005PositionValue');
      });
    });

    describe('when marcType is holdings', () => {
      it('should return edit error message when unsupported bytes are found', () => {
        expect(
          utils.validateLeader('00194cx  a22000851  4500', '00194ax  a22000851  4500', 'holdings').props.id,
        ).toBe('ui-quick-marc.record.error.leader.invalidPositionValue');

        expect(
          utils.validateLeader('00194cx  a22000851  4500', '00194cb  a22000851  4500', 'holdings').props.id,
        ).toBe('ui-quick-marc.record.error.leader.invalidPositionValue');

        expect(
          utils.validateLeader('00194cx  a22000851  4500', '00194cx  a22000856  4500', 'holdings').props.id,
        ).toBe('ui-quick-marc.record.error.leader.invalidPositionValue');
      });
    });
  });

  describe('validateMarcRecord', () => {
    it('should not return error message when record is valid', () => {
      const initialValues = { records: [] };
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              ELvl: 'I',
              Desc: 'i',
            },
          },
          {
            tag: '245',
          },
        ],
      };

      expect(utils.validateMarcRecord(record, initialValues)).not.toBeDefined();
    });

    it('should return error message when record is invalid', () => {
      const initialValues = { records: [] };
      const record = {
        leader: '14706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
        ],
      };

      expect(utils.validateMarcRecord(record, initialValues)).toBeDefined();
    });

    it('should return error message when record is without 245 row', () => {
      const initialValues = { records: [] };
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              ELvl: 'I',
              Desc: 'i',
            },
          },
        ],
      };

      expect(utils.validateMarcRecord(record, initialValues).props.id).toBe('ui-quick-marc.record.error.title.empty');
    });

    it('should return error message when record has several 245 rows', () => {
      const initialValues = { records: [] };
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              ELvl: 'I',
              Desc: 'i',
            },
          },
          {
            tag: '245',
          },
          {
            tag: '245',
          },
        ],
      };

      expect(utils.validateMarcRecord(record, initialValues).props.id).toBe('ui-quick-marc.record.error.title.multiple');
    });

    describe('when record is MARC Holdings record', () => {
      it('should not return error message when record is valid', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            {
              tag: '852',
            },
          ],
        };

        expect(utils.validateMarcRecord(record, initialValues, MARC_TYPES.HOLDINGS)).not.toBeDefined();
      });

      it('should return error message when record is without 852 row', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
          ],
        };

        expect(utils.validateMarcRecord(record, initialValues, MARC_TYPES.HOLDINGS).props.id).toBe('ui-quick-marc.record.error.location.empty');
      });

      it('should return error message when record has several 004 rows', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            { tag: '004' },
            { tag: '004' },
          ],
        };

        expect(utils.validateMarcRecord(record, initialValues, MARC_TYPES.HOLDINGS).props.id).toBe('ui-quick-marc.record.error.instanceHrid.multiple');
      });
    });

    it('should return error message when record has several 852 rows', () => {
      const initialValues = { records: [] };
      const record = {
        leader: '04706cxm a22008651i 4500',
        records: [
          {
            content: '04706cxm a22008651i 4500',
            tag: 'LDR',
          },
          { tag: '852' },
          { tag: '852' },
        ],
      };

      expect(utils.validateMarcRecord(record, initialValues, MARC_TYPES.HOLDINGS).props.id).toBe('ui-quick-marc.record.error.location.multiple');
    });
  });

  describe('validateRecordMismatch', () => {
    it('should return error message when 008 Elvl is not matched with leader Elvl', () => {
      const records = [
        {
          content: '04706cam a2200865Ii 4500',
          tag: '245',
        },
        {
          tag: '008',
          content: {
            ELvl: 'A',
            Desc: 'i',
          },
        },
      ];

      expect(utils.validateRecordMismatch(records).props.id).toBe('ui-quick-marc.record.error.leader.fixedFieldMismatch');
    });

    it('should return error message when 008 Desc is not matched with leader Desc', () => {
      const records = [
        {
          content: '04706cam a2200865Ii 4500',
          tag: '245',
        },
        {
          tag: '008',
          content: {
            ELvl: 'I',
            Desc: 'M',
          },
        },
      ];

      expect(utils.validateRecordMismatch(records).props.id).toBe('ui-quick-marc.record.error.leader.fixedFieldMismatch');
    });

    it('should return error message when tag is not valid', () => {
      const records = [
        {
          content: '04706cam a2200865Ii 4500',
          tag: '245',
        },
        {
          tag: '008',
          content: {
            ELvl: 'I',
            Desc: 'i',
          },
        },
      ];

      expect(utils.validateRecordMismatch(records)).not.toBeDefined();
    });
  });

  describe('validateRecordTag', () => {
    it('should not return error message when tag is valid', () => {
      const records = [
        {
          tag: '010',
        },
        {
          tag: '245',
        },
      ];

      expect(utils.validateRecordTag(records)).not.toBeDefined();
    });

    it('should return error message when tag is not valid (invalid length)', () => {
      const records = [
        {
          tag: '10',
        },
        {
          tag: '245',
        },
      ];

      expect(utils.validateRecordTag(records).props.id).toBe('ui-quick-marc.record.error.tag.length');
    });

    it('should return error message when tag is not valid (non-digit characters)', () => {
      const records = [
        {
          tag: '01a',
        },
        {
          tag: '245',
        },
      ];

      expect(utils.validateRecordTag(records).props.id).toBe('ui-quick-marc.record.error.tag.nonDigits');
    });
  });

  describe('checkIsInitialRecord', () => {
    it('should return true if this record row is initial', () => {
      const initialRecords = [
        {
          id: 'id1',
        },
        {
          id: 'id2',
        },
      ];

      const recordId = 'id2';

      expect(utils.checkIsInitialRecord(initialRecords, recordId)).toBeTruthy();
    });

    it('should return false if this record row is not initial', () => {
      const initialRecords = [
        {
          id: 'id1',
        },
        {
          id: 'id2',
        },
      ];

      const recordId = 'id3';

      expect(utils.checkIsInitialRecord(initialRecords, recordId)).toBeFalsy();
    });
  });

  describe('validateSubfield', () => {
    it('should not return error message when indicators are present and content is not empty', () => {
      const initialRecords = [
        {
          id: 'id1',
        },
        {
          id: 'id2',
        },
      ];
      const records = [
        {
          indicators: ['\\', '\\'],
          content: 'test',
          id: 'id1',
        },
        {
          indicators: ['\\', '7'],
          content: 'test',
          id: 'id2',
        },
      ];

      expect(utils.validateSubfield(records, initialRecords)).not.toBeDefined();
    });

    it('should return error message when content is empty', () => {
      const initialRecords = [
        {
          id: 'id1',
        },
        {
          id: 'id2',
        },
      ];
      const records = [
        {
          indicators: ['\\', '\\'],
          id: 'id1',
        },
        {
          indicators: [undefined, undefined],
          id: 'id2',
        },
      ];

      expect(utils.validateSubfield(records, initialRecords).props.id).toBe('ui-quick-marc.record.error.subfield');
    });
  });

  describe('deleteRecordByIndex', () => {
    it('should return records without one row', () => {
      const state = {
        formState: {
          values: {
            records: [
              {
                tag: '010',
                content: '$a fss $b asd',
              },
              {
                tag: '011',
                content: '$a fss $b asd',
              },
              {
                tag: '012',
                content: '$a fss $b asd',
              },
            ],
          },
        },
      };
      const removeIndex = 1;
      const newRecords = utils.deleteRecordByIndex(removeIndex, state);

      expect(newRecords.length).toBe(state.formState.values.records.length - 1);
    });
  });

  describe('reorderRecords', () => {
    it('should move records by indexes', () => {
      const state = {
        formState: {
          values: {
            records: [
              {
                tag: '010',
                content: '$a fss $b asd',
              },
              {
                tag: '011',
                content: '$a fss $b asd',
              },
              {
                tag: '012',
                content: '$a fss $b asd',
              },
            ],
          },
        },
      };
      const currentIndex = 1;
      const indexToSwitch = 2;
      const newRecords = utils.reorderRecords(currentIndex, indexToSwitch, state);

      expect(newRecords[currentIndex].tag).toBe(state.formState.values.records[indexToSwitch].tag);
    });
  });

  describe('formatMarcRecordByQuickMarcAction', () => {
    it('should return original record if action is not "duplicate" or "create"', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
        }],
      };

      expect(utils.formatMarcRecordByQuickMarcAction(record, QUICK_MARC_ACTIONS.EDIT)).toEqual(record);
    });

    it('should return record without 001, 005 and 999ff fields and no updateInfo if action is "duplicate"', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
        }, {
          tag: '005',
          content: 'some content',
        }, {
          tag: '019',
          content: 'some content',
        }, {
          tag: '035',
          content: 'some content',
        }, {
          tag: '201',
          content: 'some content',
        }, {
          tag: '999',
          indicators: ['f', 'f'],
          content: 'some content',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      const expectedRecord = {
        records: [{
          tag: '001',
          content: '',
        }, {
          tag: '005',
          content: '',
        }, {
          tag: '019',
          content: '$a',
        }, {
          tag: '035',
          content: '$a',
        }, {
          tag: '201',
          content: 'some content',
        }, {
          tag: '999',
          indicators: ['f', 'f'],
          content: '',
        }],
        updateInfo: {
          recordState: RECORD_STATUS_NEW,
        },
      };

      expect(utils.formatMarcRecordByQuickMarcAction(record, QUICK_MARC_ACTIONS.DUPLICATE)).toEqual(expectedRecord);
    });

    it('should return record with additional fields and no updateInfo if action is "create"', () => {
      const instanceId = 'instanceId';

      const record = {
        externalId: instanceId,
        leader: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
        fields: undefined,
        records: [{
          tag: LEADER_TAG,
          content: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
          id: LEADER_TAG,
        }, {
          tag: '001',
          id: uuid(),
        }, {
          tag: '004',
          id: uuid(),
          content: 'instanceHrid',
        }, {
          tag: '005',
          id: uuid(),
        }, {
          tag: '999',
          id: uuid(),
          indicators: ['f', 'f'],
        }],
        parsedRecordDtoId: instanceId,
      };

      const expectedRecord = {
        ...record,
        relatedRecordVersion: 1,
        marcFormat: 'HOLDINGS',
        suppressDiscovery: false,
        updateInfo: {
          recordState: RECORD_STATUS_NEW,
        },
      };

      expect(utils.formatMarcRecordByQuickMarcAction(record, QUICK_MARC_ACTIONS.CREATE)).toEqual(expectedRecord);
    });
  });

  describe('removeFieldsForDuplicate', () => {
    const formValues = {
      fields: undefined,
      externalId: 'c58ed340-5123-4c2c-8a99-add5db68c71f',
      leader: '01897cas\\a2200493\\a\\4500',
      parsedRecordDtoId: '73f23ed5-4981-4cb2-8cdf-1ec644bd8f34',
      parsedRecordId: '3f75732f-53b9-44ed-b097-0cd14e5867b2',
      records: [{
        content: '01897cas\\a2200493\\a\\4500',
        id: 'LDR',
        tag: 'LDR',
      }, {
        content: '',
        id: '9fbd621c-138c-41f7-ad97-9b70b5b0f228',
        indicators: [],
        tag: '001',
      }, {
        content: '$a QL640',
        id: '0ae03c65-629d-4bad-ae46-69746a7e13b0',
        indicators: ['1', '4'],
        tag: '050',
      }, {
        content: '',
        id: '2247ab92-91c0-47f7-8a35-cdd8b54604c1',
        indicators: [],
        tag: '005',
      }, {
        content: '$a v.1- (1992-)',
        id: '061c0259-8fbb-42b4-b463-9f307295f2a2',
        indicators: ['\\', '\\'],
        tag: '841',
      }, {
        content: '',
        id: '2247ab92-91c0-47f7-8a35-cdd8b54604c2',
        indicators: [],
        tag: '035',
      }, {
        content: '',
        id: '6a6582ea-746e-4058-a35b-8130e4f6d277',
        indicators: ['f', 'f'],
        tag: '999',
      }],
      suppressDiscovery: false,
      updateInfo: { recordState: 'NEW' },
    };

    const expectedFormValues = {
      fields: undefined,
      externalId: 'c58ed340-5123-4c2c-8a99-add5db68c71f',
      leader: '01897cas\\a2200493\\a\\4500',
      parsedRecordDtoId: '73f23ed5-4981-4cb2-8cdf-1ec644bd8f34',
      parsedRecordId: '3f75732f-53b9-44ed-b097-0cd14e5867b2',
      records: [{
        content: '01897cas\\a2200493\\a\\4500',
        id: 'LDR',
        tag: 'LDR',
      }, {
        content: '$a QL640',
        id: '0ae03c65-629d-4bad-ae46-69746a7e13b0',
        indicators: ['1', '4'],
        tag: '050',
      }, {
        content: '$a v.1- (1992-)',
        id: '061c0259-8fbb-42b4-b463-9f307295f2a2',
        indicators: ['\\', '\\'],
        tag: '841',
      }],
      suppressDiscovery: false,
    };

    expect(utils.removeFieldsForDuplicate(formValues)).toEqual(expectedFormValues);
  });

  describe('autopopulateIndicators', () => {
    it('should return record with autopopulated indicators', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '035',
          content: 'some content',
          id: 'id0351',
          indicators: ['0', '\\'],
        }, {
          tag: '035',
          content: 'some content',
          id: 'id0352',
          indicators: ['\\', undefined],
        }, {
          tag: '035',
          content: '$a',
          id: 'id0353',
          indicators: [undefined, undefined],
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      const expectedRecord = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '035',
          content: 'some content',
          id: 'id0351',
          indicators: ['0', '\\'],
        }, {
          tag: '035',
          content: 'some content',
          id: 'id0352',
          indicators: ['\\', '\\'],
        }, {
          tag: '035',
          content: '$a',
          id: 'id0353',
          indicators: ['\\', '\\'],
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.autopopulateIndicators(record)).toEqual(expectedRecord);
    });
  });

  describe('autopopulateSubfieldSection', () => {
    it('should return record with added subfield', () => {
      const initialValues = {
        records: [{
          tag: '001',
          id: 'id001',
        }, {
          tag: '003',
          id: 'id003',
        }, {
          tag: '240',
          id: 'id240',
        }],
      };
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '003',
          content: 'some content',
          id: 'id003',
        }, {
          tag: '240',
          content: 'some content',
          id: 'id240',
        }, {
          tag: '035',
          content: '$a',
          id: 'id0351',
        }, {
          tag: '035',
          content: '',
          id: 'id0352',
        }, {
          tag: '035',
          content: '',
          indicators: ['', ''],
          id: 'id0353',
        }, {
          tag: '500',
          content: '',
          id: 'id500',
        }, {
          tag: '998',
          indicators: ['f', 'f'],
          content: '$c some content',
          id: 'id998',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      const expectedRecord = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '003',
          content: 'some content',
          id: 'id003',
        }, {
          tag: '240',
          content: '$a some content',
          id: 'id240',
        }, {
          tag: '998',
          indicators: ['f', 'f'],
          content: '$c some content',
          id: 'id998',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.autopopulateSubfieldSection(record, initialValues)).toEqual(expectedRecord);
    });
  });

  describe('cleanBytesFields', () => {
    it('should return cleaded records', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
        }, {
          tag: '006',
          content: {
            Alph: '\\',
            Conf: '\\',
            Cont: ['a', '', null, '\\'],
            Type: 's',
            Ills: ['a'],
          },
        }, {
          tag: '007',
          content: {
            Category: 'c',
            Color: 'n',
            Dimensions: 'z',
            'File formats': 'a',
            'Image bit depth': 'nnn',
            'Level of compression': 'a',
            'Quality assurance target(s)': 'u',
            'Reformatting quality': 'n',
            SMD: 'z',
            Sound: 'a',
          },
        }, {
          tag: '008',
          content: {
            Audn: '\\',
            BLvl: 'm',
            Ctry: 'nyu',
            Date1: '2010',
            Date2: '\\\\\\\\',
            Desc: 'a',
            DtSt: 's',
            ELvl: 'I',
            Entered: '101027',
            Form: '\\',
            GPub: '\\',
            Lang: 'zxx',
            MRec: '\\',
            Srce: 'd',
            TMat: 'r',
            Tech: 'n',
            Time: ['n', 'n', 'n'],
            Type: 'r',
          },
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };
      const initialValues = {
        leader: '01577crm\\a2200397Ia\\4500',
      };
      const expectedRecord = {
        records: [{
          tag: '001',
          content: 'some content',
        }, {
          tag: '006',
          content: {
            Alph: '\\',
            Conf: '\\',
            Cont: ['a', '\\', '\\'],
            Type: 's',
          },
        }, {
          tag: '007',
          content: {
            Category: 'c',
            Color: 'n',
            Dimensions: 'z',
            'File formats': 'a',
            'Image bit depth': 'nnn',
            'Level of compression': 'a',
            'Quality assurance target(s)': 'u',
            'Reformatting quality': 'n',
            SMD: 'z',
            Sound: 'a',
          },
        }, {
          tag: '008',
          content: {
            Audn: '\\',
            BLvl: 'm',
            Ctry: 'nyu',
            Date1: '2010',
            Date2: '\\\\\\\\',
            Desc: 'a',
            DtSt: 's',
            ELvl: 'I',
            Entered: '101027',
            Form: '\\',
            GPub: '\\',
            Lang: 'zxx',
            MRec: '\\',
            Srce: 'd',
            TMat: 'r',
            Tech: 'n',
            Time: ['n', 'n', 'n'],
            Type: 'r',
          },
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.cleanBytesFields(record, initialValues, 'bib')).toEqual(expectedRecord);
    });
  });

  describe('getCreateMarcRecordResponse', () => {
    it('should return correct response for creating MARC Holdings record', () => {
      const instanceResponse = {
        id: 'instanceId',
        hrid: 'instanceHrid',
      };

      const defaultFields = [{
        tag: '001',
        id: uuid(),
      }, {
        tag: '004',
        id: uuid(),
        content: instanceResponse.hrid,
      }, {
        tag: '005',
        id: uuid(),
      }, {
        tag: '999',
        id: uuid(),
        indicators: ['f', 'f'],
      }];

      const expectedResult = {
        externalId: instanceResponse.id,
        leader: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
        fields: undefined,
        records: [
          {
            tag: LEADER_TAG,
            content: CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
            id: LEADER_TAG,
          },
          ...defaultFields,
        ],
        parsedRecordDtoId: instanceResponse.id,
      };

      expect(utils.getCreateMarcRecordResponse(instanceResponse)).toEqual(expectedResult);
    });
  });
});
