import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from '../constants';
import { MARC_TYPES } from '../../common/constants';

import * as utils from './utils';

describe('QuickMarcEditorRows utils', () => {
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

    it('should be true for MARC holdings tag 004', () => {
      expect(utils.hasAddException({ tag: '004' }, MARC_TYPES.HOLDINGS)).toBeTruthy();
    });
  });

  describe('hasMoveException', () => {
    it('should be true for exeptional row', () => {
      expect(utils.hasMoveException({ tag: LEADER_TAG })).toBeTruthy();
    });

    it('should be false for 0XX fields', () => {
      expect(utils.hasMoveException({ tag: '001' }, { tag: '005' })).toBeFalsy();
    });

    it('should be false for common rows', () => {
      expect(utils.hasMoveException({ tag: '010' }, { tag: '011' })).toBeFalsy();
    });
  });
});
