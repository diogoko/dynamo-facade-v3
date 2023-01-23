import { buildExpression, buildUpdateExpression } from './expression';
import {
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

describe('buildExpression', () => {
  it('accepts empty filter', () => {
    const expr = buildExpression({});

    expect(expr).toEqual({ expression: '', values: {}, names: {} });
  });

  it('accepts equal comparison', () => {
    const expr = buildExpression({ name: 'Test', age: 30 });

    expect(expr).toEqual({
      expression: '#name = :name and #age = :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts begins_with comparison', () => {
    const expr = buildExpression({ title: begins_with('Test'), age: 30 });

    expect(expr).toEqual({
      expression: 'begins_with(#title, :title) and #age = :age',
      values: {
        ':title': 'Test',
        ':age': 30,
      },
      names: {
        '#title': 'title',
        '#age': 'age',
      },
    });
  });

  it('accepts <> comparison', () => {
    const expr = buildExpression({ name: 'Test', age: ne(30) });

    expect(expr).toEqual({
      expression: '#name = :name and #age <> :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts <= comparison', () => {
    const expr = buildExpression({ name: 'Test', age: le(30) });

    expect(expr).toEqual({
      expression: '#name = :name and #age <= :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts < comparison', () => {
    const expr = buildExpression({ name: 'Test', age: lt(30) });

    expect(expr).toEqual({
      expression: '#name = :name and #age < :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts >= comparison', () => {
    const expr = buildExpression({ name: 'Test', age: ge(30) });

    expect(expr).toEqual({
      expression: '#name = :name and #age >= :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts > comparison', () => {
    const expr = buildExpression({ name: 'Test', age: gt(30) });

    expect(expr).toEqual({
      expression: '#name = :name and #age > :age',
      values: {
        ':name': 'Test',
        ':age': 30,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts in comparison', () => {
    const expr = buildExpression({ name: 'Test', age: inList([30, 45, 60]) });

    expect(expr).toEqual({
      expression: '#name = :name and #age in (:age_0, :age_1, :age_2)',
      values: {
        ':name': 'Test',
        ':age_0': 30,
        ':age_1': 45,
        ':age_2': 60,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts between comparison', () => {
    const expr = buildExpression({ name: 'Test', age: between(30, 45) });

    expect(expr).toEqual({
      expression: '#name = :name and #age between :age_0 and :age_1',
      values: {
        ':name': 'Test',
        ':age_0': 30,
        ':age_1': 45,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });

  it('accepts contains', () => {
    const expr = buildExpression({ name: contains('Test') });

    expect(expr).toEqual({
      expression: 'contains(#name, :name)',
      values: {
        ':name': 'Test',
      },
      names: {
        '#name': 'name',
      },
    });
  });

  it('accepts attribute_exists', () => {
    const expr = buildExpression({ name: attribute_exists() });

    expect(expr).toEqual({
      expression: 'attribute_exists(#name)',
      values: {},
      names: {
        '#name': 'name',
      },
    });
  });

  it('accepts attribute_not_exists', () => {
    const expr = buildExpression({ name: attribute_not_exists() });

    expect(expr).toEqual({
      expression: 'attribute_not_exists(#name)',
      values: {},
      names: {
        '#name': 'name',
      },
    });
  });

  it('accepts attribute_type', () => {
    const expr = buildExpression({ name: attribute_type('S') });

    expect(expr).toEqual({
      expression: 'attribute_type(#name, :name)',
      values: {
        ':name': 'S',
      },
      names: {
        '#name': 'name',
      },
    });
  });

  it('accepts size with equals', () => {
    const expr = buildExpression({ name: size(10) });

    expect(expr).toEqual({
      expression: 'size(#name) = :name',
      values: {
        ':name': 10,
      },
      names: {
        '#name': 'name',
      },
    });
  });

  it('accepts size with other comparison', () => {
    const expr = buildExpression({ name: size(gt(10)) });

    expect(expr).toEqual({
      expression: 'size(#name) > :name',
      values: {
        ':name': 10,
      },
      names: {
        '#name': 'name',
      },
    });
  });
});

describe('buildUpdateExpression', () => {
  it('handles empty objects', () => {
    const expr = buildUpdateExpression({});

    expect(expr).toEqual({
      expression: '',
      values: {},
      names: {},
    });
  });

  it('creates expression for set updates', () => {
    const expr = buildUpdateExpression({ name: 'Joe', age: 35 });

    expect(expr).toEqual({
      expression: 'set #name = :name, #age = :age',
      values: {
        ':name': 'Joe',
        ':age': 35,
      },
      names: {
        '#name': 'name',
        '#age': 'age',
      },
    });
  });
});
