import faker from 'faker';

import { LEADER_TAG } from './constants';
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
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
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

  describe('isLastRecordMoved', () => {
    it('should return true if 999ff field moved', () => {
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

      expect(utils.isLastRecordMoved(prevRecords, newRecords)).toBeTruthy();
    });
  });
});
