# rusty-core

Option and Result as inspired by https://doc.rust-lang.org/stable/core

### Usage

#### Deno

```
import { Err, None, Ok, Option, OptionPromise, Result, ResultPromise, Some } 
from "https://deno.land/x/rusty_core@v3.0.6/src/lib.ts";
```

#### Node.js

```json
"dependencies": {
	"rusty-core": "3.0.5"
}
```

```
import { Err, None, Ok, Option, OptionPromise, Result, ResultPromise, Some } 
from "rusty-core";
```

## Table of contents

- [Introduction](#introduction)
- [Option](#option)
- [Result](#result)

## Introduction

Inspired by the [Rust core](https://doc.rust-lang.org/core), which defines the
Option and Result types that greatly improve the execution safety by preventing
null pointer exceptions.

Also, great inspiration for the implementation came from the
[Monads library](https://deno.land/x/monads@v0.5.10)

This implementation supports the in-place modifiers of Option (insert, take), as
well as combining of Promises to either type.

### A note on version changes

- Version 1 was a pure implementation of the Rust API, and lacked support for
  combining `Promise<Option | Result>` without awaiting them first.

- Version 2 was a great improvement and introduced the `mapOption` and
  `mapResult` methods as mapOrElse counterparts where the callbacks may return
  `Option/OptionPromise` or `Result/ResultPromise` values. This broke the
  `mapOrElse` definition ov v1.

- Version 3, I cleaned up the API types, but most imprtantly got rid of the
  `optionFrom` and `resultFrom` helper functions. They are now replaced by
  `Some` and `Ok`, but this also broke the definition of `Some` when the
  argument is `undefined | null | Infinity | NaN`

### A note on (the lack of) unwrap/expect

Rust has two methods that might panic: `unwrap` and `expect`

```rust
let body = document.body.unwrap();
let title = body.get_attribute("title").expect("should have title attribute!");
```

Neither of these are implemented in this Javascript library. Use the combinator
methods to handle all possibilities:

```typescript
const title = document.body()
  .map( body => body.getAttribute("title) )
  .unwrapOr("*** No title given ***");
```

### A note on Promises and async/await and combinator methods

Both `Option` and `Result` have several combinator methods, like andThen, orElse
and map. Those methods accept one or more callback functions that can be async.

The examples below demonstrates how Promises and async callbacks can be combined
with the andThen and mapOrElse.

### Example

```typescript
type ToDo = { userId: number; id: number; title: string; completed: boolean };

function doFetch(url: string): ResultPromise<Response, string> {
  return Ok(
    fetch(url)
      .then(
        Ok<Response, string>,
        (err) => Err<Response, string>(err.toString()),
      ),
  );
}

function fetchJson(url: string): ResultPromise<ToDo, string> {
  return doFetch(url)
    .andThen(async (response) => {
      if (response.ok) return Ok<ToDo, string>(await response.json());
      else {return Err(
          `${response.status} ${response.statusText}: ${await response.text()}`,
        );}
    });
}

fetchJson("https:///jsonplaceholder.typicode.com/todos/1")
  .mapOrElse(
    (err) => console.error("Failed:", err),
    (todo) => console.log("Success:", todo.title),
  );
```

### Example with non-Rust helper functions

```typescript
function pauseIfNeeded(ms: Option<number>) {
  return ms.mapOrElse(
    () => Some(0),
    async (ms) => Some(await sleep(ms)),
  );
}
```

Due to the second callback being async, the return type for that callback will
be `Promise<Option>` But mapOrElse requires both callbacks to have the same
result type.

```log
error: TS2740 [ERROR]: Type 'Promise<Option<number>>' is missing the following properties from type 'Option<number>': getOrInsert, getOrInsertWith, insert, replace, and 19 more.
    async (ms) => Some(await sleep(ms)),
                  ~~~~~~~~~~~~~~~~~~~~~
    at file:///projects/rusty-core/cli/doc.ts:10:19

    The expected type comes from the return type of this signature.
        fn: (some: T) => U,
            ~~~~~~~~~~~~~~
        at file:///projects/rusty-core/src/option/combinators.ts:76:9
```

So one could surround the `Some(0)` with `Promise.resolve`. But then the return
type would be `Promise<Option>`. Combining multiple Option and Result together
would be cumbersome and error prone, as this requires constructs like

```typescript
(await pauseIfNeeded(Some(2))).map( ... );
```

To improve the usability, `mapOption` and `mapResult` were added to return an
`OptionPromise` or `ResultPromise`, in order to allow direct use of the
combinators

```typescript
function pauseIfNeeded(ms: Option<number>) {
  return ms.mapOption(
    () => SomePromise(0),
    async (ms) => Some(await sleep(ms)),
  );
}
```

At first, it might be confusing when to use `mapOrElse` and when `mapOption` or
`mapResult`. Conditional types are used to assist a little here. When
`mapOrElse` would return something like `Promise<Option>` or `Promise<Result>`,
the compiler will complain when the combining methods are used:

```log
error: TS2339 [ERROR]: Property 'map' does not exist on type '"To return a Promise to an Option, use mapOption"'.
pauseIfNeeded(Some(9)).map(None);
```

See the combinators test for more examples.

## Option

Type `Option<T>` represents an optional value: every Option is either `Some` and
contains a value, or `None`, and does not. `Option` types are very common, as
they have a number of uses:

    - Initial values
    - Return values for functions that are not defined over their entire input range (partial functions)
    - Return value for otherwise reporting simple errors, where `None` is returned on error
    - Optional fields
    - Optional function arguments
    - Nullable pointers
    - Swapping things out of difficult situations

### Creation

`Option` and `OptionPromise` are only interfaces and values of these types can
only be created through `Some/SomePromise` or `None/NonePromise`.

#### None / NonePromise

`None` creates an Option that has no associated value. It might be useful to
pass a type argument:

```typescript
const token = None<string>();
token.insert(12); // will give a compile error that the argument must be string
```

#### Some / SomePromise

`Some` creates an Option which has an associated value. The type argument can be
inferred from the argument. Actually, `Some` is a bit special, as it also might
return a `None` value:

```typescript
// All the statements below return a None
Some();
Some(null);
Some(Infinity);
Some(NaN);
```

#### OptionPromise

`SomePromise` and `NonePromise` both create an `OptionPromise`, which has a
similar interface as optin. Variables with the `OptionPromise` interface are, of
course, intended in async/promise methods. In general, when a function returns
`Promise<Option<T>>`, the actual return value will have the `OptionPromise`
interface. One can `await` such a value and get the Option<T>. Since
`OptionPromise` has the same combinator function names as `Option`, these can be
concattenated directly

```typescript
// @sleep: (s: string) => Promise<nummber>

Some(calculate("555"))
  .mapOption(
    () => None<number>(),
    (n) => Some(n % 2 == 0 ? 2 : 1),
  ).map(console.log);

Some("555")
  .mapOption(
    () => NonePromise<number>(),
    async (s) => Some(await calculate(s) % 2 == 0 ? 2 : 1),
  ).map(console.log);
```

Both statements will log `2` to the console. The first starts as an
`OptionPromise` due to `calculate` being a promise. Because `mapOption` requires
both callback methods to return the same type, the second statement uses
`NonePromise` to prevent a compiler error.

### Example

```typescript
function divide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) {
    return None();
  } else {
    return Some(numerator / denominator);
  }
}

// The return value of the function is an option
const result = divide(2.0, 3.0);

// Pattern match to retrieve the value
const message = result.mapOrElse(
  () => "Cannot divide by 0",
  (some) => `Result: ${some}`,
);

console.log(message); // "Result: 0.6666666666666666"

// This can al be done using combinators
console.log(
  Some(2.0 / 3.0)
    .map((some) => `Result: ${some}`)
    .unwrapOr("Cannot divide by 0"),
);
```

Original implementation: <https://doc.rust-lang.org/core/option>

#### A note on None()

The Rust core library defines None to be assignable to any `Option<T>`. Since
the below example also comes from the core library, we had to implement `None`
as a function: `None()`

```typescript
const x = None<number>();
const y = x.getOrInsert(5);
assertEquals(y, 5);
assertEquals(x, Some(5));
```

### `isSome() => boolean`

Returns `true` if the option is a `Some` value.

### `isNone() => boolean`

Returns `true` if the option is a `None` value.

### `unwrapOr(optb: T) => T`

Returns the contained value or `optb`.

### `map(fn: (val: T) => U) => Option<U>`

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.

### `mapOrElse(def: () => U, fn: (val: T) => U) => U`

Computes a default function result (if `None`), or applies a different function
to the contained value (if `Some`).

### `andThen(fn: (val: T) => Option<U>) => Option<U>`

Returns `None` if the option is `None`, otherwise calls `fn` with the wrapped
value and returns the result.

Some languages call this operation `flatmap`.

### `okOrElse<E>(fn: () => E): Result<T, E>`

Transforms the `Option<T>` into a {`Result<T, E>`,mapping `Some<T>(v)` to
`Ok<T,E>(v)`} and `None` to `Err(fn())`.

### `or(optb: Option<T>) => Option<T>`

Returns the option if it contains a value, otherwise returns `optb`.

### `and(optb: Option<T>) => Option<T>`

Returns `None` if the option is `None`, otherwise returns `optb`.

### `insert(value: T): T`

Inserts value into the option, then returns a mutable reference to it.

If the option already contains a value, the old value is dropped.

### `replace(value: T): Option<T>`

Replaces the actual value in the option by the value given in parameter,
returning the old value if present, leaving a `Some` in its place without
deinitializing either one.

### `take(): Option<T>`

Takes the value out of the option, leaving a None in its place.

## Result

Type `Result<T,E>` represents an result value: every `Result` is either `Ok` and
contains a value of type `T`, or `Err`, which holds an error value of type `E`.
When using `Result` throwing `Errors` is no longer necessary. Just make sure
that `Result` values are properly mapped to other values, or other error types.

### Creation

`Result` and `ResultPromise` are only interfaces and values of these types can
only be created through `Ok/OkPromise` or `Err/ErrPromise`. Any type can be used
for both `Ok` and `Err` and it is even allowed to have the same type for both:

```typescript
function httpStatus(status: number): Result<number, number> {
  return status >= 200 && status < 400 ? Ok(status) : Err(status);
}
```

#### Ok / OkPromise

`Ok` creates a `Result` which has an associated value. The type argument can be
inferred from the argument.

#### Err / ErrPromise

`Err` creates a `Result` which has an associated error value. The type argument
can be inferred from the argument.

### Example

```typescript
class CannotDivideByZero {}

function divide(
  numerator: number,
  denominator: number,
): Result<number, CannotDivideByZero> {
  if (denominator === 0) {
    return Err(new CannotDivideByZero());
  } else {
    return Ok(numerator / denominator);
  }
}

// The return value of the function is always a result
for (const result of [divide(7, 0), divide(2.0, 3.0)]) {
  result.mapOrElse(
    (_) => console.error("Cannot divide by zero"),
    (ok) => console.log(`Result: ${ok}`),
  );
}
// "Cannot divide by zero"
// "Result: 0.6666666666666666"
```

#### A note on Ok()

When a Result has a void Ok type (`Result<void,unknown>`), Ok must be called as
`Ok()`

Original implementation: <https://doc.rust-lang.org/core/result>

### `isOk() => boolean`

Returns `true` if the result is a `Ok` value.

### `isErr() => boolean`

Returns `true` if the result is an `Err` value.

### `unwrapOr(res: T) => T`

Returns the contained value when it is an Ok, otherwise `res`.

### `map(fn: (val: T) => U) => Result<U,E>`

Maps an `Result<T,E>` to `Result<U,E>` by applying a function to a contained Ok
value, otherwise the `Err`.

### `mapOrElse(fn: (val: T) => U) => U`

Maps a `Result<T, E>` to `U` by applying fallback function default to a
contained `Err` value, or function `fn` to a contained `Ok` value.

This function can be used to unpack a successful result while handling an error.
