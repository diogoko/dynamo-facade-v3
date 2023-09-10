import {
  ConditionCheck,
  Delete,
  DeleteRequest,
  Get,
  KeysAndAttributes,
  Put,
  PutRequest,
  TransactGetItem,
  TransactWriteItem,
  Update,
  WriteRequest,
} from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommandInput,
  BatchWriteCommandInput,
  DeleteCommandInput,
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  TransactGetCommandInput,
  TransactWriteCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import { Filter, buildExpression, buildUpdateExpression } from './expression';
import { isObjectNotEmpty, optionalField } from './utils';

export interface FacadeQueryInput extends QueryCommandInput {
  /**
   * An object describing the comparisons to generate `FilterExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  filter?: Filter;
}

export interface FacadePutItemInput extends PutCommandInput {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

export interface FacadeUpdateItemInput extends UpdateCommandInput {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

export interface FacadeDeleteItemInput extends DeleteCommandInput {
  /**
   * An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   */
  condition?: Filter;
}

/**
 * Create the input parameters for `GetCommand`.
 *
 * @param tableName The name of the table containing the requested item
 * @param key A map of attribute names to values, representing the primary key of the item to retrieve
 * @param options The options accepted by the original `GetCommand` class
 * @returns An object with the input parameters
 */
export function buildGet(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<GetCommandInput>
): GetCommandInput {
  return {
    TableName: tableName,
    Key: key,
    ...options,
  };
}

/**
 * Create the input parameters for `QueryCommand`.
 *
 * @param tableName The name of the table containing the requested items
 * @param keyCondition An object describing the comparisons used to generate `KeyConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The options accepted by the original `QueryCommand` class, plus an optional `filter` field that generates `FilterExpression`
 * @returns An object with the input parameters
 */
export function buildQuery(
  tableName: string,
  keyCondition: Filter,
  options?: Partial<FacadeQueryInput>
): QueryCommandInput {
  const keyConditionInfo = buildExpression(keyCondition);

  const { filter, ...remainingOptions } = options ?? {};
  const filterInfo = buildExpression(filter);

  return {
    TableName: tableName,
    KeyConditionExpression: keyConditionInfo.expression,
    ExpressionAttributeNames: {
      ...keyConditionInfo.names,
      ...filterInfo.names,
    },
    ExpressionAttributeValues: {
      ...keyConditionInfo.values,
      ...filterInfo.values,
    },
    ...optionalField('FilterExpression', filterInfo.expression),
    ...remainingOptions,
  };
}

/**
 * Create the input parameters for `ScanCommand`.
 *
 * @param tableName The name of the table containing the requested items; or, if you provide `IndexName` in the `options`, the name of the table to which that index belongs
 * @param filter An object describing the comparisons used to generate `FilterExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The options accepted by the original `ScanCommand` class
 * @returns An object with the input parameters
 */
export function buildScan(
  tableName: string,
  filter?: Filter,
  options?: Partial<ScanCommandInput>
): ScanCommandInput {
  const filterInfo = buildExpression(filter);

  return {
    TableName: tableName,
    ...optionalField('FilterExpression', filterInfo.expression),
    ...optionalField(
      'ExpressionAttributeNames',
      filterInfo.names,
      isObjectNotEmpty
    ),
    ...optionalField(
      'ExpressionAttributeValues',
      filterInfo.values,
      isObjectNotEmpty
    ),
    ...options,
  };
}

/**
 * Create the input parameters for `PutCommand`.
 *
 * @param tableName The name of the table to contain the item
 * @param item A map of attribute name/value pairs, one for each attribute
 * @param options The options accepted by the original `PutCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns An object with the input parameters
 */
export function buildPut(
  tableName: string,
  item: Record<string, NativeAttributeValue>,
  options?: Partial<FacadePutItemInput>
): PutCommandInput {
  const { condition, ...remainingOptions } = options ?? {};
  const conditionInfo = buildExpression(condition);

  return {
    TableName: tableName,
    Item: item,
    ...optionalField('ConditionExpression', conditionInfo.expression),
    ...optionalField(
      'ExpressionAttributeNames',
      conditionInfo.names,
      isObjectNotEmpty
    ),
    ...optionalField(
      'ExpressionAttributeValues',
      conditionInfo.values,
      isObjectNotEmpty
    ),
    ...remainingOptions,
  };
}

/**
 * Create the input parameters for `UpdateCommand`.
 *
 * @param tableName The name of the table containing the item to update
 * @param key The primary key of the item to be updated
 * @param updatedValues A map of attribute name/value pairs with the attributes that must be modified
 * @param options The options accepted by the original `UpdateCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns An object with the input parameters
 */
export function buildUpdate(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  updatedValues: Record<string, NativeAttributeValue>,
  options?: Partial<FacadeUpdateItemInput>
): UpdateCommandInput {
  const { condition, ...remainingOptions } = options ?? {};
  const conditionInfo = buildExpression(condition);

  const updatedValuesInfo = buildUpdateExpression(updatedValues);

  return {
    TableName: tableName,
    Key: key,
    UpdateExpression: updatedValuesInfo.expression,
    ...optionalField('ConditionExpression', conditionInfo.expression),
    ...optionalField(
      'ExpressionAttributeNames',
      { ...conditionInfo.names, ...updatedValuesInfo.names },
      isObjectNotEmpty
    ),
    ...optionalField(
      'ExpressionAttributeValues',
      { ...conditionInfo.values, ...updatedValuesInfo.values },
      isObjectNotEmpty
    ),
    ...remainingOptions,
  };
}

/**
 * Create the input parameters for `DeleteCommand`.
 *
 * @param tableName The name of the table from which to delete the item
 * @param key A map of attribute names to values, representing the primary key of the item to delete
 * @param options The options accepted by the original `DeleteCommand` class, plus an optional `condition` field that generates `ConditionExpression`
 * @returns An object with the input parameters
 */
export function buildDelete(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  options?: Partial<FacadeDeleteItemInput>
): DeleteCommandInput {
  const { condition, ...remainingOptions } = options ?? {};
  const conditionInfo = buildExpression(condition);

  return {
    TableName: tableName,
    Key: key,
    ...optionalField('ConditionExpression', conditionInfo.expression),
    ...optionalField(
      'ExpressionAttributeNames',
      conditionInfo.names,
      isObjectNotEmpty
    ),
    ...optionalField(
      'ExpressionAttributeValues',
      conditionInfo.values,
      isObjectNotEmpty
    ),
    ...remainingOptions,
  };
}

/**
 * Create a map to build the `ConditionCheck` operation to use {@link transactWrite}.
 *
 * @param tableName The name of the table that should contain the item
 * @param key The primary key of the item to be checked
 * @param condition An object describing the comparisons to generate `ConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
 * @param options The same parameters accepted by the original `TransactWriteCommand` condition check items
 * @returns A map in the format `{ TableName, Key, ... }`
 */
export function buildConditionCheck(
  tableName: string,
  key: Record<string, NativeAttributeValue>,
  condition: Filter,
  options?: Partial<ConditionCheck>
): ConditionCheck {
  const conditionInfo = buildExpression(condition);

  return {
    TableName: tableName,
    Key: key,
    ConditionExpression: conditionInfo.expression,
    ...optionalField(
      'ExpressionAttributeNames',
      conditionInfo.names,
      isObjectNotEmpty
    ),
    ...optionalField(
      'ExpressionAttributeValues',
      conditionInfo.values,
      isObjectNotEmpty
    ),
    ...options,
  };
}

/**
 * Create the input parameters for `TransactGetCommand`.
 *
 * @param transactItems The items to get in the format `[{ Get: { TableName: ..., Key: ... } }, ...]`
 * @param options The options accepted by the original `TransactGetCommand` class
 * @returns An object with the input parameters
 */
export function buildTransactGet(
  transactItems: (Omit<TransactGetItem, 'Get'> & {
    Get:
      | (Omit<Get, 'Key'> & {
          Key: Record<string, NativeAttributeValue> | undefined;
        })
      | undefined;
  })[],
  options?: Partial<TransactGetCommandInput>
): TransactGetCommandInput {
  return {
    TransactItems: transactItems,
    ...options,
  };
}

/**
 * Create the input parameters for `TransactWriteCommand`.
 *
 * @param transactItems The items to write in the format `[ { Put: { ... } }, ...]`
 * @param options The options accepted by the original `TransactWriteCommand` class
 * @returns An object with the input parameters
 */
export function buildTransactWrite(
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
): TransactWriteCommandInput {
  return {
    TransactItems: transactItems,
    ...options,
  };
}

/**
 * Create the input parameters for `BatchGetCommand`.
 *
 * @param requestItems The items to get in the format `{ [tableName]: { Keys: [...] } }`
 * @param options The options accepted by the original `BatchGetCommand` class
 * @returns An object with the input parameters
 */
export function buildBatchGet(
  requestItems: Record<
    string,
    Omit<KeysAndAttributes, 'Keys'> & {
      Keys: Record<string, NativeAttributeValue>[] | undefined;
    }
  >[],
  options?: Partial<BatchGetCommandInput>
): BatchGetCommandInput {
  const mergedItems: Record<string, KeysAndAttributes> = {};

  requestItems.forEach((item) => {
    Object.entries(item).forEach(([tableName, { Keys: keys }]) => {
      if (tableName in mergedItems) {
        mergedItems[tableName].Keys = [
          ...(mergedItems[tableName].Keys ?? []),
          ...(keys ?? []),
        ];
      } else {
        mergedItems[tableName] = {
          Keys: keys,
        };
      }
    });
  });

  return {
    RequestItems: mergedItems,
    ...options,
  };
}

/**
 * Create the input parameters for `BatchWriteCommand`.
 *
 * @param requestItems The items to write in the format `{ tableName: [ { ...request }, ...] }`
 * @param options The options accepted by the original `BatchWriteCommand` command
 * @returns An object with the input parameters
 */
export function buildBatchWrite(
  requestItems: Record<
    string,
    (Omit<WriteRequest, 'PutRequest' | 'DeleteRequest'> & {
      PutRequest?: Omit<PutRequest, 'Item'> & {
        Item: Record<string, NativeAttributeValue> | undefined;
      };
      DeleteRequest?: Omit<DeleteRequest, 'Key'> & {
        Key: Record<string, NativeAttributeValue> | undefined;
      };
    })[]
  >[],
  options?: Partial<BatchWriteCommandInput>
): BatchWriteCommandInput {
  const mergedItems: Record<string, WriteRequest[]> = {};

  requestItems.forEach((item) => {
    Object.entries(item).forEach(([tableName, writeRequests]) => {
      if (tableName in mergedItems) {
        mergedItems[tableName] = [...mergedItems[tableName], ...writeRequests];
      } else {
        mergedItems[tableName] = writeRequests;
      }
    });
  });

  return {
    RequestItems: mergedItems,
    ...options,
  };
}
