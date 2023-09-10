import NameProvider from './name-provider';

describe('NameProvider', () => {
  describe('nextName', () => {
    it('should return the name if never seen before', () => {
      const provider = new NameProvider();

      expect(provider.nextUnique('pk')).toEqual('pk');
      expect(provider.nextUnique('abc')).toEqual('abc');
    });

    it('should return the name with 1 if already used', () => {
      const provider = new NameProvider();
      expect(provider.nextUnique('pk')).toEqual('pk');
      expect(provider.nextUnique('abc')).toEqual('abc');

      expect(provider.nextUnique('pk')).toEqual('pk_1');
      expect(provider.nextUnique('abc')).toEqual('abc_1');
    });

    it('should find the next available name if taken', () => {
      const provider = new NameProvider();
      expect(provider.nextUnique('pk')).toEqual('pk');
      expect(provider.nextUnique('pk')).toEqual('pk_1');
      expect(provider.nextUnique('abc_1')).toEqual('abc_1');

      expect(provider.nextUnique('pk')).toEqual('pk_2');
      expect(provider.nextUnique('abc')).toEqual('abc');
      expect(provider.nextUnique('abc')).toEqual('abc_2');

      expect(provider.nextUnique('abc_1')).toEqual('abc_1_1');
    });
  });
});
