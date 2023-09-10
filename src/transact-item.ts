import {
  ConditionCheck,
  Delete,
  Get,
  Put,
  TransactGetItem,
  TransactWriteItem,
  Update,
} from '@aws-sdk/client-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import * as commands from './commands';
import { Filter } from './expression';

export interface FacadePut extends Put {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

export interface FacadeUpdate extends Update {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

export interface FacadeDelete extends Delete {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

/**
 * Create a map to get one or more items using {@link transactGet}.
 *
 * @param tableName The name of the table that contains the item
 * @param key A map of attribute names to values that specifies the primary key of the item to retrieve
 * @param options The same parameters accepted by the original `TransactGetCommand` items
 * @returns A map in the format `{ Get: { TableName: ..., Key: ... } }`
 */
export function get(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<Get>
): TransactGetItem {
  return {
    Get: {
      TableName: tableName,
      Key: key,
      ...options,
    },
  };
}

/**
 * Create a map for the `ConditionCheck` operation to use {@link transactWrite}.
 *
 * @param tableName The name of the table that should contain the item
 * @param key The primary key of the item to be checked
 * @param condition An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The same parameters accepted by the original `TransactWriteCommand` condition check items
 * @returns A map in the format `{ ConditionCheck: { ... } }`
 */
export function conditionCheck(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  condition: Filter,
  options?: Partial<ConditionCheck>
): Pick<TransactWriteItem, 'ConditionCheck'> {
  const command = commands.buildConditionCheck(
    tableName,
    key,
    condition,
    options
  );

  return {
    ConditionCheck: command as ConditionCheck,
  };
}

/**
 * Create a map for the `Put` operation to use {@link transactWrite}.
 *
 * @param tableName The name of the table to write the item in
 * @param item An object with the item's attributes
 * @param options The same parameters accepted by the original `TransactWriteCommand` put items
 * @returns A map in the format `{ Put: { ... } }`
 */
export function put(
  tableName: string,
  item: Record<string, NativeAttributeValue>,
  options?: Partial<FacadePut>
): Pick<TransactWriteItem, 'Put'> {
  const command = commands.buildPut(tableName, item, options);

  return {
    Put: command as Put,
  };
}

/**
 * Create a map for the `Update` operation to use {@link transactWrite}.
 *
 * @param tableName The name of the table where the item resides
 * @param key The primary key of the item to be updated
 * @param updatedValues A map of attribute name/value pairs with the attributes that must be modified
 * @param options The same parameters accepted by the original `TransactWriteCommand` update items
 * @returns A map in the format `{ Update: { ... } }`
 */
export function update(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  updatedValues: Record<string, NativeAttributeValue>,
  options?: Partial<FacadeUpdate>
): Pick<TransactWriteItem, 'Update'> {
  const command = commands.buildUpdate(tableName, key, updatedValues, options);

  return {
    Update: command as Update,
  };
}

/**
 * Create a map for the `Delete` operation to use {@link transactWrite}.
 *
 * @param tableName The name of the table where the item resides
 * @param key The primary key of the item to be deleted
 * @param options The same parameters accepted by the original `TransactWriteCommand` delete items
 * @returns A map in the format `{ Delete: { ... } }`
 */
export function deleteItem(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<FacadeDelete>
): Pick<TransactWriteItem, 'Delete'> {
  const command = commands.buildDelete(tableName, key, options);

  return {
    Delete: command as Delete,
  };
}
