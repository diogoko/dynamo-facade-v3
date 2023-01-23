import { attribute_exists, attribute_not_exists } from './helpers';
import * as tr from './transact-item';

describe('conditionCheck', () => {
  it('creates command without options', () => {
    const command = tr.conditionCheck(
      'test',
      { pk: '12345' },
      { pk: attribute_exists(), age: 30 }
    );

    expect(command).toEqual({
      ConditionCheck: {
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
      },
    });
  });

  it('creates command with options', () => {
    const command = tr.conditionCheck(
      'test',
      { pk: '12345' },
      { pk: attribute_exists(), age: 30 },
      { ReturnValuesOnConditionCheckFailure: 'ALL_OLD' }
    );

    expect(command).toEqual({
      ConditionCheck: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#age': 'age',
          '#pk': 'pk',
        },
        ExpressionAttributeValues: {
          ':age': 30,
        },
        ConditionExpression: 'attribute_exists(#pk) and #age = :age',
      },
    });
  });

  it('creates command without attribute values', () => {
    const command = tr.conditionCheck(
      'test',
      { pk: '12345' },
      { pk: attribute_exists() },
      { ReturnValuesOnConditionCheckFailure: 'ALL_OLD' }
    );

    expect(command).toEqual({
      ConditionCheck: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#pk': 'pk',
        },
        ConditionExpression: 'attribute_exists(#pk)',
      },
    });
  });
});

describe('put', () => {
  it('creates command without options', () => {
    const command = tr.put('test', { pk: '12345', name: 'Joe' });

    expect(command).toEqual({
      Put: {
        TableName: 'test',
        Item: {
          pk: '12345',
          name: 'Joe',
        },
      },
    });
  });

  it('creates command with options', () => {
    const command = tr.put(
      'test',
      { pk: '12345', name: 'Joe' },
      { ReturnValuesOnConditionCheckFailure: 'ALL_OLD' }
    );

    expect(command).toEqual({
      Put: {
        TableName: 'test',
        Item: {
          pk: '12345',
          name: 'Joe',
        },
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      },
    });
  });

  it('creates command with condition expression', () => {
    const command = tr.put(
      'test',
      { pk: '12345', name: 'Joe' },
      { condition: { pk: attribute_not_exists(), age: 30 } }
    );

    expect(command).toEqual({
      Put: {
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
      },
    });
  });
});

describe('update', () => {
  it('creates command without options', () => {
    const command = tr.update('test', { pk: '12345' }, { name: 'Joe' });

    expect(command).toEqual({
      Update: {
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
      },
    });
  });

  it('creates command with options', () => {
    const command = tr.update(
      'test',
      { pk: '12345' },
      { name: 'Joe' },
      { ReturnValuesOnConditionCheckFailure: 'ALL_OLD' }
    );

    expect(command).toEqual({
      Update: {
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
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      },
    });
  });

  it('creates command with condition expression', () => {
    const command = tr.update(
      'test',
      { pk: '12345' },
      { name: 'Joe' },
      { condition: { pk: attribute_exists(), age: 30 } }
    );

    expect(command).toEqual({
      Update: {
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
      },
    });
  });
});

describe('delete', () => {
  it('creates command without options', () => {
    const command = tr.deleteItem('test', { pk: '12345' });

    expect(command).toEqual({
      Delete: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
      },
    });
  });

  it('creates command with options', () => {
    const command = tr.deleteItem(
      'test',
      { pk: '12345' },
      { ReturnValuesOnConditionCheckFailure: 'ALL_OLD' }
    );

    expect(command).toEqual({
      Delete: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      },
    });
  });

  it('creates command with condition expression', () => {
    const command = tr.deleteItem(
      'test',
      { pk: '12345' },
      { condition: { pk: attribute_exists(), age: 30 } }
    );

    expect(command).toEqual({
      Delete: {
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
      },
    });
  });
});

describe('get', () => {
  it('creates command without options', () => {
    const command = tr.get('test', { pk: '12345' });

    expect(command).toEqual({
      Get: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
      },
    });
  });

  it('creates command with options', () => {
    const command = tr.get(
      'test',
      { pk: '12345' },
      { ProjectionExpression: 'pk, name, phone' }
    );

    expect(command).toEqual({
      Get: {
        TableName: 'test',
        Key: {
          pk: '12345',
        },
        ProjectionExpression: 'pk, name, phone',
      },
    });
  });
});
