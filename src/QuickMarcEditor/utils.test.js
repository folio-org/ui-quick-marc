import faker from 'faker';

import { LEADER_TAG } from './constants';
import * as utils from './utils';

jest.mock('uuid', () => {
  return () => 'uuid';
});

describe('QuickMarcEditor utils', () => {
  describe('dehydrateMarcRecordResponse', () => {
    it('should return dehydrated marc dehydrated marc record', () => {
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

  describe('validateMarcRecord', () => {
    it('should not return error message when record is valid', () => {
      const record = {
        records: [
          {
            content: '0as5s7ac',
          },
          {
            tag: '008',
            content: {
              Type: 'a',
              BLvl: 'c',
            },
          },
          {
            tag: '245',
          },
        ],
      };

      expect(utils.validateMarcRecord(record)).not.toBeDefined();
    });

    it('should return error message when record type is not matched with leader', () => {
      const record = {
        records: [
          {
            content: '0as5s7ac',
          },
          {
            tag: '008',
            content: {
              Type: 'b',
              BLvl: 'c',
            },
          },
        ],
      };

      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.typeIsNotMatched');

      record.records[1].content = {
        Type: 'a',
        BLvl: 'm',
      };
      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.typeIsNotMatched');

      expect(utils.validateMarcRecord({})).toBe('ui-quick-marc.record.error.typeIsNotMatched');
    });

    it('should return error message when record is without 245 row', () => {
      const record = {
        records: [
          {
            content: '0as5s7ac',
          },
          {
            tag: '008',
            content: {
              Type: 'a',
              BLvl: 'c',
            },
          },
          {
            tag: '244',
          },
        ],
      };

      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.title.empty');
    });

    it('should return error message when record has several 245 rows', () => {
      const record = {
        records: [
          {
            content: '0as5s7ac',
          },
          {
            tag: '008',
            content: {
              Type: 'a',
              BLvl: 'c',
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

      expect(utils.validateMarcRecord(record)).toBe('ui-quick-marc.record.error.title.multiple');
    });
  });
});
