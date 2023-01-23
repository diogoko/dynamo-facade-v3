/* eslint-disable @typescript-eslint/no-explicit-any */
export function optionalField<T>(
  name: string,
  value: T,
  hasValue?: (x: T) => boolean
) {
  const effectiveHasValue = hasValue ?? ((x: T) => Boolean(x));
  return effectiveHasValue(value) ? { [name]: value } : undefined;
}

export function isObjectEmpty(x?: any) {
  return !x || Object.keys(x).length === 0;
}

export function isObjectNotEmpty(x?: any) {
  return !isObjectEmpty(x);
}
