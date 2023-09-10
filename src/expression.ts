/* eslint-disable @typescript-eslint/no-explicit-any */
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import NameProvider from './name-provider';

export type Filter =
  | Record<string, NativeAttributeValue>
  | Array<[string, NativeAttributeValue]>;

export type ValuesMap = {
  [name: string]: any;
};

export type NamesMap = {
  [name: string]: string;
};

export interface ExpressionInfo {
  expression: string;
  values: ValuesMap;
  names: NamesMap;
}

export abstract class Comparison {
  abstract toExpressionItem(
    name: string,
    nameProvider: NameProvider
  ): ExpressionInfo;
}

function prefixAttributes(o: any, prefix: string) {
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => [`${prefix}${k}`, v])
  );
}

export class SimpleComparison extends Comparison {
  operator: string;

  value: any;

  constructor(operator: string, value: any) {
    super();
    this.operator = operator;
    this.value = value;
  }

  toExpressionItem(name: string, nameProvider: NameProvider): ExpressionInfo {
    const uniqueName = nameProvider.nextUnique(name);

    return {
      expression: `#${name} ${this.operator} :${uniqueName}`,
      names: { [name]: name },
      values: { [uniqueName]: this.value },
    };
  }
}

export class FunctionComparison extends Comparison {
  fnName: string;

  value?: any;

  constructor(fnName: string, value?: any) {
    super();
    this.fnName = fnName;
    this.value = value;
  }

  toExpressionItem(name: string, nameProvider: NameProvider): ExpressionInfo {
    const uniqueName = nameProvider.nextUnique(name);

    const expression =
      this.value === undefined
        ? `${this.fnName}(#${name})`
        : `${this.fnName}(#${name}, :${uniqueName})`;

    return {
      expression,
      names: { [name]: name },
      values: this.value === undefined ? {} : { [uniqueName]: this.value },
    };
  }
}

export class InComparison extends Comparison {
  value: any[];

  constructor(value: any[]) {
    super();
    this.value = value;
  }

  toExpressionItem(name: string, nameProvider: NameProvider): ExpressionInfo {
    const uniqueName = nameProvider.nextUnique(name);

    const valueNames = [...Array(this.value.length).keys()].map(
      (i) => `${uniqueName}_${i}`
    );

    return {
      expression: `#${name} in (${valueNames.map((n) => `:${n}`).join(', ')})`,
      names: { [name]: name },
      values: Object.fromEntries(valueNames.map((n, i) => [n, this.value[i]])),
    };
  }
}

export class BetweenComparison extends Comparison {
  value: any[];

  constructor(value: any[]) {
    super();
    this.value = value;
  }

  toExpressionItem(name: string, nameProvider: NameProvider): ExpressionInfo {
    const uniqueName = nameProvider.nextUnique(name);
    const names = [...Array(this.value.length)].map(
      (_, i) => `${uniqueName}_${i}`
    );

    return {
      expression: `#${name} between ${names.map((n) => `:${n}`).join(' and ')}`,
      names: { [name]: name },
      values: Object.fromEntries(names.map((n, i) => [n, this.value[i]])),
    };
  }
}

export class SizeComparison extends Comparison {
  value: number | Comparison;

  constructor(value: number | Comparison) {
    super();
    this.value = value;
  }

  toExpressionItem(name: string, nameProvider: NameProvider): ExpressionInfo {
    let expression;
    if (typeof this.value === 'number') {
      const uniqueName = nameProvider.nextUnique(name);

      return {
        expression: `size(#${name}) = :${uniqueName}`,
        names: { [name]: name },
        values: { [uniqueName]: this.value },
      };
    } else {
      const innerExpression = this.value.toExpressionItem(name, nameProvider);
      expression = innerExpression.expression.replace(
        `#${name}`,
        `size(#${name})`
      );

      return {
        expression,
        names: { [name]: name, ...innerExpression.names },
        values: innerExpression.values,
      };
    }
  }
}

function buildExpressionItem(
  k: string,
  value: any,
  nameProvider: NameProvider
): ExpressionInfo {
  if (value instanceof Comparison) {
    return value.toExpressionItem(k, nameProvider);
  } else {
    const uniqueK = nameProvider.nextUnique(k);

    return {
      expression: `#${k} = :${uniqueK}`,
      names: { [k]: k },
      values: { [uniqueK]: value },
    };
  }
}

export function buildExpression(
  filter?: Filter,
  nameProvider?: NameProvider
): ExpressionInfo {
  if (!filter) {
    return {
      expression: '',
      values: {},
      names: {},
    };
  }

  const entries = Array.isArray(filter) ? filter : Object.entries(filter);
  const effectiveNameProvider = nameProvider ?? new NameProvider();
  const items = entries.map(([k, v]) =>
    buildExpressionItem(k, v, effectiveNameProvider)
  );

  return {
    expression: items.map((i) => i.expression).join(' and '),
    values: prefixAttributes(
      Object.assign({}, ...items.map((i) => i.values)),
      ':'
    ),
    names: prefixAttributes(
      Object.assign({}, ...items.map((i) => i.names)),
      '#'
    ) as NamesMap,
  };
}

function buildUpdateExpressionItem(k: string, value: any): ExpressionInfo {
  return {
    expression: `#${k} = :${k}`,
    names: { [k]: k },
    values: { [k]: value },
  };
}

export function buildUpdateExpression(
  updatedValues: Record<string, NativeAttributeValue>
): ExpressionInfo {
  const items = Object.entries(updatedValues).map(([k, v]) =>
    buildUpdateExpressionItem(k, v)
  );
  if (items.length === 0) {
    return {
      expression: '',
      values: {},
      names: {},
    };
  }

  return {
    expression: `set ${items.map((i) => i.expression).join(', ')}`,
    values: prefixAttributes(
      Object.assign({}, ...items.map((i) => i.values)),
      ':'
    ),
    names: prefixAttributes(
      Object.assign({}, ...items.map((i) => i.names)),
      '#'
    ) as NamesMap,
  };
}
