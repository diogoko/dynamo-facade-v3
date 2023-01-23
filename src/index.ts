import {
  ConditionCheck,
  Delete,
  DynamoDBClientConfig,
  Get,
  KeysAndAttributes,
  Put,
  TransactGetItem,
  TransactWriteItem,
  Update,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import {
  BatchGetCommandInput,
  BatchWriteCommandInput,
  GetCommandInput,
  ScanCommandInput,
  TransactGetCommandInput,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import * as commands from './commands';
import DynamoFacade from './facade';

/**
 * Default options for `DynamoDBClient` initialization when calling this module's functions.
 *
 * After the first call to one of these functions, new changes to the defaults are ignored.
 */
export const defaults: DynamoDBClientConfig = {};

let _facade: DynamoFacade;
function facade() {
  if (!_facade) {
    _facade = new DynamoFacade(defaults);
  }
  return _facade;
}

/**
 * Returns the attributes of one or more items from one or more tables by delegating to `BatchGetCommand`.
 *
 * You can use the {@link batchItem} helper to create the request items.
 *
 * @example
 * ```js
 * import { batchItem as bi } from 'dynamo-facade-v3';
 *
 * // These two are equivalent
 * df.batchGet([
 *   bi.get('movies', { actor: 'Tom Hanks', movie: 'Toy Story' }),
 *   bi.get('movies', { actor: 'Tom Hanks', movie: 'Forrest Gump' }),
 * ])
 *
 * df.batchGet([
 *   bi.get('movies', [
 *     { actor: 'Tom Hanks', movie: 'Toy Story' },
 *     { actor: 'Tom Hanks', movie: 'Forrest Gump' },
 *   ])
 * ])
 * ```
 *
 * @param requestItems The items to get in the format `{ [tableName]: { Keys: [...] } }`
 * @param options The options accepted by the original `BatchGetCommand` class
 * @returns The same response returned by `send()`ing this command
 */
export function batchGet(
  requestItems: Record<
    string,
    Omit<KeysAndAttributes, 'Keys'> & {
      Keys: Record<string, NativeAttributeValue>[] | undefined;
    }
  >[],
  options?: Partial<BatchGetCommandInput>
) {
  return facade().batchGet(requestItems, options);
}

/**
 * Puts or deletes multiple items in one or more tables by delegating to `BatchWriteCommand`.
 *
 * You can use the {@link batchItem} helper to create the request items.
 *
 * @example
 * ```js
 * import { batchItem as bi } from 'dynamo-facade-v3';
 *
 * df.batchWrite([
 *   bi.put('movies', [
 *     { actor: 'Tom Hanks', movie: 'Toy Story' },
 *     { actor: 'Tom Hanks', movie: 'Forrest Gump' },
 *   ])
 * ])
 * ```
 *
 * @param requestItems The items to write in the format `{ tableName: [ { ...request }, ...] }`
 * @param options The options accepted by the original `BatchWriteCommand` class
 * @returns The same response returned by `send()`ing this command
 */
export function batchWrite(
  requestItems: Record<string, WriteRequest[]>[],
  options?: Partial<BatchWriteCommandInput>
) {
  return facade().batchWrite(requestItems, options);
}

/**
 * Returns a set of attributes for the item with the given primary key by delegating to `GetCommand`.
 *
 * @param tableName The name of the table containing the requested item
 * @param key A map of attribute names to values, representing the primary key of the item to retrieve
 * @param options The options accepted by the original `GetCommand` class
 * @returns The same response returned by `send()`ing this command
 */
export function get(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<GetCommandInput>
) {
  return facade().get(tableName, key, options);
}

/**
 * Returns one or more items and item attributes by accessing every item in a table or a secondary index by delegating to `ScanCommand`.
 *
 * @example
 * ```js
 * df.scan('movies', { actor: 'Tom Hanks' })
 * ```
 *
 * @param tableName The name of the table containing the requested items; or, if you provide `IndexName` in the `options`, the name of the table to which that index belongs
 * @param filter An object describing the comparisons used to generate `FilterExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The options accepted by the original `ScanCommand` method
 * @returns The same response returned by `send()`ing this command
 */
export function scan(
  tableName: string,
  filter?: Record<string, NativeAttributeValue>,
  options?: Partial<ScanCommandInput>
) {
  return facade().scan(tableName, filter, options);
}

/**
 * Directly access items from a table by primary key or a secondary index by delegating to `QueryCommand`.
 *
 * @example
 * ```js
 * df.query('movies', { actor: 'Tom Hanks', movie: 'Toy Story' })
 * ```
 *
 * @param tableName The name of the table containing the requested items
 * @param keyCondition An object describing the comparisons used to generate `KeyConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The options accepted by the original `QueryCommand` class, plus an optional `filter` field that generates `FilterExpression`
 * @returns The same response returned by `send()`ing this command
 */
export function query(
  tableName: string,
  keyCondition: Record<string, NativeAttributeValue>,
  options?: Partial<commands.FacadeQueryInput>
) {
  return facade().query(tableName, keyCondition, options);
}

/**
 * Creates a new item, or replaces an old item with a new item by delegating to `PutCommand`.
 *
 * @param tableName The name of the table to contain the item
 * @param item A map of attribute name/value pairs, one for each attribute
 * @param options The options accepted by the original `PutCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns The same response returned by `send()`ing this command
 */
export function put(
  tableName: string,
  item: Record<string, NativeAttributeValue>,
  options?: Partial<commands.FacadePutItemInput>
) {
  return facade().put(tableName, item, options);
}

/**
 * Edits an existing item's attributes, or adds a new item to the table if it does not already exist by delegating to `UpdateCommand`.
 *
 * @param tableName The name of the table containing the item to update
 * @param key The primary key of the item to be updated
 * @param updatedValues A map of attribute name/value pairs with the attributes that must be modified
 * @param options The options accepted by the original `UpdateCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns The same response returned by `send()`ing this command
 */
export function update(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  updatedValues: Record<string, NativeAttributeValue>,
  options?: Partial<commands.FacadeUpdateItemInput>
) {
  return facade().update(tableName, key, updatedValues, options);
}

/**
 * Deletes a single item in a table by primary key by delegating to `DeleteCommand`.
 *
 * @param tableName The name of the table from which to delete the item
 * @param key A map of attribute names to values, representing the primary key of the item to delete
 * @param options The options accepted by the original `DeleteCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns The same response returned by `send()`ing this command
 */
export function deleteItem(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<commands.FacadeDeleteItemInput>
) {
  return facade().deleteItem(tableName, key, options);
}

/**
 * Atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and region by delegating to `TransactGetCommand`.
 *
 * You can use the {@link transactItem} helper to create the request items.
 *
 * @example
 * ```js
 * import { transactItem as tr } from 'dynamo-facade-v3';
 *
 * df.transactGet([
 *   tr.get('movies', { actor: 'Tom Hanks', movie: 'Toy Story' }
 * ])
 * ```
 *
 * @param transactItems The items to get in the format `[{ Get: { TableName: ..., Key: ... } }, ...]`
 * @param options The options accepted by the original `TransactGetCommand` class
 * @returns The same response returned by `send()`ing this command
 */
export function transactGet(
  transactItems: (Omit<TransactGetItem, 'Get'> & {
    Get:
      | (Omit<Get, 'Key'> & {
          Key: Record<string, NativeAttributeValue> | undefined;
        })
      | undefined;
  })[],
  options?: Partial<TransactGetCommandInput>
) {
  return facade().transactGet(transactItems, options);
}

/**
 * Synchronous write operation that groups up to 25 action requests by delegating to `TransactWriteCommand`.
 *
 * You can use the {@link transactItem} helper to create the request items.
 *
 * @example
 * ```js
 * import { transactItem as tr } from 'dynamo-facade-v3';
 *
 * df.transactWrite([
 *   tr.put('movies', { actor: 'Tom Hanks', movie: 'Toy Story' }
 * ])
 * ```
 *
 * @param transactItems The items to write in the format `[ { Put: { ... } }, ...]`
 * @param options The options accepted by the original `TransactWriteCommand` class
 * @returns The same response returned by `send()`ing this command
 */
export function transactWrite(
  transactItems: (Omit<
    TransactWriteItem,
    'ConditionCheck' | 'Put' | 'Delete' | 'Update'
  > & {
    ConditionCheck?: Omit<
      ConditionCheck,
      'Key' | 'ExpressionAttributeValues'
    > & {
      Key: Record<string, NativeAttributeValue> | undefined;
      ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
    };
    Put?: Omit<Put, 'Item' | 'ExpressionAttributeValues'> & {
      Item: Record<string, NativeAttributeValue> | undefined;
      ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
    };
    Delete?: Omit<Delete, 'Key' | 'ExpressionAttributeValues'> & {
      Key: Record<string, NativeAttributeValue> | undefined;
      ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
    };
    Update?: Omit<Update, 'Key' | 'ExpressionAttributeValues'> & {
      Key: Record<string, NativeAttributeValue> | undefined;
      ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
    };
  })[],
  options?: Partial<TransactWriteCommandInput>
) {
  return facade().transactWrite(transactItems, options);
}

export {
  attribute_exists,
  attribute_not_exists,
  attribute_type,
  begins_with,
  between,
  contains,
  ge,
  gt,
  inList,
  le,
  lt,
  ne,
  size,
} from './helpers';

export * as transactItem from './transact-item';

export * as batchItem from './batch-item';

export * as commands from './commands';

export { default as DynamoFacade } from './facade';
