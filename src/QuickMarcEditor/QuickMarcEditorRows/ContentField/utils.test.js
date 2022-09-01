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

  describe('cursorToNextSubfield', () => {
    let e;

    beforeEach(() => {
      e = {
        preventDefault: jest.fn(),
        target: {
          value: '',
          setSelectionRange: jest.fn(),
        },
      };
    });

    describe('when there is a next subfield', () => {
      it('should move cursor to the beginning of next subfield', () => {
        e.target.value = '$a some value $b some other value';
        e.target.selectionStart = 13; // cursor at `$a some value|`

        utils.cursorToNextSubfield(e);

        expect(e.target.setSelectionRange).toHaveBeenCalledWith(17, 17); // cursor at `$b |some other value`
      });
    });

    describe('when there is no next subfield', () => {
      it('should keep cursor where it is', () => {
        e.target.value = '$a some value $b some other value';
        e.target.selectionStart = 21; // cursor at `$b some| other value`

        utils.cursorToNextSubfield(e);

        expect(e.target.setSelectionRange).not.toHaveBeenCalled();
      });
    });
  });

  describe('cursorToPrevSubfield', () => {
    let e;

    beforeEach(() => {
      e = {
        preventDefault: jest.fn(),
        target: {
          value: '',
          setSelectionRange: jest.fn(),
        },
      };
    });

    describe('when there is a prev subfield', () => {
      it('should move cursor to the beginning of prev subfield', () => {
        e.target.value = '$a some value $b some other value';
        e.target.selectionStart = 21; // cursor at `$b some| other value`

        utils.cursorToPrevSubfield(e);

        expect(e.target.setSelectionRange).toHaveBeenCalledWith(3, 3); // cursor at `$a |some value`
      });
    });

    describe('when there is no prev subfield', () => {
      it('should keep cursor where it is', () => {
        e.target.value = '$a some value $b some other value';
        e.target.selectionStart = 13; // cursor at `$a some value|`

        utils.cursorToPrevSubfield(e);

        expect(e.target.setSelectionRange).not.toHaveBeenCalled();
      });
    });
  });
});
