import * as utils from './utils';

describe('ContentField utils', () => {
  describe('getResizeStyles', () => {
    let getComputedStyleSpy;

    beforeEach(() => {
      getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle');
    });

    afterEach(() => {
      getComputedStyleSpy.mockRestore();
    });

    it('should not calculate styles when element is not passed', () => {
      expect(utils.getResizeStyles()).toEqual({});
    });

    it('should calculate element height', () => {
      getComputedStyleSpy.mockReturnValue({
        borderBottomWidth: '10.5px',
        borderTopWidth: '0.7px',
      });
      const styles = utils.getResizeStyles({ scrollHeight: 10 });

      expect(styles.height).toBe('21.2px');
    });
  });
});
