import faker from 'faker';

import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from './constants';
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
        utils.validateLeader('04706cam a2200865Ii 4500', '04706dam a2200865nfa45'),
      ).toBe('ui-quick-marc.record.error.leader.length');

      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706dam a2200865nfa45gf sdg s'),
      ).toBe('ui-quick-marc.record.error.leader.length');
    });

    it('should return edit error message when forbidden bytes are edited', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706cam a2200865Ii 4501'),
      ).toBe('ui-quick-marc.record.error.leader.forbiddenBytes');

      expect(
        utils.validateLeader('14706cam a2200865Ii 4500', '04706cam a2200865Ii 4500'),
      ).toBe('ui-quick-marc.record.error.leader.forbiddenBytes');
    });
  });

  describe('validateMarcRecord', () => {
    it('should not return error message when record is valid', () => {
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: '025',
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

      expect(utils.validateMarcRecord(record)).not.toBeDefined();
    });

    it('should return error message when record is invalid', () => {
      const record = {
        leader: '14706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: '025',
          },
        ],
      };

      expect(utils.validateMarcRecord(record)).toBeDefined();
    });

    it('should return error message when record is without 245 row', () => {
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: '025',
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

      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.title.empty');
    });

    it('should return error message when record has several 245 rows', () => {
      const record = {
        leader: '04706cam a2200865Ii 4500',
        records: [
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
          {
            tag: '245',
          },
        ],
      };

      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.title.multiple');
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

      expect(utils.validateRecordMismatch(records)).toBe('ui-quick-marc.record.error.leader.fixedFieldMismatch');
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

      expect(utils.validateRecordMismatch(records)).toBe('ui-quick-marc.record.error.leader.fixedFieldMismatch');
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

    it('should return error message when tag is not valid', () => {
      const records = [
        {
          tag: '10',
        },
        {
          tag: '245',
        },
      ];

      expect(utils.validateRecordTag(records)).toBe('ui-quick-marc.record.error.tag.length');
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

  describe('shouldRecordsUpdate', () => {
    it('should be false if update is not requried', () => {
      expect(utils.shouldRecordsUpdate([{ tag: '006' }], [{ tag: '006' }])).toBeFalsy();
    });

    it('should be true if records length is not matched', () => {
      expect(utils.shouldRecordsUpdate([], [{}])).toBeTruthy();
    });

    it('should be true if material chars fields length is not matched', () => {
      expect(utils.shouldRecordsUpdate([{ tag: '006' }], [{ tag: '009' }])).toBeTruthy();
    });

    it('should be true if physical description fields length is not matched', () => {
      expect(utils.shouldRecordsUpdate([{ tag: '007' }], [{ tag: '009' }])).toBeTruthy();
    });

    it('should be true if byte field is moved', () => {
      expect(
        utils.shouldRecordsUpdate([{ tag: '007' }, { tag: '009' }], [{ tag: '009' }, { tag: '007' }]),
      ).toBeTruthy();

      expect(
        utils.shouldRecordsUpdate([{ tag: '009' }, { tag: '006' }], [{ tag: '006' }, { tag: '009' }]),
      ).toBeTruthy();
    });

    it('should be true if physical description type is not matched', () => {
      const hasToBeUpdated = utils.shouldRecordsUpdate(
        [{ tag: '007', content: { Category: 'a' } }],
        [{ tag: '007', content: { Category: 'b' } }],
      );

      expect(hasToBeUpdated).toBeTruthy();
    });

    it('should be true if 999ff field moved', () => {
      const prevRecords = [
        {
          tag: '008',
          content: {
            Type: 'a',
            BLvl: 'c',
          },
        },
        {
          tag: '999',
          indicators: ['f', 'f'],
        },
      ];
      const newRecords = [
        {
          tag: '999',
          indicators: ['f', 'f'],
        },
        {
          tag: '008',
          content: {
            Type: 'a',
            BLvl: 'c',
          },
        },
      ];

      expect(utils.shouldRecordsUpdate(prevRecords, newRecords)).toBeTruthy();
    });
  });

  describe('formatMarcRecordByQuickMarcAction', () => {
    it('should return original record if action is not "duplicate"', () => {
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
  });

  describe('removeFieldsForDuplicate', () => {
    const formValues = {
      fields: undefined,
      instanceId: 'c58ed340-5123-4c2c-8a99-add5db68c71f',
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
      instanceId: 'c58ed340-5123-4c2c-8a99-add5db68c71f',
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
});
