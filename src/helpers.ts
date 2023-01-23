/* eslint-disable @typescript-eslint/no-explicit-any */
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  BetweenComparison,
  Comparison,
  FunctionComparison,
  InComparison,
  SimpleComparison,
  SizeComparison,
} from './expression';

/**
 * Check if an attribute is different from a value (`<>`).
 *
 * @example
 * ```js
 * df.scan('movies', { genre: ne('terror') })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function ne(value: any) {
  return new SimpleComparison('<>', value);
}

/**
 * Check if an attribute is equal to any value in the list (`IN`).
 *
 * @example
 * ```js
 * df.scan('movies', { genre: inList('terror', 'comedy') })
 * ```
 *
 * @param value The list of values to be searched
 * @returns An object describing the comparison
 */
export function inList(value: any) {
  return new InComparison(value);
}

/**
 * Check if an attribute is less than or equal to a value (`<=`).
 *
 * @example
 * ```js
 * df.scan('movies', { year: le(2000) })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function le(value: any) {
  return new SimpleComparison('<=', value);
}

/**
 * Check if an attribute is less than a value (`<`).
 *
 * @example
 * ```js
 * df.scan('movies', { year: lt(2000) })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function lt(value: any) {
  return new SimpleComparison('<', value);
}

/**
 * Check if an attribute is greater than or equal to a value (`>=`).
 *
 * @example
 * ```js
 * df.scan('movies', { year: ge(2000) })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function ge(value: any) {
  return new SimpleComparison('>=', value);
}

/**
 * Check if an attribute is greater than a value (`>`).
 *
 * @example
 * ```js
 * df.scan('movies', { year: gt(2000) })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function gt(value: any) {
  return new SimpleComparison('>', value);
}

/**
 * Check if an attribute is greater than or equal the first value, and less than or equal to the second value (`BETWEEN`).
 *
 * @example
 * ```js
 * df.scan('movies', { year: between(1995, 2000) })
 * ```
 *
 * @param value1 The first value to be compared to
 * @param value2 The second value to be compared to
 * @returns An object describing the comparison
 */
export function between(value1: any, value2: any) {
  return new BetweenComparison([value1, value2]);
}

/**
 * Check if an attribute is a string that contains a particular substring, or a set that contains a particular element (`contains` function).
 *
 * @example
 * ```js
 * df.scan('movies', { movie: contains('Story') })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function contains(value: any) {
  return new FunctionComparison('contains', value);
}

/**
 * Check if the item contains this attribute (`attribute_exists` function).
 *
 * @example
 * ```js
 * df.scan('movies', { rating: attribute_exists() })
 * ```
 *
 * @returns An object describing the comparison
 */
export function attribute_exists() {
  return new FunctionComparison('attribute_exists');
}

/**
 * Check if the item does not contain this attribute (`attribute_not_exists` function).
 *
 * @example
 * ```js
 * df.scan('movies', { rating: attribute_not_exists() })
 * ```
 *
 * @returns An object describing the comparison
 */
export function attribute_not_exists() {
  return new FunctionComparison('attribute_not_exists');
}

/**
 * Check if an attribute is of a particular data type (`attribute_type` function).
 *
 * @example
 * ```js
 * df.scan('movies', { rating: attribute_type('N') })
 * ```
 *
 * @param type The expected type of the attribute
 * @returns An object describing the comparison
 */
export function attribute_type(type: keyof AttributeValue) {
  return new FunctionComparison('attribute_type', type);
}

/**
 * Check the size of an attribute (`size` function).
 *
 * @example
 * ```js
 * // size(movie) = 15
 * df.scan('movies', { movie: size(15) })
 *
 * // size(movie) >= 20
 * df.scan('movies', { movie: size(ge: (20) })
 * ```
 *
 * @param value The expected size of the attribute
 * @returns An object describing the comparison
 */
export function size(value: number | Comparison) {
  return new SizeComparison(value);
}

/**
 * Check if an attribute begins with a particular substring (`begins_with` function).
 *
 * @example
 * ```js
 * df.scan('movies', { movie: begins_with('The ') })
 * ```
 *
 * @param value The value to be compared to
 * @returns An object describing the comparison
 */
export function begins_with(value: any) {
  return new FunctionComparison('begins_with', value);
}
