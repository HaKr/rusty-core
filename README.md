# rusty-core

Option and Result as inspired by https://doc.rust-lang.org/stable/core

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
well as chaining of Promises to either type.

### A note on Promises and async/await

Both `Option` and `Result` have several chaining methods, like andThen, orElse
and map. Those methods accept one or more callback functions that can be async.

The example below demonstrates how Promises and async callbacks can be chained
with the andThen and mapOrElse.

#### Example

```typescript
function doFetch(url: string): ResultPromise<Response, string> {
  return resultFrom(
    fetch(url)
      .then(
        Ok<Response, string>,
        (err) => Err(err.toString()),
      ),
  );
}

function fetchJson(url: string) {
  return doFetch(url)
    .andThen(async (response) => {
      if (response.ok) {
        return Ok(await response.json());
      } else return Err(`${response.status}: ${await response.text()}`);
    });
}

fetchJson("https:///jsonplaceholder.typicode.com/todos/1")
  .mapOrElse(
    (err) => console.error("Failed", err),
    (todo) => console.log("Success", todo),
  );
```

## Option

Type `Option<T>` represents an optional value: every `Option` is either `Some`
and contains a value, or `None`, and does not.

You could consider using `Option` for:

- Nullable pointers (`undefined` in JavaScript)
- Return value for otherwise reporting simple errors, where None is returned on
  error
- Default values and/or properties
- Nested optional object properties

`Option`s are commonly paired with pattern matching to query the presence of a
value and take action, always accounting for the `None` case.

```typescript
function divide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) {
    return None;
  } else {
    return Some(numerator / denominator);
  }
}

// The return value of the function is an option
const result = divide(2.0, 3.0);

// Pattern match to retrieve the value
const message = result.match({
  some: (res) => `Result: ${res}`,
  none: "Cannot divide by 0",
});

console.log(message); // "Result: 0.6666666666666666"
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

#### A note on `null` and `undefined`

Both `null` and `undefined` are considered a _value_ which can be used with
`Some()` and are not to be confused with `None()`.

### `isSome() => boolean`

Returns `true` if the option is a `Some` value.

### `isNone() => boolean`

Returns `true` if the option is a `None` value.

### `unwrapOr(optb: T) => T`

Returns the contained value or `optb`.

### `map(fn: (val: T) => U) => Option<U>`

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.

### `andThen(fn: (val: T) => Option<U>) => Option<U>`

Returns `None` if the option is `None`, otherwise calls `fn` with the wrapped
value and returns the result.

Some languages call this operation `flatmap`.

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

Type `Result<T,E>` represents an resul value: every `Result` is either `Ok` and
contains a value, or `Ok`, which holds an error value.

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
`Ok(undefined)`

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
