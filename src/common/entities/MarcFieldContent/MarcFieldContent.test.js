import { MarcFieldContent } from './MarcFieldContent';

describe('MarcFieldContent', () => {
  const content = '$a a1 $b b1 $b b2 $a a2';

  let marcFieldContent = null;

  beforeEach(() => {
    marcFieldContent = new MarcFieldContent(content);
  });

  describe('when calling `forEach`', () => {
    it('should call the callback with each subfield', () => {
      const cb = jest.fn();

      marcFieldContent.forEach(cb);

      expect(cb).toHaveBeenCalledTimes(4);
      expect(cb.mock.calls[0][0]).toEqual({ code: '$a', value: 'a1' });
      expect(cb.mock.calls[1][0]).toEqual({ code: '$b', value: 'b1' });
      expect(cb.mock.calls[2][0]).toEqual({ code: '$b', value: 'b2' });
      expect(cb.mock.calls[3][0]).toEqual({ code: '$a', value: 'a2' });
    });
  });

  describe('when calling `map`', () => {
    it('should call the callback with each subfield', () => {
      const cb = jest.fn();

      marcFieldContent.map(cb);

      expect(cb).toHaveBeenCalledTimes(4);
      expect(cb.mock.calls[0][0]).toEqual({ code: '$a', value: 'a1' });
      expect(cb.mock.calls[1][0]).toEqual({ code: '$b', value: 'b1' });
      expect(cb.mock.calls[2][0]).toEqual({ code: '$b', value: 'b2' });
      expect(cb.mock.calls[3][0]).toEqual({ code: '$a', value: 'a2' });
    });
  });

  describe('when calling `reduce`', () => {
    it('should call the callback with each subfield', () => {
      const cb = jest.fn().mockImplementation((acc, cur) => [...acc, cur]);

      marcFieldContent.reduce(cb, []);

      expect(cb).toHaveBeenCalledTimes(4);
      expect(cb.mock.calls[0][1]).toEqual({ code: '$a', value: 'a1' });
      expect(cb.mock.calls[1][1]).toEqual({ code: '$b', value: 'b1' });
      expect(cb.mock.calls[2][1]).toEqual({ code: '$b', value: 'b2' });
      expect(cb.mock.calls[3][1]).toEqual({ code: '$a', value: 'a2' });
    });
  });

  describe('when calling `join`', () => {
    it('should transform subfields array back to a string', () => {
      expect(marcFieldContent.join()).toEqual(content);
    });
  });

  describe('when calling `append`', () => {
    it('should add a new subfield to the end', () => {
      marcFieldContent.append('$a', 'a3');

      expect(marcFieldContent.join()).toEqual(`${content} $a a3`);
    });
  });

  describe('when calling `prepend`', () => {
    it('should add a new subfield to the beginning', () => {
      marcFieldContent.prepend('$a', 'a3');

      expect(marcFieldContent.join()).toEqual(`$a a3 ${content}`);
    });
  });

  describe('when calling `removeByCode`', () => {
    it('should remove all subfields by code', () => {
      marcFieldContent.removeByCode('$a');

      expect(marcFieldContent.join()).toEqual('$b b1 $b b2');
    });
  });

  describe('when calling `findAllByCode`', () => {
    it('should return all subfields by code', () => {
      expect(marcFieldContent.findAllByCode('$a')).toEqual([{ code: '$a', value: 'a1' }, { code: '$a', value: 'a2' }]);
    });
  });

  describe('when using a subfield getter', () => {
    it('should return an array of subfields values', () => {
      expect(marcFieldContent.$a).toEqual(['a1', 'a2']);
    });
  });
});
