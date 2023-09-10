/* eslint-disable @typescript-eslint/no-explicit-any */
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

export type Filter = Record<string, NativeAttributeValue>;

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
  abstract toExpressionItem(name: string): ExpressionInfo;
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

  toExpressionItem(name: string): ExpressionInfo {
    return {
      expression: `#${name} ${this.operator} :${name}`,
      names: { [name]: name },
      values: { [name]: this.value },
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

  toExpressionItem(name: string): ExpressionInfo {
    const expression =
      this.value === undefined
        ? `${this.fnName}(#${name})`
        : `${this.fnName}(#${name}, :${name})`;

    return {
      expression,
      names: { [name]: name },
      values: this.value === undefined ? {} : { [name]: this.value },
    };
  }
}

export class InComparison extends Comparison {
  value: any[];

  constructor(value: any[]) {
    super();
    this.value = value;
  }

  toExpressionItem(name: string): ExpressionInfo {
    const valueNames = [...Array(this.value.length).keys()].map(
      (i) => `${name}_${i}`
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

  toExpressionItem(name: string): ExpressionInfo {
    const names = [...Array(this.value.length)].map((_, i) => `${name}_${i}`);

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

  toExpressionItem(name: string): ExpressionInfo {
    let expression;
    if (typeof this.value === 'number') {
      return {
        expression: `size(#${name}) = :${name}`,
        names: { [name]: name },
        values: { [name]: this.value },
      };
    } else {
      const innerExpression = this.value.toExpressionItem(name);
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

function buildExpressionItem(k: string, value: any): ExpressionInfo {
  if (value instanceof Comparison) {
    return value.toExpressionItem(k);
  } else {
    return {
      expression: `#${k} = :${k}`,
      names: { [k]: k },
      values: { [k]: value },
    };
  }
}

export function buildExpression(filter?: Filter): ExpressionInfo {
  if (!filter) {
    return {
      expression: '',
      values: {},
      names: {},
    };
  }

  const items = Object.entries(filter).map(([k, v]) =>
    buildExpressionItem(k, v)
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
