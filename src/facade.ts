import * as commands from './commands';
import {
  BatchGetCommand,
  BatchGetCommandInput,
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  TransactGetCommand,
  TransactGetCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  ConditionCheck,
  Delete,
  DynamoDBClient,
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
import { Filter } from './expression';

/**
 * Represents the responses of multiple `query` operations.
 */
export interface MultiQueryOutput {
  $metadata: Array<QueryCommandOutput['$metadata']>;
  ConsumedCapacity: Array<QueryCommandOutput['ConsumedCapacity']>;
  Count: Array<QueryCommandOutput['Count']>;
  Items: Array<QueryCommandOutput['Items']>;
  LastEvaluatedKey: Array<QueryCommandOutput['LastEvaluatedKey']>;
  ScannedCount: Array<QueryCommandOutput['ScannedCount']>;
}

/**
 * Represents the responses of multiple `scan` operations.
 */
export interface MultiScanOutput {
  $metadata: Array<ScanCommandOutput['$metadata']>;
  ConsumedCapacity: Array<ScanCommandOutput['ConsumedCapacity']>;
  Count: Array<ScanCommandOutput['Count']>;
  Items: Array<ScanCommandOutput['Items']>;
  LastEvaluatedKey: Array<ScanCommandOutput['LastEvaluatedKey']>;
  ScannedCount: Array<ScanCommandOutput['ScannedCount']>;
}

/**
 * Facade class for easy access to DynamoDB.
 */
export default class DynamoFacade {
  /**
   * The options used to initialize this object's `DynamoDBClient` instance.
   */
  options: DynamoDBClientConfig;

  /**
   * @param options Options for `DynamoDBClient` initialization
   */
  constructor(options: DynamoDBClientConfig = {}) {
    this.options = options;
  }

  private _client: DynamoDBDocumentClient | null = null;

  /**
   * The `DynamoDBDocumentClient` instance used by the methods of this object.
   *
   * This property is lazily initialized.
   */
  get client() {
    if (!this._client) {
      const rawClient = new DynamoDBClient(this.options);
      this._client = DynamoDBDocumentClient.from(rawClient);
    }
    return this._client;
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
  batchGet(
    requestItems: Record<
      string,
      Omit<KeysAndAttributes, 'Keys'> & {
        Keys: Record<string, NativeAttributeValue>[] | undefined;
      }
    >[],
    options?: Partial<BatchGetCommandInput>
  ) {
    return this.client.send(
      new BatchGetCommand(commands.buildBatchGet(requestItems, options))
    );
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
  batchWrite(
    requestItems: Record<string, WriteRequest[]>[],
    options?: Partial<BatchWriteCommandInput>
  ) {
    return this.client.send(
      new BatchWriteCommand(commands.buildBatchWrite(requestItems, options))
    );
  }

  /**
   * Returns a set of attributes for the item with the given primary key by delegating to `GetCommand`.
   *
   * @param tableName The name of the table containing the requested item
   * @param key A map of attribute names to values, representing the primary key of the item to retrieve
   * @param options The options accepted by the original `GetCommand` class
   * @returns The same response returned by `send()`ing this command
   */
  get(
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    options?: Partial<GetCommandInput>
  ) {
    return this.client.send(
      new GetCommand(commands.buildGet(tableName, key, options))
    );
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
  scan(
    tableName: string,
    filter?: Filter,
    options?: Partial<ScanCommandInput>
  ) {
    return this.client.send(
      new ScanCommand(commands.buildScan(tableName, filter, options))
    );
  }

  /**
   * Repeatedly call `scan` until all paginated results are returned.
   *
   * @param tableName The name of the table containing the requested items; or, if you provide `IndexName` in the `options`, the name of the table to which that index belongs
   * @param filter An object describing the comparisons used to generate `FilterExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   * @param options The options accepted by the original `ScanCommand` method
   * @returns A response object with the same fields of the `scan` response as arrays (one item for each request made)
   */
  async scanAll(
    tableName: string,
    filter?: Filter,
    options?: Partial<ScanCommandInput>
  ) {
    const response: MultiScanOutput = {
      $metadata: [],
      ConsumedCapacity: [],
      Count: [],
      Items: [],
      LastEvaluatedKey: [],
      ScannedCount: [],
    };

    let lastEvaluatedKey: ScanCommandOutput['LastEvaluatedKey'] = undefined;
    let partialResponse: ScanCommandOutput | undefined = undefined;
    do {
      partialResponse = await this.scan(tableName, filter, {
        ...options,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      response.$metadata.push(partialResponse.$metadata);
      response.ConsumedCapacity.push(partialResponse.ConsumedCapacity);
      response.Count.push(partialResponse.Count);
      response.Items.push(partialResponse.Items);
      response.LastEvaluatedKey.push(partialResponse.LastEvaluatedKey);
      response.ScannedCount.push(partialResponse.ScannedCount);

      lastEvaluatedKey = partialResponse.LastEvaluatedKey;
    } while (partialResponse.LastEvaluatedKey);

    return response;
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
  query(
    tableName: string,
    keyCondition: Filter,
    options?: Partial<commands.FacadeQueryInput>
  ) {
    return this.client.send(
      new QueryCommand(commands.buildQuery(tableName, keyCondition, options))
    );
  }

  /**
   * Repeatedly call `query` until all paginated results are returned.
   *
   * @param tableName The name of the table containing the requested items
   * @param keyCondition An object describing the comparisons used to generate `KeyConditionExpression`, `ExpressionAttributeNames`, and `ExpressionAttributeValues`
   * @param options The options accepted by the original `QueryCommand` class, plus an optional `filter` field that generates `FilterExpression`
   * @returns A response object with the same fields of the `query` response as arrays (one item for each request made)
   */
  async queryAll(
    tableName: string,
    keyCondition: Filter,
    options?: Partial<commands.FacadeQueryInput>
  ) {
    const response: MultiQueryOutput = {
      $metadata: [],
      ConsumedCapacity: [],
      Count: [],
      Items: [],
      LastEvaluatedKey: [],
      ScannedCount: [],
    };

    let lastEvaluatedKey: QueryCommandOutput['LastEvaluatedKey'] = undefined;
    let partialResponse: QueryCommandOutput | undefined = undefined;
    do {
      partialResponse = await this.query(tableName, keyCondition, {
        ...options,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      response.$metadata.push(partialResponse.$metadata);
      response.ConsumedCapacity.push(partialResponse.ConsumedCapacity);
      response.Count.push(partialResponse.Count);
      response.Items.push(partialResponse.Items);
      response.LastEvaluatedKey.push(partialResponse.LastEvaluatedKey);
      response.ScannedCount.push(partialResponse.ScannedCount);

      lastEvaluatedKey = partialResponse.LastEvaluatedKey;
    } while (partialResponse.LastEvaluatedKey);

    return response;
  }

  /**
   * Creates a new item, or replaces an old item with a new item by delegating to `PutCommand`.
   *
   * @param tableName The name of the table to contain the item
   * @param item A map of attribute name/value pairs, one for each attribute
   * @param options The options accepted by the original `PutCommand` class, plus an optional `condition` field that generates `ConditionExpression`
   * @returns The same response returned by `send()`ing this command
   */
  put(
    tableName: string,
    item: Record<string, NativeAttributeValue>,
    options?: Partial<commands.FacadePutItemInput>
  ) {
    return this.client.send(
      new PutCommand(commands.buildPut(tableName, item, options))
    );
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
  update(
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    updatedValues: Record<string, NativeAttributeValue>,
    options?: Partial<commands.FacadeUpdateItemInput>
  ) {
    return this.client.send(
      new UpdateCommand(
        commands.buildUpdate(tableName, key, updatedValues, options)
      )
    );
  }

  /**
   * Deletes a single item in a table by primary key by delegating to `DeleteCommand`.
   *
   * @param tableName The name of the table from which to delete the item
   * @param key A map of attribute names to values, representing the primary key of the item to delete
   * @param options The options accepted by the original `DeleteCommand` class, plus an optional `condition` field that generates `ConditionExpression`
   * @returns The same response returned by `send()`ing this command
   */
  deleteItem(
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    options?: Partial<commands.FacadeDeleteItemInput>
  ) {
    return this.client.send(
      new DeleteCommand(commands.buildDelete(tableName, key, options))
    );
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
  transactGet(
    transactItems: (Omit<TransactGetItem, 'Get'> & {
      Get:
        | (Omit<Get, 'Key'> & {
            Key: Record<string, NativeAttributeValue> | undefined;
          })
        | undefined;
    })[],
    options?: Partial<TransactGetCommandInput>
  ) {
    return this.client.send(
      new TransactGetCommand(commands.buildTransactGet(transactItems, options))
    );
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
  transactWrite(
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
    return this.client.send(
      new TransactWriteCommand(
        commands.buildTransactWrite(transactItems, options)
      )
    );
  }
}
