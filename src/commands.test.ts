import * as commands from './commands';
import {
  attribute_exists,
  attribute_not_exists,
  begins_with,
  gt,
} from './helpers';
import * as transactItem from './transact-item';
import * as batchItem from './batch-item';

describe('buildGet', () => {
  it('creates command without options', () => {
    const command = commands.buildGet('test', { pk: '12345' });

    expect(command).toEqual({
      TableName: 'test',
      Key: { pk: '12345' },
    });
  });

  it('creates command without options', () => {
    const command = commands.buildGet(
      'test',
      { pk: '12345' },
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: { pk: '12345' },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });
});

describe('buildQuery', () => {
  it('creates command without options', () => {
    const command = commands.buildQuery('test', { pk: '12345' });

    expect(command).toEqual({
      TableName: 'test',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':pk': '12345',
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildQuery(
      'test',
      { pk: '12345' },
      { ExclusiveStartKey: { pk: '12000' } }
    );

    expect(command).toEqual({
      TableName: 'test',
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':pk': '12345',
      },
      ExclusiveStartKey: { pk: '12000' },
    });
  });

  it('creates command with filter', () => {
    const command = commands.buildQuery(
      'test',
      { pk: '12345' },
      { filter: { age: gt(20) } }
    );

    expect(command).toEqual({
      TableName: 'test',
      KeyConditionExpression: '#pk = :pk',
      FilterExpression: '#age > :age',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#age': 'age',
      },
      ExpressionAttributeValues: {
        ':pk': '12345',
        ':age': 20,
      },
    });
  });

  it('creates command with complex key condition', () => {
    const command = commands.buildQuery('test', {
      pk: '12345',
      sk: begins_with('#CLIENTINFO'),
    });

    expect(command).toEqual({
      TableName: 'test',
      KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk',
      },
      ExpressionAttributeValues: {
        ':pk': '12345',
        ':sk': '#CLIENTINFO',
      },
    });
  });
});

describe('buildScan', () => {
  it('creates command without options', () => {
    const command = commands.buildScan('test', { name: 'Joe' });

    expect(command).toEqual({
      TableName: 'test',
      FilterExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': 'Joe',
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildScan(
      'test',
      { name: 'Joe' },
      { ExclusiveStartKey: { pk: '12000' } }
    );

    expect(command).toEqual({
      TableName: 'test',
      FilterExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': 'Joe',
      },
      ExclusiveStartKey: { pk: '12000' },
    });
  });

  it('creates command with filter without values', () => {
    const command = commands.buildScan('test', { name: attribute_exists() });

    expect(command).toEqual({
      TableName: 'test',
      FilterExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
    });
  });

  it('creates command without filter', () => {
    const command = commands.buildScan('test', {});

    expect(command).toEqual({
      TableName: 'test',
    });
  });
});

describe('put', () => {
  it('creates command without options', () => {
    const command = commands.buildPut('test', { pk: '12345', name: 'Joe' });

    expect(command).toEqual({
      TableName: 'test',
      Item: {
        pk: '12345',
        name: 'Joe',
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildPut(
      'test',
      { pk: '12345', name: 'Joe' },
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TableName: 'test',
      Item: {
        pk: '12345',
        name: 'Joe',
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with condition expression', () => {
    const command = commands.buildPut(
      'test',
      { pk: '12345', name: 'Joe' },
      { condition: { pk: attribute_not_exists(), age: 30 } }
    );

    expect(command).toEqual({
      TableName: 'test',
      Item: {
        pk: '12345',
        name: 'Joe',
      },
      ConditionExpression: 'attribute_not_exists(#pk) and #age = :age',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#age': 'age',
      },
      ExpressionAttributeValues: {
        ':age': 30,
      },
    });
  });
});

describe('update', () => {
  it('creates command without options', () => {
    const command = commands.buildUpdate(
      'test',
      { pk: '12345' },
      { name: 'Joe' }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
      UpdateExpression: 'set #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': 'Joe',
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildUpdate(
      'test',
      { pk: '12345' },
      { name: 'Joe' },
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
      UpdateExpression: 'set #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': 'Joe',
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with condition expression', () => {
    const command = commands.buildUpdate(
      'test',
      { pk: '12345' },
      { name: 'Joe' },
      { condition: { pk: attribute_exists(), age: 30 } }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
      UpdateExpression: 'set #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#age': 'age',
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':name': 'Joe',
        ':age': 30,
      },
      ConditionExpression: 'attribute_exists(#pk) and #age = :age',
    });
  });
});

describe('delete', () => {
  it('creates command without options', () => {
    const command = commands.buildDelete('test', { pk: '12345' });

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildDelete(
      'test',
      { pk: '12345' },
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with condition expression', () => {
    const command = commands.buildDelete(
      'test',
      { pk: '12345' },
      { condition: { pk: attribute_exists(), age: 30 } }
    );

    expect(command).toEqual({
      TableName: 'test',
      Key: {
        pk: '12345',
      },
      ExpressionAttributeNames: {
        '#age': 'age',
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':age': 30,
      },
      ConditionExpression: 'attribute_exists(#pk) and #age = :age',
    });
  });
});

describe('transactGet', () => {
  it('creates command without options', () => {
    const command = commands.buildTransactGet([
      transactItem.get('test', { pk: '12345' }),
    ]);

    expect(command).toEqual({
      TransactItems: [
        {
          Get: {
            TableName: 'test',
            Key: { pk: '12345' },
          },
        },
      ],
    });
  });

  it('creates command with options', () => {
    const command = commands.buildTransactGet(
      [transactItem.get('test', { pk: '12345' })],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TransactItems: [
        {
          Get: {
            TableName: 'test',
            Key: { pk: '12345' },
          },
        },
      ],
      ReturnConsumedCapacity: 'TOTAL',
    });
  });
});

describe('transactWrite', () => {
  it('creates command without options', () => {
    const command = commands.buildTransactWrite([
      transactItem.put('test', { name: 'Joe' }),
    ]);

    expect(command).toEqual({
      TransactItems: [
        {
          Put: {
            TableName: 'test',
            Item: { name: 'Joe' },
          },
        },
      ],
    });
  });

  it('creates command with options', () => {
    const command = commands.buildTransactWrite(
      [transactItem.put('test', { name: 'Joe' })],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      TransactItems: [
        {
          Put: {
            TableName: 'test',
            Item: { name: 'Joe' },
          },
        },
      ],
      ReturnConsumedCapacity: 'TOTAL',
    });
  });
});

describe('batchGet', () => {
  it('creates command without options', () => {
    const command = commands.buildBatchGet([
      batchItem.get('test', { pk: '12345' }),
    ]);

    expect(command).toEqual({
      RequestItems: {
        test: {
          Keys: [{ pk: '12345' }],
        },
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildBatchGet(
      [batchItem.get('test', { pk: '12345' })],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: {
          Keys: [{ pk: '12345' }],
        },
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with multiple tables', () => {
    const command = commands.buildBatchGet(
      [
        batchItem.get('test', { pk: '12345' }),
        batchItem.get('other-table', { pk: '98765' }),
      ],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: {
          Keys: [{ pk: '12345' }],
        },
        'other-table': {
          Keys: [{ pk: '98765' }],
        },
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with multiple keys', () => {
    const command = commands.buildBatchGet(
      [batchItem.get('test', [{ pk: '12345' }, { pk: '98765' }])],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: {
          Keys: [{ pk: '12345' }, { pk: '98765' }],
        },
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('merges commands for the same table', () => {
    const command = commands.buildBatchGet(
      [
        batchItem.get('test', { pk: '12345' }),
        batchItem.get('other-table', { pk: '98765' }),
        batchItem.get('test', [{ pk: '234567' }, { pk: '098765' }]),
      ],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: {
          Keys: [{ pk: '12345' }, { pk: '234567' }, { pk: '098765' }],
        },
        'other-table': {
          Keys: [{ pk: '98765' }],
        },
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });
});

describe('batchWrite', () => {
  it('creates command without options', () => {
    const command = commands.buildBatchWrite([
      batchItem.put('test', { pk: '12345', name: 'Joe' }),
    ]);

    expect(command).toEqual({
      RequestItems: {
        test: [
          {
            PutRequest: {
              Item: { pk: '12345', name: 'Joe' },
            },
          },
        ],
      },
    });
  });

  it('creates command with options', () => {
    const command = commands.buildBatchWrite(
      [batchItem.deleteItem('test', { pk: '12345' })],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: [
          {
            DeleteRequest: {
              Key: { pk: '12345' },
            },
          },
        ],
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with multiple tables', () => {
    const command = commands.buildBatchWrite(
      [
        batchItem.put('test', { pk: '12345', name: 'Joe' }),
        batchItem.deleteItem('other-table', { pk: '98765' }),
      ],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: [
          {
            PutRequest: {
              Item: { pk: '12345', name: 'Joe' },
            },
          },
        ],
        'other-table': [
          {
            DeleteRequest: {
              Key: { pk: '98765' },
            },
          },
        ],
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('creates command with multiple keys', () => {
    const command = commands.buildBatchWrite(
      [batchItem.deleteItem('test', [{ pk: '12345' }, { pk: '98765' }])],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: [
          {
            DeleteRequest: {
              Key: { pk: '12345' },
            },
          },
          {
            DeleteRequest: {
              Key: { pk: '98765' },
            },
          },
        ],
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });

  it('merges commands for the same table', () => {
    const command = commands.buildBatchWrite(
      [
        batchItem.deleteItem('test', { pk: '12345' }),
        batchItem.deleteItem('other-table', { pk: '98765' }),
        batchItem.put('test', [
          { pk: '234567', name: 'Joe' },
          { pk: '098765', name: 'Mary' },
        ]),
        batchItem.deleteItem('test', { pk: '54637' }),
      ],
      { ReturnConsumedCapacity: 'TOTAL' }
    );

    expect(command).toEqual({
      RequestItems: {
        test: [
          {
            DeleteRequest: {
              Key: { pk: '12345' },
            },
          },
          {
            PutRequest: {
              Item: { pk: '234567', name: 'Joe' },
            },
          },
          {
            PutRequest: {
              Item: { pk: '098765', name: 'Mary' },
            },
          },
          {
            DeleteRequest: {
              Key: { pk: '54637' },
            },
          },
        ],
        'other-table': [
          {
            DeleteRequest: {
              Key: { pk: '98765' },
            },
          },
        ],
      },
      ReturnConsumedCapacity: 'TOTAL',
    });
  });
});
