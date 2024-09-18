/* eslint-disable max-lines */
import faker from 'faker';

import { v4 as uuid } from 'uuid';
import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
  HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
} from './constants';
import { MARC_TYPES } from '../common/constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import * as utils from './utils';

import fixedFieldSpecBib from '../../test/mocks/fixedFieldSpecBib';
import fixedFieldSpecAuth from '../../test/mocks/fixedFieldSpecAuth';
import fixedFieldSpecHold from '../../test/mocks/fixedFieldSpecHold';
import {
  bibLeader,
  bibLeaderString,
  holdingsLeader,
} from '../../test/jest/fixtures/leaders';

jest.mock('uuid', () => {
  return {
    v4: () => 'uuid',
  };
});

describe('QuickMarcEditor utils', () => {
  describe('dehydrateMarcRecordResponse', () => {
    it('should return dehydrated marc record', () => {
      const marcRecord = {
        id: faker.random.uuid(),
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        leader: bibLeaderString,
        fields: [
          {
            tag: '001',
            content: '$a fss $b asd',
          },
          {
            tag: '006',
            content: {
              Type: 'c',
            },
          },
          {
            tag: '007',
            content: {
              Category: 'c',
            },
          },
          {
            tag: '008',
            content: {},
          },
        ],
      };

      const dehydratedMarcRecord = utils.dehydrateMarcRecordResponse(marcRecord, MARC_TYPES.BIB, fixedFieldSpecBib);
      const field006 = dehydratedMarcRecord.records[2];
      const field007 = dehydratedMarcRecord.records[3];
      const field008 = dehydratedMarcRecord.records[4];

      expect(dehydratedMarcRecord.fields).not.toBeDefined();

      expect(dehydratedMarcRecord.records[0].tag).toBe(LEADER_TAG);
      expect(dehydratedMarcRecord.records[0].id).toBe(LEADER_TAG);
      expect(dehydratedMarcRecord.records[0].content).toEqual(bibLeader);

      expect(dehydratedMarcRecord.records[1].id).toBe('uuid');

      expect(field006.content).toMatchObject({
        Type: 'c',
        Comp: '\\\\',
        FMus: '\\',
        Part: '\\',
        Audn: '\\',
        Form: '\\',
        AccM: ['\\', '\\', '\\', '\\', '\\', '\\'],
        LTxt: ['\\', '\\'],
        TrAr: '\\',
      });

      expect(field007.content).toMatchObject({
        Category: 'c',
        SMD: '\\',
        Color: '\\',
        Dimensions: '\\',
        Sound: '\\',
        'Image bit depth': '\\\\\\',
        'File formats': '\\',
        'Quality assurance target(s)': '\\',
        'Antecedent/ Source': '\\',
        'Level of compression': '\\',
        'Reformatting quality': '\\',
      });

      expect(field008.content).toMatchObject({
        Type: 'a',
        BLvl: 'm',
        Srce: '\\',
        Audn: '\\',
        Lang: '\\\\\\',
        Form: '\\',
        Conf: '\\',
        Biog: '\\',
        MRec: '\\',
        Ctry: '\\\\\\',
        Cont: ['\\', '\\', '\\', '\\'],
        GPub: '\\',
        LitF: '\\',
        Indx: '\\',
        Ills: ['\\', '\\', '\\', '\\'],
        Fest: '\\',
        DtSt: '\\',
        Date1: '\\\\\\\\',
        Date2: '\\\\\\\\',
      });
    });
  });

  describe('hydrateMarcRecord', () => {
    it('should return hydrated marc record from form', () => {
      const marcRecord = {
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        records: [
          {
            content: bibLeader,
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

      expect(hydratedMarcRecord.leader).toBe(bibLeader);

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
                _isDeleted: true,
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
      const newRecords = utils.restoreRecordAtIndex(insertIndex, state);

      expect(newRecords[1]._isDeleted).toBe(false);
    });
  });

  describe('markLinkedRecordByIndex', () => {
    it('should mark record as linked', () => {
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

      const index = 1;
      const authority = {};
      const newRecords = utils.markLinkedRecordByIndex(index, authority, state);

      expect(newRecords[index]._isLinked).toBe(true);
    });
  });

  describe('markLinkedRecords', () => {
    describe('when field comprises linkDetails and _isLinked is false', () => {
      it('should mark records as linked', () => {
        const fields = [
          {
            tag: '100',
            content: '$a fss $b asd',
            linkDetails: {},
            _isLinked: false,
          },
          {
            tag: '600',
            content: '$a fss $b asd',
            _isLinked: false,
          },
        ];

        const newRecords = utils.markLinkedRecords(fields);

        expect(newRecords[0]._isLinked).toBeTruthy();
        expect(newRecords[1]._isLinked).toBeFalsy();
      });
    });

    describe('when field is linked', () => {
      it('should not mark the record', () => {
        const fields = [
          {
            tag: '100',
            content: '$a fss $b asd',
            linkDetails: {},
            _isLinked: true,
          },
        ];

        const newRecords = utils.markLinkedRecords(fields);

        expect(newRecords[0] === fields[0]).toBeTruthy();
      });
    });
  });

  describe('markUnlinkedRecordByIndex', () => {
    it('should mark record as unlinked', () => {
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
                _isLinked: true,
              },
              {
                tag: '012',
                content: '$a fss $b asd',
              },
            ],
          },
        },
      };

      const index = 1;
      const newRecords = utils.markUnlinkedRecordByIndex(index, state);

      expect(newRecords[index]._isLinked).toBe(false);
    });
  });

  describe('checkIsInitialRecord', () => {
    it('should return true if this record row is initial', () => {
      expect(utils.checkIsInitialRecord({
        id: '123-456',
        _isAdded: false,
      })).toBeTruthy();
    });

    it('should return false if this record row is not initial', () => {
      expect(utils.checkIsInitialRecord({
        id: '123-456',
        _isAdded: true,
      })).toBeFalsy();
    });
  });

  describe('checkControlFieldLength', () => {
    it('should not return error message when only one 001 and 010 fields are present', () => {
      const formValues = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '035',
          content: 'some content',
          id: 'id035',
          indicators: ['0', '\\'],
        }, {
          content: '',
          id: 'id999ff',
          indicators: ['f', 'f'],
          tag: '999',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.checkControlFieldLength(formValues)).not.toBeDefined();
      expect(utils.checkDuplicate010Field(formValues.records)).not.toBeDefined();
    });

    it('should return error message when more than one 001 field is present', () => {
      const formValues = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001-1',
        }, {
          tag: '001',
          content: 'some other content',
          id: 'id001-2',
        }, {
          tag: '035',
          content: 'some content',
          id: 'id035',
          indicators: ['0', '\\'],
        }, {
          content: '',
          id: 'id999ff-746e-4058-a35b-8130e4f6d277',
          indicators: ['f', 'f'],
          tag: '999',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.checkControlFieldLength(formValues).props.id).toBe('ui-quick-marc.record.error.controlField.multiple');
    });

    it('should return error message when more than one 010 field is present', () => {
      const formValues = {
        records: [{
          tag: '010',
          content: 'some content',
          id: 'id010-1',
        }, {
          tag: '010',
          content: 'some other content',
          id: 'id010-2',
        }, {
          tag: '035',
          content: 'some content',
          id: 'id035',
          indicators: ['0', '\\'],
        }, {
          content: '',
          id: 'id999ff-746e-4058-a35b-8130e4f6d277',
          indicators: ['f', 'f'],
          tag: '999',
        }],
        updateInfo: {
          recordState: 'actual',
          updateDate: '01/01/1970',
        },
      };

      expect(utils.checkDuplicate010Field(formValues.records).props.id).toBe('ui-quick-marc.record.error.010.multiple');
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

  describe('fillEmptyFixedFieldValues', () => {
    it('should return 008 field with all filled values', () => {
      const marcType = MARC_TYPES.BIB;
      const type = 'a';
      const blvl = 'm';
      const field = {
        content: {
          Lang: 'eng',
        },
      };

      expect(utils.fillEmptyFixedFieldValues(marcType, fixedFieldSpecBib, type, blvl, field)).toMatchObject({
        Srce: '\\',
        Audn: '\\',
        Lang: 'eng',
        Form: '\\',
        Conf: '\\',
        Biog: '\\',
        MRec: '\\',
        Ctry: '\\\\\\',
        Cont: ['\\', '\\', '\\', '\\'],
        GPub: '\\',
        LitF: '\\',
        Indx: '\\',
        Ills: ['\\', '\\', '\\', '\\'],
        Fest: '\\',
        DtSt: '\\',
        Date1: '\\\\\\\\',
        Date2: '\\\\\\\\',
        Type: type,
        BLvl: blvl,
      });
    });

    describe('when marc type is Authority', () => {
      it('should add Authority specific hidden fields', () => {
        const marcType = MARC_TYPES.AUTHORITY;
        const type = 'z';
        const blvl = '';
        const field = {
          content: {
            Roman: 'n',
          },
        };

        expect(utils.fillEmptyFixedFieldValues(marcType, fixedFieldSpecAuth, type, blvl, field)).toMatchObject({
          'Geo Subd': '\\',
          'Kind rec': '\\',
          'SH Sys': '\\',
          Series: '\\',
          'Numb Series': '\\',
          'Main use': '\\',
          'Subj use': '\\',
          'Series use': '\\',
          'Type Subd': '\\',
          'Govt Ag': '\\',
          RefEval: '\\',
          RecUpd: '\\',
          'Pers Name': '\\',
          'Level Est': '\\',
          'Mod Rec Est': '\\',
          Source: '\\',
          Roman: 'n',
          Lang: '\\',
          'Cat Rules': '\\',
          Undef_18: '\\\\\\\\\\\\\\\\\\\\',
          Undef_30: '\\',
          Undef_34: '\\\\\\\\',
        });
      });
    });

    describe('when marc type is Holding', () => {
      it('should add Holding specific hidden fields', () => {
        const marcType = MARC_TYPES.HOLDINGS;
        const type = 'u';
        const blvl = '';
        const field = {
          content: {
            Compl: 'a',
          },
        };

        expect(utils.fillEmptyFixedFieldValues(marcType, fixedFieldSpecHold, type, blvl, field)).toMatchObject({
          AcqStatus: '\\',
          AcqMethod: '\\',
          AcqEndDate: '\\\\\\\\',
          'Gen ret': '\\',
          'Spec ret': ['\\', '\\', '\\'],
          Compl: 'a',
          Copies: '\\\\\\',
          Lend: '\\',
          Repro: '\\',
          Lang: '\\\\\\',
          'Sep/comp': '\\',
          'Rept date': '\\\\\\\\\\\\',
        });
      });
    });
  });

  describe('formatMarcRecordByQuickMarcAction', () => {
    describe('when action is "edit"', () => {
      it('should return original record if ', () => {
        const record = {
          records: [{
            tag: '001',
            content: 'some content',
          }],
        };

        expect(utils.formatMarcRecordByQuickMarcAction(
          record,
          QUICK_MARC_ACTIONS.EDIT,
          MARC_TYPES.BIB,
        )).toEqual(record);
      });
    });

    describe('when action is "derive"', () => {
      it('should return record without 001, 005, 010 and 999ff fields content and no updateInfo', () => {
        const record = {
          records: [{
            tag: LEADER_TAG,
            content: 'some content',
          }, {
            tag: '001',
            content: 'some content',
          }, {
            tag: '005',
            content: 'some content',
          }, {
            tag: '010',
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
            tag: LEADER_TAG,
            content: 'some content',
          }, {
            tag: '001',
            content: '',
          }, {
            tag: '005',
            content: '',
          }, {
            tag: '010',
            content: '$a',
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

        expect(utils.formatMarcRecordByQuickMarcAction(
          record,
          QUICK_MARC_ACTIONS.DERIVE,
          MARC_TYPES.BIB,
        )).toEqual(expectedRecord);
      });

      it('should return record with Leader, 001 and 005 fields first', () => {
        const record = {
          records: [{
            tag: LEADER_TAG,
            content: 'some content',
          }, {
            tag: '019',
            content: 'some content',
          }, {
            tag: '001',
            content: 'some content',
          }, {
            tag: '005',
            content: 'some content',
          }],
          updateInfo: {
            recordState: 'actual',
            updateDate: '01/01/1970',
          },
        };

        const expectedRecord = {
          records: [{
            tag: LEADER_TAG,
            content: 'some content',
          }, {
            tag: '001',
            content: '',
          }, {
            tag: '005',
            content: '',
          }, {
            tag: '019',
            content: '$a',
          }],
          updateInfo: {
            recordState: RECORD_STATUS_NEW,
          },
        };

        expect(utils.formatMarcRecordByQuickMarcAction(
          record,
          QUICK_MARC_ACTIONS.DERIVE,
          MARC_TYPES.BIB,
        )).toEqual(expectedRecord);
      });
    });

    describe('when action is "create"', () => {
      it('should return record with additional fields and no updateInfo if action is "create"', () => {
        const instanceId = 'instanceId';

        const record = {
          externalId: instanceId,
          leader: bibLeader,
          fields: undefined,
          records: [{
            tag: LEADER_TAG,
            content: bibLeader,
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

        expect(utils.formatMarcRecordByQuickMarcAction(
          record,
          QUICK_MARC_ACTIONS.CREATE,
          MARC_TYPES.HOLDINGS,
        )).toEqual(expectedRecord);
      });
    });
  });

  describe('removeEnteredDate', () => {
    it('should remove 008 "Entered" field', () => {
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
          content: {
            Lang: 'eng',
            Entered: '000000',
          },
          tag: '008',
          indicators: [],
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
          content: {
            Lang: 'eng',
          },
          tag: '008',
          indicators: [],
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

      expect(utils.removeEnteredDate(formValues)).toEqual(expectedFormValues);
    });
  });

  describe('removeFieldsForDerive', () => {
    it('should remove 001 and 005 fields', () => {
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

      expect(utils.removeFieldsForDerive(formValues)).toEqual(expectedFormValues);
    });
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

      expect(utils.autopopulateSubfieldSection(record)).toEqual(expectedRecord);
    });

    it('should remove fields with empty content', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '035',
          content: '$a $b',
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

      expect(utils.autopopulateSubfieldSection(record)).toEqual(expectedRecord);
    });

    it('should not remove fields when subfield code and subfield value not separated with space', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
          id: 'id001',
        }, {
          tag: '035',
          content: '$atesting $b testingtwo',
          id: 'id0351',
        }, {
          tag: '035',
          content: '$a testing $btestingtwo',
          id: 'id0352',
        }, {
          tag: '035',
          content: '$atesting $btestingtwo',
          id: 'id0353',
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
          tag: '035',
          content: '$atesting $b testingtwo',
          id: 'id0351',
        }, {
          tag: '035',
          content: '$a testing $btestingtwo',
          id: 'id0352',
        }, {
          tag: '035',
          content: '$atesting $btestingtwo',
          id: 'id0353',
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

      expect(utils.autopopulateSubfieldSection(record)).toEqual(expectedRecord);
    });

    it('should allow saving local control fields of bib record without subfield', () => {
      const record = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '004',
          content: 'some content',
          id: 'id004',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      const expectedRecord = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '004',
          content: 'some content',
          id: 'id004',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      expect(utils.autopopulateSubfieldSection(record, MARC_TYPES.BIB)).toEqual(expectedRecord);
    });

    it('should allow saving local control fields of authority record without subfield', () => {
      const record = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '004',
          content: 'some content',
          id: 'id004',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      const expectedRecord = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '004',
          content: 'some content',
          id: 'id004',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      expect(utils.autopopulateSubfieldSection(record, MARC_TYPES.AUTHORITY)).toEqual(expectedRecord);
    });

    it('should allow saving local control fields of holdings record without subfield', () => {
      const record = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      const expectedRecord = {
        records: [{
          tag: '002',
          content: 'some content',
          id: 'id002',
        }, {
          tag: '009',
          content: 'some content',
          id: 'id009',
        }],
      };

      expect(utils.autopopulateSubfieldSection(record, MARC_TYPES.HOLDINGS)).toEqual(expectedRecord);
    });
  });

  describe('cleanBytesFields', () => {
    it('should return cleaned records', () => {
      const leader = {
        ...bibLeader,
        Type: 'g',
      };

      const record = {
        records: [{
          tag: 'LDR',
          content: leader,
        }, {
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
      const expectedRecord = {
        records: [{
          tag: 'LDR',
          content: leader,
        }, {
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

      expect(utils.cleanBytesFields(record, fixedFieldSpecBib, MARC_TYPES.BIB)).toEqual(expectedRecord);
    });
  });

  describe('getCreateHoldingsMarcRecordResponse', () => {
    it('should return correct response for creating MARC Holdings record', () => {
      const instanceResponse = {
        id: 'instanceId',
        hrid: 'instanceHrid',
      };

      const defaultFields = [{
        tag: '001',
        id: uuid(),
      }, {
        tag: '005',
        id: uuid(),
      }, {
        tag: '004',
        id: uuid(),
        content: instanceResponse.hrid,
      }, {
        tag: '008',
        id: uuid(),
        content: HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
      }, {
        tag: '852',
        id: uuid(),
        indicators: ['\\', '\\'],
      }, {
        tag: '999',
        id: uuid(),
        indicators: ['f', 'f'],
      }];

      const expectedResult = {
        externalId: instanceResponse.id,
        leader: holdingsLeader,
        fields: undefined,
        records: [
          {
            tag: LEADER_TAG,
            content: holdingsLeader,
            id: LEADER_TAG,
          },
          ...defaultFields,
        ],
        parsedRecordDtoId: instanceResponse.id,
      };

      expect(utils.getCreateHoldingsMarcRecordResponse(instanceResponse)).toEqual(expectedResult);
    });
  });

  describe('getCorrespondingMarcTag', () => {
    it('should return first corresponding record tag', () => {
      const records = [{
        tag: '001',
        id: uuid(),
      }, {
        tag: '130',
        id: uuid(),
      }, {
        tag: '852',
        id: uuid(),
        content: '$b VA/LI/D',
      }, {
        tag: '999',
        id: uuid(),
        indicators: ['f', 'f'],
      }];

      expect(utils.getCorrespondingMarcTag(records)).toEqual('130');
    });
  });

  describe('getContentSubfieldValue', () => {
    it('should return splited string by subfields into object', () => {
      expect(utils.getContentSubfieldValue('$a Test Title')).toEqual({ $a: ['Test Title'] });
    });

    it('should return repeatable subfields as an array', () => {
      expect(utils.getContentSubfieldValue('$a Test Title $b Repeat 1 $b Repeat 2')).toEqual({
        $a: ['Test Title'],
        $b: ['Repeat 1', 'Repeat 2'],
      });
    });

    it('shoud return empty body when content is undefined', () => {
      expect(utils.getContentSubfieldValue(undefined)).toEqual({});
    });
  });

  describe('getLocationValue', () => {
    describe('when has matches', () => {
      it('should return matched location value', () => {
        expect(utils.getLocationValue('$b KU/CC/DI/A $t 3 $h M3')).toEqual('$b KU/CC/DI/A');
      });
    });

    describe('when does not have matches', () => {
      it('should return an empty string', () => {
        expect(utils.getLocationValue('$t 3 $h M3')).toEqual('');
      });
    });
  });

  describe('are010Or1xxUpdated', () => {
    it('should check if 010 $a is updated', () => {
      const recordContent = {
        content: 'n  80161705 ',
        id: 'c1723942-329c-45d4-ac39-a7ac63e015d4',
        isProtected: true,
        tag: '001',
        _isDeleted: false,
        _isLinked: false,
      };
      const initial = [{ ...recordContent }];
      const updated = [{ ...recordContent }];

      expect(utils.are010Or1xxUpdated(initial, updated)).toBeFalsy();
    });

    it('should check if 1xx is updated', () => {
      const recordContent = {
        tag: '100',
        content: '$a Kitao, Masayoshi, $d 1764-18245',
        indicators: [
          '1',
          '\\',
        ],
        isProtected: false,
        id: '141fc876-f0eb-40ac-9385-38b9de9a3aeb',
        _isDeleted: false,
        _isLinked: false,
      };
      const initial = [{ ...recordContent }];
      const updated = [{
        ...recordContent,
        content: '$a Kitao, Masayoshi, $d 1764-1824',
      }];

      expect(utils.are010Or1xxUpdated(initial, updated)).toBeTruthy();
    });
  });

  describe('hasDeleteException', () => {
    it('should be true for exeptional row', () => {
      expect(utils.hasDeleteException({ tag: LEADER_TAG })).toBeTruthy();
      expect(utils.hasDeleteException({ tag: '001' })).toBeTruthy();
    });

    it('should be true for record end', () => {
      expect(utils.hasDeleteException({ tag: '999', indicators: ['f', 'f'] })).toBeTruthy();
    });

    it('should be false for exeptional row', () => {
      expect(utils.hasDeleteException({ tag: '010' })).toBeFalsy();
    });

    describe('when record type equals BIB', () => {
      it('should be true for tag 245', () => {
        expect(utils.hasDeleteException({ tag: '245' }, MARC_TYPES.BIB)).toBeTruthy();
      });
    });

    describe('when record type equals HOLDINGS', () => {
      it('should be true for tag 004', () => {
        expect(utils.hasDeleteException({ tag: '004' }, MARC_TYPES.HOLDINGS)).toBeTruthy();
      });
    });

    describe('when record type equals AUTHORITY', () => {
      it('should be true for 1XX tags', () => {
        expect(utils.hasDeleteException({ tag: '150' }, MARC_TYPES.AUTHORITY)).toBeTruthy();
      });

      it('should be true for tag 010 when $a is linked to a bib record', () => {
        const authority = { naturalId: 'n79018119' };
        const initialValues = { records: [{ tag: '010', content: '$a n  79018119' }] };
        const linksCount = 1;

        expect(utils.hasDeleteException({ tag: '010' }, MARC_TYPES.AUTHORITY, authority, initialValues, linksCount)).toBeTruthy();
      });
    });
  });

  describe('isReadOnly', () => {
    it('should be true for record start', () => {
      expect(utils.isReadOnly({ tag: '001' })).toBeTruthy();
    });

    describe('when record type equals BIB', () => {
      it('should be true for tag 004', () => {
        expect(utils.isReadOnly({ tag: '004' })).toBeFalsy();
      });
    });

    describe('when record type equals HOLDINGS', () => {
      it('should be true for tag 004', () => {
        expect(utils.isReadOnly(
          { tag: '004' },
          QUICK_MARC_ACTIONS.EDIT,
          MARC_TYPES.HOLDINGS,
        )).toBeTruthy();
      });
    });

    it('should be true for tag 005 (Date and Time of Latest Transaction)', () => {
      expect(utils.isReadOnly({ tag: '005' })).toBeTruthy();
    });

    it('should be true for record end', () => {
      expect(utils.isReadOnly({ tag: '999', indicators: ['f', 'f'] })).toBeTruthy();
    });

    it('should be false for record rows', () => {
      expect(utils.isReadOnly({ tag: LEADER_TAG })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '002' })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '050' })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '998' })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '999' })).toBeFalsy();
    });

    it('should be true for tag LDR on derive page', () => {
      expect(utils.isReadOnly({ tag: '005' }, QUICK_MARC_ACTIONS.DERIVE)).toBeTruthy();
    });
  });

  describe('isRecordForAutoLinking', () => {
    describe('when a record is enabled for auto-linking, has a $0 subfield and is not linked yet', () => {
      it('should return true', () => {
        const field = {
          tag: '100',
          content: '$a Coates, Ta-Nehisi, $0 naturalId',
          _isLinked: false,
          _isDeleted: false,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeTruthy();
      });
    });

    describe('when $0 is empty', () => {
      it('should return false', () => {
        const field = {
          tag: '100',
          content: '$a Coates, Ta-Nehisi, $0 ',
          _isLinked: false,
          _isDeleted: false,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeFalsy();
      });
    });

    describe('when $0 is absent', () => {
      it('should return false', () => {
        const field = {
          tag: '100',
          content: '$a Coates, Ta-Nehisi,',
          _isLinked: false,
          _isDeleted: false,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeFalsy();
      });
    });

    describe('when field is not enabled for auto-linking', () => {
      it('should return false', () => {
        const field = {
          tag: '650',
          content: '$a Coates, Ta-Nehisi, $0 naturalId',
          _isLinked: false,
          _isDeleted: false,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeFalsy();
      });
    });

    describe('when field is already linked', () => {
      it('should return false', () => {
        const field = {
          tag: '100',
          content: '$a Coates, Ta-Nehisi, $0 naturalId',
          _isLinked: true,
          _isDeleted: false,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeFalsy();
      });
    });

    describe('when field is deleted', () => {
      it('should return false', () => {
        const field = {
          tag: '100',
          content: '$a Coates, Ta-Nehisi, $0 naturalId',
          _isLinked: false,
          _isDeleted: true,
        };
        const autoLinkableBibFields = ['100'];

        expect(utils.isRecordForAutoLinking(field, autoLinkableBibFields)).toBeFalsy();
      });
    });
  });

  describe('hydrateForLinkSuggestions', () => {
    it('should take "leader" value from the LDR field', () => {
      const fields = [{
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
      }];

      const marcRecord = {
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        _actionType: 'view',
        records: [
          {
            tag: 'LDR',
            content: bibLeaderString,
          },
          ...fields,
        ],
      };

      expect(utils.hydrateForLinkSuggestions(marcRecord, MARC_TYPES.BIB, fields)).toEqual({
        leader: bibLeaderString,
        marcFormat: MARC_TYPES.BIB.toUpperCase(),
        _actionType: 'view',
        fields: [
          {
            tag: '100',
            content: '$a Coates, Ta-Nehisi $e author. $0 id.loc.gov/authorities/names/n2008001084 $9 4808f6ae-8379-41e9-a795-915ac4751668',
          },
        ],
      });
    });
  });

  describe('is010LinkedToBibRecord', () => {
    describe('when links count is 0', () => {
      it('should return false', () => {
        const initialRecords = [{
          tag: '010',
          content: '$a n 123456',
        }];
        const naturalId = 'n123456';
        const linksCount = 0;

        expect(utils.is010LinkedToBibRecord(initialRecords, naturalId, linksCount)).toEqual(false);
      });
    });

    describe('when 010 field is missing', () => {
      it('should return false', () => {
        const initialRecords = [{
          tag: '011',
          content: '$a n 123456',
        }];
        const naturalId = 'n123456';
        const linksCount = 1;

        expect(utils.is010LinkedToBibRecord(initialRecords, naturalId, linksCount)).toEqual(false);
      });
    });

    describe('when 010$a does not match naturalId', () => {
      it('should return false', () => {
        const initialRecords = [{
          tag: '010',
          content: '$a n 123456',
        }];
        const naturalId = 'n123456789';
        const linksCount = 1;

        expect(utils.is010LinkedToBibRecord(initialRecords, naturalId, linksCount)).toEqual(false);
      });
    });

    describe('when 010$a matches naturalId', () => {
      it('should return true', () => {
        const initialRecords = [{
          tag: '010',
          content: '$a n 123456',
        }];
        const naturalId = 'n123456';
        const linksCount = 1;

        expect(utils.is010LinkedToBibRecord(initialRecords, naturalId, linksCount)).toEqual(true);
      });
    });
  });

  describe('isDiacritic', () => {
    it('should all chars to be detected as diacritics', () => {
      const diacriticArray = 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻøãéžŽšŠşŞß';

      [...diacriticArray].forEach(c => {
        expect(utils.isDiacritic(c)).toBeTruthy();
      });
    });

    it('should all chars to be detected as not diacritics', () => {
      const diacriticArray = 'acelnoszACELNOSZ';

      [...diacriticArray].forEach(c => {
        expect(utils.isDiacritic(c)).toBeFalsy();
      });
    });
  });
});
