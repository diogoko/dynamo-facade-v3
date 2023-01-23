import { isObjectEmpty, isObjectNotEmpty, optionalField } from './utils';

describe('isObject*Empty', () => {
  it('handles all empty cases', () => {
    expect(isObjectEmpty(undefined)).toBe(true);
    expect(isObjectEmpty(null)).toBe(true);
    expect(isObjectEmpty(false)).toBe(true);
    expect(isObjectEmpty(0)).toBe(true);
    expect(isObjectEmpty('')).toBe(true);
    expect(isObjectEmpty({})).toBe(true);
    expect(isObjectEmpty({ name: 'Joe' })).toBe(false);
  });

  it('handles all not empty cases', () => {
    expect(isObjectNotEmpty(undefined)).toBe(false);
    expect(isObjectNotEmpty(null)).toBe(false);
    expect(isObjectNotEmpty(false)).toBe(false);
    expect(isObjectNotEmpty(0)).toBe(false);
    expect(isObjectNotEmpty('')).toBe(false);
    expect(isObjectNotEmpty({})).toBe(false);
    expect(isObjectNotEmpty({ name: 'Joe' })).toBe(true);
  });
});

describe('optionalField', () => {
  it('handles falsy values', () => {
    expect(optionalField('test', undefined)).toBeUndefined();
  });

  it('handles truthy values', () => {
    expect(optionalField('test', 30)).toEqual({ test: 30 });
  });

  it('handles falsy values returned by function', () => {
    expect(optionalField('test', [], (x) => x.length > 0)).toBeUndefined();
  });

  it('handles truthy values returned by function', () => {
    expect(optionalField('test', [30], (x) => x.length > 0)).toEqual({
      test: [30],
    });
  });
});
