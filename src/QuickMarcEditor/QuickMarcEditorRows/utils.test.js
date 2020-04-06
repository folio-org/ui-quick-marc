import { LEADER_TAG } from '../constants';

import * as utils from './utils';

describe('QuickMarcEditorRows utils', () => {
  describe('isReadOnly', () => {
    it('should be true for record start', () => {
      expect(utils.isReadOnly({ tag: '001' })).toBeTruthy();
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
  });

  describe('hasIndicatorException', () => {
    it('should be true for exeptional row', () => {
      expect(utils.hasIndicatorException({ tag: '001' })).toBeTruthy();
      expect(utils.hasIndicatorException({ tag: LEADER_TAG })).toBeTruthy();
      expect(utils.hasIndicatorException({ tag: '008' })).toBeTruthy();
    });

    it('should be false for exeptional row', () => {
      expect(utils.hasIndicatorException({ tag: '010' })).toBeFalsy();
    });
  });

  describe('hasAddException', () => {
    it('should be true for exeptional row', () => {
      expect(utils.hasAddException({ tag: LEADER_TAG })).toBeTruthy();
      expect(utils.hasAddException({ tag: '001' })).toBeTruthy();
    });

    it('should be false for exeptional row', () => {
      expect(utils.hasAddException({ tag: '010' })).toBeFalsy();
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
  });

  describe('hasMoveException', () => {
    it('should be true for exeptional row', () => {
      expect(utils.hasMoveException({ tag: LEADER_TAG })).toBeTruthy();
      expect(utils.hasMoveException({ tag: '001' })).toBeTruthy();
    });

    it('should be false for exeptional row', () => {
      expect(utils.hasMoveException({ tag: '010' }, { tag: '011' })).toBeFalsy();
    });
  });
});
