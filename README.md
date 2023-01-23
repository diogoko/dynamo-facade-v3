# dynamo-facade-v3

[![QA](https://github.com/diogoko/dynamo-facade-v3/actions/workflows/qa.yml/badge.svg)](https://github.com/diogoko/dynamo-facade-v3/actions/workflows/qa.yml)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/dynamo-facade-v3)
[![install size](https://packagephobia.com/badge?p=dynamo-facade-v3)](https://packagephobia.com/result?p=dynamo-facade-v3)
[![downloads](https://img.shields.io/npm/dt/dynamo-facade-v3)](https://npm-stat.com/charts.html?package=dynamo-facade-v3)
[![Known Vulnerabilities](https://snyk.io/test/npm/dynamo-facade-v3/badge.svg)](https://snyk.io/test/npm/dynamo-facade-v3)
[![Coverage Status](https://coveralls.io/repos/github/diogoko/dynamo-facade-v3/badge.svg?branch=main)](https://coveralls.io/github/diogoko/dynamo-facade-v3?branch=main)

dynamo-facade-v3 is a library that helps calling `DynamoDBClient` of `@aws-sdk/lib-dynamodb` - specially functions that have expression parameters (like `FilterExpression` and `UpdateExpression`).

This project is focused on version 3 of `@aws-sdk/lib-dynamodb`.

## Usage

You can see the complete reference to the API at https://diogoko.github.io/dynamo-facade-v3.

### Install

```
npm install dynamo-facade-v3
```

### Examples

In the following examples, the `movies` table has a compound primary key (`actor` is the hash key, `movie` is the range key).

```js
import df, { between, gt, inList, transactWrite as tr } from 'dynamo-facade-v3';

// The returned value is the same one returned by DynamoDBDocumentClient.send()
const response = await df.get('movies', { actor: 'Tom Hanks' });
console.log(response.Item);

// query(tableName, keyCondition, options)
await df.query('movies', { actor: 'Tom Hanks' }, { filter: { year: gt(2000) } })

// scan(tableName, filter, options)
await df.scan('movies', { genre: inList('Drama', 'Action'), year: between(1990, 1999) })

// put(tableName, item, options)
await df.put('movies', { actor: 'Tom Hanks', movie: 'Finch', year: 2021 });

// update(tableName, key, updatedValues, options)
await df.update(
  'movies',
  { actor: 'Tom Hanks', movie: 'Forrest Gump' },
  { year: 1994, tomatometer: 71 }
)

// delete(tableName, key, options)
await df.delete('movies', { actor: 'Tom Hanks', movie: 'The Bonfire of the Vanities' })

// transactWrite(transactItems, options)
await df.transactWrite([
  tr.put('movies', { actor: 'Tom Hanks', movie: 'Toy Story 2', year: 1999 }),
  tr.update('movies', { actor: 'Tom Hanks', movie: 'Big'}, { year: 1988 }),
])
```

### Expressions

Every command option that is an expression (`KeyConditionExpression`, `FilterExpression` - and soon `ProjectionExpression` too) can be described by an object whose keys are the table attributes, and whose values indicate the comparison to be made. If none of the operator helpers is used, the equals (`=`) operator is assumed.

```js
df.scan('movies', { actor: 'Tom Hanks' })
// FilterExpression: '#actor = :actor'
// ExpressionAttributeValues: { ':actor': 'Tom Hanks' }
```

There are several operator helpers that can be imported as functions from this module. To use them, call the helper passing the compared value as its parameter.

```js
import { gt } from 'dynamo-facade-v3';
df.scan('movies', { year: gt(2000) })
// FilterExpression: '#year > :year'
// ExpressionAttributeValues: { ':year': 2000 }
```

Notice that the `ExpressionAttributeValues` and `ExpressionAttributeNames` options are built automatically for you.

### Extra options

All commands accept an optional parameters object as their last argument. This way, you can use options from the original `*Command` classes.

```js
df.scan(
  'movies',
  { year: gt(2000) },
  { Limit: 30 }
)
```

If you specify parameters that are automatically managed by the library functions, you override what was built automatically.

```js
df.scan(
  'movies',
  { year: gt(2000) },
  { FilterExpression: 'and actor = :actor' } // oops!
)
// FilterExpression: 'and actor = :actor'    // ouch!
```

### Responses

All functions that call original the `*Command` classes return the promise created by the `send()` method from `DynamoDBDocumentClient`.

```js
const item = await df.get('movies', { actor, movie });          // ok
const item = await df.get('movies', { actor, movie }).promise() // wrong!
```

## Development

### Build

Run (this project is using Yarn 1.x):

```
yarn build
```

This will create the compiled files under `./dist` folder.

### Test

Run to execute tests with Jest:

```
yarn test
```

### Generating docs

This project uses [TypeDoc](https://typedoc.org/).

Run `yarn make:docs` and a folder named `docs` will be created in your root directory.

## Thanks

This project was created from the [alioguzhan/typescript-library-template](https://github.com/alioguzhan/typescript-library-template) project template.
