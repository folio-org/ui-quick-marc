/* eslint-disable max-lines */
import faker from 'faker';
import cloneDeep from 'lodash/cloneDeep';

import { v4 as uuid } from 'uuid';
import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
  CREATE_MARC_RECORD_DEFAULT_LEADER_VALUE,
  HOLDINGS_FIXED_FIELD_DEFAULT_VALUES,
} from './constants';
import { MARC_TYPES } from '../common/constants';
import { RECORD_STATUS_NEW } from './QuickMarcRecordInfo/constants';
import * as utils from './utils';

jest.mock('uuid', () => {
  return {
    v4: () => 'uuid',
  };
});

describe('QuickMarcEditor utils', () => {
  const locations = [{
    code: 'VA/LI/D',
  }, {
    code: 'LO/CA/TI/ON',
  }];

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

  describe('validateLeader', () => {
    it('should return an error message when position 18 is invalid', () => {
      expect(
        utils.validateLeader('04706cam a2200865Iia4500', '04706dam a2200865nfa4500').props.values.positions,
      ).toBe('Leader 018');
    });

    it('should return an error message when position 19 is invalid', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ici4500', '04706dam a2200865nai4500').props.values.positions,
      ).toBe('Leader 019');
    });

    it('should not return error message when leader is valid', () => {
      expect(
        utils.validateLeader('04706cam a2200865Ii 4500', '04706cam a2200865Ii 4500'),
      ).not.toBeDefined();

      expect(
        utils.validateLeader('04706cam a2200865Ica4500', '04706dam a2200865nca4500'),
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
        ).toBe('ui-quick-marc.record.error.leader.invalidPositionValue');
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
              Desc: 'i',
            },
          },
          {
            tag: '245',
          },
        ],
      };

      expect(utils.validateMarcRecord({
        marcRecord: record,
        initialValues,
        marcType: MARC_TYPES.BIB,
        locations,
      })).not.toBeDefined();
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

      expect(utils.validateMarcRecord({
        marcRecord: record,
        initialValues,
        marcType: MARC_TYPES.BIB,
        locations,
      })).toBeDefined();
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
              Desc: 'i',
            },
          },
        ],
      };

      expect(utils.validateMarcRecord({
        marcRecord: record,
        initialValues,
        marcType: MARC_TYPES.BIB,
        locations,
      }).props.id).toBe('ui-quick-marc.record.error.title.empty');
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

      expect(utils.validateMarcRecord({
        marcRecord: record,
        initialValues,
        marcType: MARC_TYPES.BIB,
        locations,
      }).props.id).toBe('ui-quick-marc.record.error.title.multiple');
    });

    describe('$9', () => {
      const initialValues = {
        leader: '04706cam a2200865Ii 4500',
        records: [
          {
            content: '04706cam a2200865Ii 4500',
            tag: 'LDR',
          },
          {
            tag: '008',
            content: {
              Desc: 'i',
            },
          },
          {
            tag: '245',
          },
          {
            'tag': '100',
            'content': '$a Chin, Staceyann, $d 1972-2050 $0 http://id.loc.gov/authorities/names/n2008052404 $9 1170f654-61f3-4d54-808b-9375147fb420',
            'indicators': ['1', '\\'],
            'isProtected': false,
            'authorityId': '1170f654-61f3-4d54-808b-9375147fb420',
            'authorityNaturalId': 'n2008052404',
            'authorityControlledSubfields': ['a', 'b', 'c', 'd', 'j', 'q'],
            'id': '6cf6c680-359b-40d8-b93f-7d5ad181d821',
            '_isDeleted': false,
            '_isLinked': true,
            'subfieldGroups': {
              'controlled': '$a Chin, Staceyann, $d 1972-2050',
              'uncontrolledAlpha': '',
              'zeroSubfield': '$0 http://id.loc.gov/authorities/names/n2008052404',
              'nineSubfield': '$9 1170f654-61f3-4d54-808b-9375147fb420',
              'uncontrolledNumber': '',
            },
          },
          {
            'tag': '600',
            'content': '$a Black Panther $c (Fictitious character) $v Comic books, strips, etc.',
            'indicators': [
              '0',
              '0',
            ],
            'isProtected': false,
            'id': '402c0aec-5e1b-49a3-83a2-da788f48b27a',
            '_isDeleted': false,
            '_isLinked': false,
          },
        ],
      };

      const linkingRules = [{ 'bibField': '100' }, { 'bibField': '600' }];
      const stripes = { hasPerm: jest.fn().mockReturnValue(true) };

      describe('when $9 entered to the already linked field', () => {
        it('should return the error', () => {
          const record = cloneDeep(initialValues);

          record.records[3].subfieldGroups.uncontrolledAlpha = '$9 fakeValue';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            linkingRules,
            stripes,
            action: 'edit',
          }).props.id).toBe('ui-quick-marc.record.error.$9.nonRepeatable');
        });
      });

      describe('when $9 entered to the field that can be linked', () => {
        it('should return the error', () => {
          const record = cloneDeep(initialValues);

          record.records[4].content += ' $9 fakeValue';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            linkingRules,
            stripes,
            action: 'edit',
          }).props.id).toBe('ui-quick-marc.record.error.$9');
        });
      });

      describe('when $9 entered to the field that can not be linked', () => {
        it('should return the error', () => {
          const record = cloneDeep(initialValues);

          record.records[2].content += '$9 fakeValue';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            linkingRules,
            stripes,
            action: 'edit',
          }).props.id).toBe('ui-quick-marc.record.error.$9.cannotBeLinked');
        });
      });
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
              content: '$b VA/LI/D',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        })).not.toBeDefined();
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

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        }).props.id).toBe('ui-quick-marc.record.error.location.empty');
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
            {
              tag: '852',
              content: '$b VA/LI/D',
            },
            {
              tag: '852',
              content: '$b VA/LI/D',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        }).props.id).toBe('ui-quick-marc.record.error.location.multiple');
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

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        }).props.id).toBe('ui-quick-marc.record.error.instanceHrid.multiple');
      });

      it('should return error message when record has invalid 852 location', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            { tag: '004' },
            {
              tag: '852',
              content: '$b IN/VA/LI/D',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        }).props.id).toBe('ui-quick-marc.record.error.location.invalid');
      });

      it('should return error message when record is missing 852 location', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            { tag: '004' },
            {
              tag: '852',
              content: '$a',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations,
        }).props.id).toBe('ui-quick-marc.record.error.location.invalid');
      });

      it('should not return error message when record has 852 location', () => {
        const initialValues = { records: [] };
        const locationsWithNumbers = [{ code: 'location.with.numbers.and.symbols123123' }];
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            { tag: '004' },
            {
              tag: '852',
              content: '$b location.with.numbers.and.symbols123123',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.HOLDINGS,
          locations: locationsWithNumbers,
        }))
          .toBe(undefined);
      });
    });

    describe('when record is MARC Authority record', () => {
      it('should not return error message when record is valid', () => {
        const initialValues = { records: [] };
        const location = { search: '' };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            {
              tag: '110',
              content: '$a Record title',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
          location,
        })).not.toBeDefined();
      });

      it('should return error message when record is without 1XX row', () => {
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

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.heading.empty');
      });

      it('should return error message when record has several 1XX rows', () => {
        const initialValues = { records: [] };
        const record = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            {
              tag: '100',
              content: '$a',
            },
            {
              tag: '110',
              content: '$a',
            },
          ],
        };

        expect(utils.validateMarcRecord({
          marcRecord: record,
          initialValues,
          marcType: MARC_TYPES.AUTHORITY,
        }).props.id).toBe('ui-quick-marc.record.error.heading.multiple');
      });

      describe('when authority linked to bib record (linksCount) and authority record is Authorized', () => {
        const linksCount = 1;
        const location = { search: '?authRefType=Authorized' };
        const initialValues = {
          leader: '04706cxm a22008651i 4500',
          records: [
            {
              content: '04706cxm a22008651i 4500',
              tag: 'LDR',
            },
            {
              tag: '110',
              content: '$a Record title',
            },
          ],
        };

        it('should return an error if 1xx tag is changed', () => {
          const record = cloneDeep(initialValues);

          record.records[1].tag = '100';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            marcType: MARC_TYPES.AUTHORITY,
            location,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.change');
        });

        it('should return an error if $t is added to 1xx field', () => {
          const record = cloneDeep(initialValues);

          record.records[1].content += ' $t';

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues,
            marcType: MARC_TYPES.AUTHORITY,
            location,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.add$t');
        });

        it('should return an error if $t is removed from 1xx field', () => {
          const newInitialValues = cloneDeep(initialValues);

          newInitialValues.records[1].content += ' $t some text';

          const record = cloneDeep(initialValues);

          record.records[1].content.replace('$t', '');

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            location,
            linksCount: 1,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.remove$t');
        });

        it('should return an error if $t value is removed from 1xx field', () => {
          const newInitialValues = cloneDeep(initialValues);

          newInitialValues.records[1].content += ' $t some text';

          const record = cloneDeep(initialValues);

          record.records[1].content.replace('some text', '');

          expect(utils.validateMarcRecord({
            marcRecord: record,
            initialValues: newInitialValues,
            marcType: MARC_TYPES.AUTHORITY,
            location,
            linksCount,
          }).props.id).toBe('ui-quick-marc.record.error.1xx.remove$t');
        });
      });
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

      expect(utils.checkDuplicate010Field(formValues.records).props.id).toBe('ui-quick-marc.record.error.010Field.multiple');
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
    it('should return original record if action is not "derive" or "create"', () => {
      const record = {
        records: [{
          tag: '001',
          content: 'some content',
        }],
      };

      expect(utils.formatMarcRecordByQuickMarcAction(record, QUICK_MARC_ACTIONS.EDIT)).toEqual(record);
    });

    it('should return record without 001, 005 and 999ff fields and no updateInfo if action is "derive"', () => {
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

      expect(utils.formatMarcRecordByQuickMarcAction(record, QUICK_MARC_ACTIONS.DERIVE)).toEqual(expectedRecord);
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

  describe('removeFieldsForDerive', () => {
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

    it('should remove fields with empty content', () => {
      const initialValues = {
        records: [{
          tag: '001',
          id: 'id001',
        }],
      };

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

      expect(utils.autopopulateSubfieldSection(record, initialValues)).toEqual(expectedRecord);
    });

    it('should not remove fields when subfield code and subfield value not separated with space', () => {
      const initialValues = {
        records: [{
          tag: '001',
          id: 'id001',
        }],
      };

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

      expect(utils.autopopulateSubfieldSection(record, initialValues)).toEqual(expectedRecord);
    });
  });

  describe('cleanBytesFields', () => {
    it('should return cleaned records', () => {
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
      expect(utils.getContentSubfieldValue('$a Test Title')).toEqual({ $a: 'Test Title' });
    });

    it('should return repeatable subfields as an array', () => {
      expect(utils.getContentSubfieldValue('$a Test Title $b Repeat 1 $b Repeat 2')).toEqual({
        $a: 'Test Title',
        $b: ['Repeat 1', 'Repeat 2'],
      });
    });
  });

  describe('validateLocationSubfield', () => {
    it('should return true for valid location subfield', () => {
      expect(utils.validateLocationSubfield({ content: '$b VA/LI/D ' }, locations)).toBe(true);
    });

    it('should return false for locations that do not exist', () => {
      expect(utils.validateLocationSubfield({ content: '$b NOT/VA/LI/D ' }, locations)).toBe(false);
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
});
