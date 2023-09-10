/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamoFacade from './facade';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const mockSend = jest.fn();

jest.spyOn(DynamoDBDocumentClient, 'from').mockReturnValue({
  send(...args: unknown[]) {
    return mockSend(...args);
  },
} as any);

const facade = new DynamoFacade();

describe('queryAll', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('handles empty result', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 0,
      Items: [],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });

    const result = await facade.queryAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }],
      ConsumedCapacity: [{ TableName: 'test' }],
      Count: [0],
      Items: [[]],
      LastEvaluatedKey: [undefined],
      ScannedCount: [0],
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles one page', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: undefined,
      ScannedCount: 3,
    });

    const result = await facade.queryAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }],
      ConsumedCapacity: [{ TableName: 'test' }],
      Count: [3],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
      ],
      LastEvaluatedKey: [undefined],
      ScannedCount: [3],
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles multiple pages', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're2' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 2,
      Items: [
        { pk: 'pk4', name: 'Susan' },
        { pk: 'pk5', name: 'Zod' },
      ],
      LastEvaluatedKey: undefined,
      ScannedCount: 2,
    });

    const result = await facade.queryAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }, { requestId: 're2' }],
      ConsumedCapacity: [{ TableName: 'test' }, { TableName: 'test' }],
      Count: [3, 2],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
        [
          { pk: 'pk4', name: 'Susan' },
          { pk: 'pk5', name: 'Zod' },
        ],
      ],
      LastEvaluatedKey: [{ pk: 'pk3' }, undefined],
      ScannedCount: [3, 2],
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles errors in the first page', async () => {
    mockSend.mockRejectedValueOnce(new Error('random error'));

    try {
      await facade.queryAll('test', { pk: 'pk1' });
      throw new Error('Should never get here');
    } catch (error: any) {
      expect(error.message).toEqual('random error');
    }

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles errors in other pages', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockRejectedValueOnce(new Error('random error'));

    try {
      await facade.queryAll('test', { pk: 'pk1' });
      throw new Error('Should never get here');
    } catch (error: any) {
      expect(error.message).toEqual('random error');
    }

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles empty last page', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're2' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 0,
      Items: [],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });

    const result = await facade.queryAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }, { requestId: 're2' }],
      ConsumedCapacity: [{ TableName: 'test' }, { TableName: 'test' }],
      Count: [3, 0],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
        [],
      ],
      LastEvaluatedKey: [{ pk: 'pk3' }, undefined],
      ScannedCount: [3, 0],
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          KeyConditionExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });
});

describe('scanAll', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('handles empty result', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 0,
      Items: [],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });

    const result = await facade.scanAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }],
      ConsumedCapacity: [{ TableName: 'test' }],
      Count: [0],
      Items: [[]],
      LastEvaluatedKey: [undefined],
      ScannedCount: [0],
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles one page', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: undefined,
      ScannedCount: 3,
    });

    const result = await facade.scanAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }],
      ConsumedCapacity: [{ TableName: 'test' }],
      Count: [3],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
      ],
      LastEvaluatedKey: [undefined],
      ScannedCount: [3],
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles multiple pages', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're2' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 2,
      Items: [
        { pk: 'pk4', name: 'Susan' },
        { pk: 'pk5', name: 'Zod' },
      ],
      LastEvaluatedKey: undefined,
      ScannedCount: 2,
    });

    const result = await facade.scanAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }, { requestId: 're2' }],
      ConsumedCapacity: [{ TableName: 'test' }, { TableName: 'test' }],
      Count: [3, 2],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
        [
          { pk: 'pk4', name: 'Susan' },
          { pk: 'pk5', name: 'Zod' },
        ],
      ],
      LastEvaluatedKey: [{ pk: 'pk3' }, undefined],
      ScannedCount: [3, 2],
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles errors in the first page', async () => {
    mockSend.mockRejectedValueOnce(new Error('random error'));

    try {
      await facade.scanAll('test', { pk: 'pk1' });
      throw new Error('Should never get here');
    } catch (error: any) {
      expect(error.message).toEqual('random error');
    }

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles errors in other pages', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockRejectedValueOnce(new Error('random error'));

    try {
      await facade.scanAll('test', { pk: 'pk1' });
      throw new Error('Should never get here');
    } catch (error: any) {
      expect(error.message).toEqual('random error');
    }

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });

  it('handles empty last page', async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're1' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 3,
      Items: [
        { pk: 'pk1', name: 'John' },
        { pk: 'pk2', name: 'Ted' },
        { pk: 'pk3', name: 'Mary' },
      ],
      LastEvaluatedKey: { pk: 'pk3' },
      ScannedCount: 3,
    });
    mockSend.mockResolvedValueOnce({
      $metadata: { requestId: 're2' },
      ConsumedCapacity: { TableName: 'test' },
      Count: 0,
      Items: [],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });

    const result = await facade.scanAll('test', { pk: 'pk1' });

    expect(result).toEqual({
      $metadata: [{ requestId: 're1' }, { requestId: 're2' }],
      ConsumedCapacity: [{ TableName: 'test' }, { TableName: 'test' }],
      Count: [3, 0],
      Items: [
        [
          { pk: 'pk1', name: 'John' },
          { pk: 'pk2', name: 'Ted' },
          { pk: 'pk3', name: 'Mary' },
        ],
        [],
      ],
      LastEvaluatedKey: [{ pk: 'pk3' }, undefined],
      ScannedCount: [3, 0],
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: undefined,
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
    expect(mockSend).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: {
          ExclusiveStartKey: { pk: 'pk3' },
          ExpressionAttributeNames: {
            '#pk': 'pk',
          },
          ExpressionAttributeValues: {
            ':pk': 'pk1',
          },
          FilterExpression: '#pk = :pk',
          TableName: 'test',
        },
      })
    );
  });
});
