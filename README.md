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

### Example

This contrived example shows how async routines can be used in the orElse,
andThen, and mapOrElse methods, where those methods can be chained directly.

```typescript
assertEquals(
  await None<number>()
    .orElse(async () => await Promise.resolve(None()))
    .mapOrElse(
      async () => await Promise.resolve(333),
      async (n) => await Promise.resolve(n * 2),
    )
    .andThen(async (n) => await Promise.resolve(Some(`${n} * 3`))),
  Some("333 * 3"),
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

### `isSome() => boolean`

Returns `true` if the option is a `Some` value.

#### Examples

```typescript
let x: Option<number> = Some(2);
console.log(x.isSome()); // true
```

```typescript
let x: Option<number> = None;
console.log(x.isSome()); // false
```

#### A note on `null` and `undefined`

`null` is considered a _value_ and it is internally treated as `object`.

Constructing `Some` with `null` (explicitly, or implicitly) will yield
`Some<null>`, while `undefined` will yield `None`.

```typescript
expect(Some().isSome()).toEqual(false);
expect(Some(undefined).isSome()).toEqual(false);

// This assertion would fail in versions below 3.0.0
expect(Some(null).isSome()).toEqual(true);
```

### `isNone() => boolean`

Returns `true` if the option is a `None` value.

#### Examples

```typescript
let x: Option<number> = Some(2);
console.log(x.isNone()); // false
```

```typescript
let x: Option<number> = None;
console.log(x.isNone()); // true
```

### `unwrap() => T`

Moves the value `v` out of the `Option<T>` if it is `Some(v)`.

In general, because this function may throw, its use is discouraged. Instead,
try to use `match` and handle the `None` case explicitly.

#### Throws

Throws a `ReferenceError` if the option is `None`.

#### Examples

```typescript
let x = Some("air");
console.log(x.unwrap()); // "air"
```

```typescript
let x = None;
console.log(x.unwrap()); // fails, throws an Exception
```

Alternatively, you can choose to use `isSome()` to check whether the option is
`Some`. This will enable you to use `unwrap()` in the `true` / success branch.

```typescript
function getName(name: Option<string>): string {
  if (isSome(name)) {
    return name.unwrap();
  } else {
    return "N/A";
  }
}
```

### `unwrapOr(optb: T) => T`

Returns the contained value or `optb`.

#### Examples

```typescript
console.log(Some("car").unwrapOr("bike")); // "car"
console.log(None.unwrapOr("bike")); // "bike"
```

### `map(fn: (val: T) => U) => Option<U>`

Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.

#### Examples

```typescript
let x: Option<string> = Some("123");
let y: Option<number> = x.map(parseInt);

console.log(y.isSome()); // true
console.log(y.unwrap()); // 123
```

```typescript
let x: Option<string> = None;
let y: Option<number> = x.map(parseInt);

console.log(y.isNone()); // true
```

### `andThen(fn: (val: T) => Option<U>) => Option<U>`

Returns `None` if the option is `None`, otherwise calls `fn` with the wrapped
value and returns the result.

Some languages call this operation `flatmap`.

#### Examples

```typescript
const sq = (x: number): Option<number> => Some(x * x);
const nope = (_: number): Option<number> => None;

console.log(Some(2).andThen(sq).andThen(sq)); // Some(16)
console.log(Some(2).andThen(sq).andThen(nope)); // None
console.log(Some(2).andThen(nope).andThen(sq)); // None
console.log(None.andThen(sq).andThen(sq)); // None
```

### `or(optb: Option<T>) => Option<T>`

Returns the option if it contains a value, otherwise returns `optb`.

#### Examples

```typescript
let x = Some(2);
let y = None;

console.log(x.or(y)); // Some(2)
```

```typescript
let x = None;
let y = Some(100);

console.log(x.or(y)); // Some(100)
```

```typescript
let x = Some(2);
let y = Some(100);

console.log(x.or(y)); // Some(2)
```

```typescript
let x: Option<number> = None;
let y = None;

console.log(x.or(y)); // None
```

### `and(optb: Option<T>) => Option<T>`

Returns `None` if the option is `None`, otherwise returns `optb`.

#### Examples

```typescript
let x = Some(2);
let y = None;

console.log(x.and(y)); // None
```

```typescript
let x = None;
let y = Some(100);

console.log(x.and(y)); // None
```

```typescript
let x = Some(2);
let y = Some(100);

console.log(x.and(y)); // Some(100)
```

```typescript
let x: Option<number> = None;
let y = None;

console.log(x.and(y)); // None
```

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
