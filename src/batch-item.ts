import {
  DeleteRequest,
  KeysAndAttributes,
  PutRequest,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

/**
 * Create a map to get one or more items using {@link batchGet}.
 *
 * @param tableName The table where the items will be retrieved from
 * @param key A map with primary key attribute values, or a list of maps of key attributes
 * @param options The same parameters accepted by the original `BatchGetCommand` items
 * @returns A map in the format `{ [tableName]: { Keys: [...] } }`
 */
export function get(
  tableName: string,
  key:
    | Record<string, NativeAttributeValue>
    | Record<string, NativeAttributeValue>[],
  options?: Partial<Omit<KeysAndAttributes, 'Keys'>>
): Record<
  string,
  Omit<KeysAndAttributes, 'Keys'> & {
    Keys: Record<string, NativeAttributeValue>[] | undefined;
  }
> {
  const keyList = Array.isArray(key) ? key : [key];

  return {
    [tableName]: {
      Keys: keyList,
      ...options,
    },
  };
}

/**
 * Create a map to put one or more items in a call to {@link batchWrite}.
 *
 * @param tableName The table where the items will be put
 * @param item A map of attribute names to values, or a list of maps of attributes and values
 * @returns A map in the format `{ tableName: [ { PutRequest: { ... } }, ...] }`
 */
export function put(
  tableName: string,
  item:
    | Record<string, NativeAttributeValue>
    | Record<string, NativeAttributeValue>[]
): Record<
  string,
  (Omit<WriteRequest, 'PutRequest' | 'DeleteRequest'> & {
    PutRequest?: Omit<PutRequest, 'Item'> & {
      Item: Record<string, NativeAttributeValue> | undefined;
    };
    DeleteRequest?: Omit<DeleteRequest, 'Key'> & {
      Key: Record<string, NativeAttributeValue> | undefined;
    };
  })[]
> {
  const itemList = Array.isArray(item) ? item : [item];

  return {
    [tableName]: itemList.map((item) => ({ PutRequest: { Item: item } })),
  };
}

/**
 * Create a map to delete or more items in a call to {@link batchWrite}.
 *
 * @param tableName The table where the items will deleted from
 * @param key A map representing the key of the item to be deleted, or a list of maps of keys to be deleted
 * @returns A map in the format `{ tableName: [ { DeleteRequest: { ... } }, ...] }`
 */
export function deleteItem(
  tableName: string,
  key:
    | Record<string, NativeAttributeValue>
    | Record<string, NativeAttributeValue>[]
): Record<
  string,
  (Omit<WriteRequest, 'PutRequest' | 'DeleteRequest'> & {
    PutRequest?: Omit<PutRequest, 'Item'> & {
      Item: Record<string, NativeAttributeValue> | undefined;
    };
    DeleteRequest?: Omit<DeleteRequest, 'Key'> & {
      Key: Record<string, NativeAttributeValue> | undefined;
    };
  })[]
> {
  const keyList = Array.isArray(key) ? key : [key];

  return {
    [tableName]: keyList.map((key) => ({ DeleteRequest: { Key: key } })),
  };
}
