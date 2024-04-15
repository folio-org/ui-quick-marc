import {
  LEADER_TAG,
  QUICK_MARC_ACTIONS,
} from '../constants';

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
  });

  describe('hasMoveException', () => {
    describe('when field is LEADER', () => {
      it('should return true', () => {
        const field = { tag: LEADER_TAG };
        const sibling = { tag: '245' };

        expect(utils.hasMoveException(field, sibling, QUICK_MARC_ACTIONS.EDIT)).toBeTruthy();
      });
    });

    describe('when sibling is null', () => {
      it('should return true', () => {
        const field = { tag: '245' };

        expect(utils.hasMoveException(field, null, QUICK_MARC_ACTIONS.EDIT)).toBeTruthy();
      });
    });

    describe('when action is edit', () => {
      const sibling = { tag: '245' };

      describe('when field is 00X', () => {
        it('should return false', () => {
          const field = { tag: '005' };

          expect(utils.hasMoveException(field, sibling, QUICK_MARC_ACTIONS.EDIT)).toBeFalsy();
        });
      });

      describe('when field is 999ff', () => {
        it('should return false', () => {
          const field = { tag: '999', indicators: ['f', 'f'] };

          expect(utils.hasMoveException(field, sibling, QUICK_MARC_ACTIONS.EDIT)).toBeFalsy();
        });
      });

      describe('when field is 999', () => {
        it('should return false', () => {
          const field = { tag: '999', indicators: ['\\', '\\'] };

          expect(utils.hasMoveException(field, sibling, QUICK_MARC_ACTIONS.EDIT)).toBeFalsy();
        });
      });

      describe('when field is any other content field', () => {
        it('should return false', () => {
          const field = { tag: '245' };

          expect(utils.hasMoveException(field, sibling, QUICK_MARC_ACTIONS.EDIT)).toBeFalsy();
        });
      });

      describe('when sibling field can be moved', () => {
        it('should return false', () => {
          const field = { tag: '245' };
          const _sibling = { tag: '005' };

          expect(utils.hasMoveException(field, _sibling, QUICK_MARC_ACTIONS.EDIT)).toBeFalsy();
        });
      });

      describe('when sibling field cannot be moved', () => {
        it('should return true', () => {
          const field = { tag: '245' };
          const _sibling = { tag: LEADER_TAG };

          expect(utils.hasMoveException(field, _sibling, QUICK_MARC_ACTIONS.EDIT)).toBeTruthy();
        });
      });
    });

    describe.each([QUICK_MARC_ACTIONS.CREATE, QUICK_MARC_ACTIONS.DERIVE])('when action is %s', (action) => {
      const sibling = { tag: '245' };

      describe('when field is 001', () => {
        it('should return false', () => {
          const field = { tag: '001' };

          expect(utils.hasMoveException(field, sibling, action)).toBeTruthy();
        });
      });

      describe('when field is 005', () => {
        it('should return false', () => {
          const field = { tag: '005' };

          expect(utils.hasMoveException(field, sibling, action)).toBeTruthy();
        });
      });

      describe('when field is other 00X', () => {
        it('should return false', () => {
          const field = { tag: '002' };

          expect(utils.hasMoveException(field, sibling, action)).toBeFalsy();
        });
      });

      describe('when field is 999ff', () => {
        it('should return false', () => {
          const field = { tag: '999', indicators: ['f', 'f'] };

          expect(utils.hasMoveException(field, sibling, action)).toBeTruthy();
        });
      });

      describe('when field is 999', () => {
        it('should return false', () => {
          const field = { tag: '999', indicators: ['\\', '\\'] };

          expect(utils.hasMoveException(field, sibling, action)).toBeFalsy();
        });
      });

      describe('when field is any other content field', () => {
        it('should return false', () => {
          const field = { tag: '245' };

          expect(utils.hasMoveException(field, sibling, action)).toBeFalsy();
        });
      });

      describe('when sibling field can be moved', () => {
        it('should return false', () => {
          const field = { tag: '245' };
          const _sibling = { tag: '002' };

          expect(utils.hasMoveException(field, _sibling, action)).toBeFalsy();
        });
      });

      describe('when sibling field cannot be moved', () => {
        it('should return true', () => {
          const field = { tag: '245' };
          const _sibling = { tag: LEADER_TAG };

          expect(utils.hasMoveException(field, _sibling, action)).toBeTruthy();
        });
      });
    });
  });
});
