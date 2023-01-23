import * as bi from './batch-item';

describe('get', () => {
  it('creates the command without options', () => {
    const command = bi.get('test', { pk: '12345' });

    expect(command).toEqual({
      test: {
        Keys: [{ pk: '12345' }],
      },
    });
  });

  it('creates the command with options', () => {
    const command = bi.get(
      'test',
      { pk: '12345' },
      { ProjectionExpression: 'pk, name' }
    );

    expect(command).toEqual({
      test: {
        Keys: [{ pk: '12345' }],
        ProjectionExpression: 'pk, name',
      },
    });
  });

  it('creates the command with multiple keys without options', () => {
    const command = bi.get('test', [{ pk: '12345' }, { pk: '98765' }]);

    expect(command).toEqual({
      test: {
        Keys: [{ pk: '12345' }, { pk: '98765' }],
      },
    });
  });

  it('creates the command with multiple keys with options', () => {
    const command = bi.get('test', [{ pk: '12345' }, { pk: '98765' }], {
      ProjectionExpression: 'pk, name',
    });

    expect(command).toEqual({
      test: {
        Keys: [{ pk: '12345' }, { pk: '98765' }],
        ProjectionExpression: 'pk, name',
      },
    });
  });
});

describe('put', () => {
  it('creates the command', () => {
    const command = bi.put('test', { pk: '12345', name: 'Joe' });

    expect(command).toEqual({
      test: [
        {
          PutRequest: {
            Item: { pk: '12345', name: 'Joe' },
          },
        },
      ],
    });
  });

  it('creates the command with multiple items', () => {
    const command = bi.put('test', [
      { pk: '12345', name: 'Joe' },
      { pk: '98765', name: 'Mary' },
    ]);

    expect(command).toEqual({
      test: [
        {
          PutRequest: {
            Item: { pk: '12345', name: 'Joe' },
          },
        },
        {
          PutRequest: {
            Item: { pk: '98765', name: 'Mary' },
          },
        },
      ],
    });
  });
});

describe('delete', () => {
  it('creates the command', () => {
    const command = bi.deleteItem('test', { pk: '12345' });

    expect(command).toEqual({
      test: [
        {
          DeleteRequest: {
            Key: { pk: '12345' },
          },
        },
      ],
    });
  });

  it('creates the command with multiple keys', () => {
    const command = bi.deleteItem('test', [{ pk: '12345' }, { pk: '98765' }]);

    expect(command).toEqual({
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
    });
  });
});
