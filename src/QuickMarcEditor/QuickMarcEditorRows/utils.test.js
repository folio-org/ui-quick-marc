import { LEADER_TAG } from '../constants';

import * as utils from './utils';

describe('QuickMarcEditorRows utils', () => {
  describe('isReadOnly', () => {
    it('should be true for record leader', () => {
      expect(utils.isReadOnly({ tag: LEADER_TAG })).toBeTruthy();
    });

    it('should be true for record start', () => {
      expect(utils.isReadOnly({ tag: '001' })).toBeTruthy();
    });

    it('should be true for record end', () => {
      expect(utils.isReadOnly({ tag: '999' })).toBeTruthy();
    });

    it('should be false for record rows', () => {
      expect(utils.isReadOnly({ tag: '002' })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '050' })).toBeFalsy();
      expect(utils.isReadOnly({ tag: '998' })).toBeFalsy();
    });
  });

  describe('hasIndicatorException', () => {
    it('shoul be true for exeptional row', () => {
      expect(utils.isReadOnly({ tag: '001' })).toBeTruthy();
      expect(utils.isReadOnly({ tag: LEADER_TAG })).toBeTruthy();
    });

    it('shoul be false for exeptional row', () => {
      expect(utils.isReadOnly({ tag: '010' })).toBeFalsy();
    });
  });

  describe('isAddException', () => {
    it('shoul be true for exeptional row', () => {
      expect(utils.isAddException({ tag: LEADER_TAG })).toBeTruthy();
      expect(utils.isAddException({ tag: '001' })).toBeTruthy();
    });

    it('shoul be false for exeptional row', () => {
      expect(utils.isAddException({ tag: '010' })).toBeFalsy();
    });
  });
});
