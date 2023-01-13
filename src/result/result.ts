import {
  ErrFrom,
  ErrValue,
  OkFrom,
  OkValue,
  Option,
  OptionPromise,
  Result,
  ResultLike,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromise,
  ResultPromiseLike,
  ResultPromiseMapOption,
  ResultPromiseMapOrElse,
  ResultPromiseMapResult,
  Some,
  UnwrapableResult,
} from "./mod.ts";

/**
 * Test that a variable implements the {@linkcode Option<T>} interface
 * @returns true if variable can be cast to `Option<T>`
 */
export function isResult<T = unknown, E = unknown>(
  possibleResult: unknown,
): possibleResult is Result<T, E> {
  return possibleResult instanceof ResultValue;
}

export function isResultPromise<T = unknown, E = unknown>(
  possibleResult: unknown,
): possibleResult is ResultPromise<T, E> {
  return possibleResult instanceof PromisedResult;
}

export function isResultLike<T = unknown, E = unknown>(
  possibleResult: unknown,
): possibleResult is ResultLike<T, E> {
  return isResult(possibleResult) || isResultPromise(possibleResult);
}

/**
 * Creates a `Result<T,E>` with an `Ok` value of type T.
 *
 * When the value is {@linkcode ResultLike}, the actual return value is that.
 * When the value is a Promise to T, the return value implements {@linkcode ResultPromise<T,E>}
 */
export function Ok<T, E>(ok: T): OkFrom<T, E> {
  return (
    isResult<T, E>(ok)
      ? ok
      : isResultPromise<T, E>(ok)
      ? ok
      : (ok instanceof OkValue) || (ok instanceof ErrValue)
      ? ResultValue.from<T, E>(ok)
      : ok instanceof Promise
      ? PromisedResult.from<T, E>(ok)
      : ResultValue.from(OkValue.from<T, E>(ok))
  ) as OkFrom<T, E>;
}

/**
 * Create an {@linkcode ResultPromise} from a value.
 * @example
 * ```typescript
 * declare function calculate(n: number): ResultPromise<number,string>;
 *
 * Ok(42)
 *   .mapResult(
 *     // when using Ok here, the compiler will error on calculate with an Argument Error
 *     () => OkPromise<number,string>(-1),
 *     calculate
 *   );
 * ```
 */
export function OkPromise<T, E>(value: T): ResultPromise<T, E> {
  return Ok(Promise.resolve(value)) as ResultPromise<T, E>;
}

/**
 * Creates a `Result<T,E>` with an `Err` value of type E.
 *
 * When the value is {@linkcode ResultLike}, the actual return value is that.
 * When the value is a Promise to E, the return value implements {@linkcode ResultPromise<T,E>}
 */
export function Err<T, E>(err: E): ErrFrom<T, E> {
  return ((err instanceof ResultValue || err instanceof PromisedResult)
    ? err
    : (err instanceof OkValue) || (err instanceof ErrValue)
    ? ResultValue.from(err)
    : err instanceof Promise
    ? PromisedResult.from(err, Err)
    : ResultValue.from(ErrValue.from(err) as ResultValue<T, E>)) as ErrFrom<
      T,
      E
    >;
}

/**
 * Create an {@linkcode ResultPromise} from a value.
 * @example
 * ```typescript
 * declare function calculate(n: number): ResultPromise<number,string>;
 *
 * Ok(42)
 *   .mapResult(
 *     // when using Err here, the compiler will error on calculate with an Argument Error
 *     () => ErrPromise<number,string>("could not calculate"),
 *     calculate
 *   );
 * ```
 */
export function ErrPromise<T, E>(err: E): ResultPromise<T, E> {
  return Err(Promise.resolve(err)) as unknown as ResultPromise<T, E>;
}

export class ResultValue<T, E> implements Result<T, E>, UnwrapableResult<T, E> {
  result: UnwrapableResult<T, E>;
  constructor(
    result: UnwrapableResult<T, E>,
  ) {
    this.result = result;
  }

  get type(): symbol {
    return this.result.type;
  }

  static from<T, E>(result: UnwrapableResult<T, E>): Result<T, E> {
    return new ResultValue(result);
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return this.result.and(res);
  }

  andThen<U>(op: (value: T) => ResultPromiseLike<U, E>): ResultPromise<U, E>;
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E>;
  andThen<U>(fn: (value: T) => ResultLike<U, E>): ResultLike<U, E> {
    return this.result.andThen(fn as (some: T) => Result<U, E>);
  }

  err(): Option<E> {
    return this.result.err();
  }

  isOk(): boolean {
    return this.result.isOk();
  }
  isErr(): boolean {
    return this.result.isErr();
  }

  map<U>(fn: (value: T) => Promise<U>): PromisedResult<U, E>;
  map<U>(fn: (value: T) => U): Result<U, E>;
  map<U>(
    fn: (value: T) => U | Promise<U>,
  ): PromisedResult<U, E> | Result<U, E> {
    return this.result.map(fn as (some: T) => U);
  }

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  mapErr<F>(
    fn: (err: E) => F | Promise<F>,
  ): Result<T, F> | ResultPromise<T, F> {
    return this.result.mapErr(fn as (err: E) => F);
  }

  mapResult<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultMapResult<U> {
    return this.result.mapResult(def, fn);
  }

  mapOption<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultMapOption<U> {
    return this.result.mapOption(def, fn);
  }

  mapOrElse<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultMapOrElse<U> {
    return this.result.mapOrElse(def, fn);
  }

  ok(): Option<T> {
    return this.result.ok();
  }

  or(optb: Result<T, E>): Result<T, E> {
    return this.result.or(optb);
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): PromisedResult<T, E>;
  orElse(fn: (err: E) => Result<T, E>): Result<T, E>;
  orElse(
    fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): PromisedResult<T, E> | Result<T, E> {
    return this.result.orElse(fn as (err: E) => Result<T, E>);
  }

  unwrap(): T {
    return this.result.unwrap();
  }

  unwrapOr(def: T): T {
    return this.result.unwrapOr(def);
  }

  unwrapOrElse(def: (err: E) => T): T;
  unwrapOrElse(def: (err: E) => Promise<T>): T | Promise<T>;
  unwrapOrElse(def: (err: E) => T | Promise<T>): T | Promise<T> {
    return this.result.unwrapOrElse(def as (err: E) => T);
  }

  [Symbol.iterator]() {
    return this.result[Symbol.iterator]();
  }
}
type Creator<T, E> = ((v: T) => OkFrom<T, E>) | ((e: E) => OkFrom<T, E>);
export class PromisedResult<T, E> implements ResultPromise<T, E> {
  private promise: Promise<Result<T, E>>;

  constructor(
    promise: Promise<Result<T, E>>,
    creator: Creator<T, E>,
  ) {
    this.promise = promise.then(
      (v) =>
        isResultLike<T, E>(v)
          ? v
          : (creator as unknown as (value: Result<T, E>) => Result<T, E>)(v),
      (err) => Err<T, E>(err as E),
    ) as Promise<Result<T, E>>;
  }

  get [Symbol.toStringTag](): string {
    return `PromisedResult`; //this.promise[Symbol.toStringTag];
  }

  static from<U, F>(
    promise: Promise<Result<U, F>>,
    then: Creator<U, F> = Ok<U, F>,
  ): ResultPromise<U, F> {
    return isResultPromise<U, F>(promise)
      ? promise
      : new PromisedResult(promise, then);
  }

  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<Result<T, E> | TResult> {
    return this.promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<Result<T, E>> {
    return this.promise.finally(onfinally);
  }

  and<U>(res: Result<U, E>): ResultPromise<U, E> {
    return Ok(
      this.promise.then((result) => result.and(res)),
    );
  }

  andThen<U>(fn: (value: T) => ResultLike<U, E>): ResultPromise<U, E> {
    return Ok(
      this.promise.then((result) =>
        result.andThen(fn as (value: T) => Result<U, E>)
      ),
    ) as ResultPromise<U, E>;
  }

  err(): OptionPromise<E> {
    return Some(this.promise.then((result) => result.err()));
  }

  isOk(): Promise<boolean> {
    return this.promise.then((result) => result.isOk());
  }

  isErr(): Promise<boolean> {
    return this.promise.then((result) => result.isErr());
  }

  map<U>(fn: (value: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (value: T) => U): ResultPromise<U, E>;
  map<U>(fn: unknown): ResultPromise<U, E> {
    return Ok(
      this.promise.then((result) => result.map(fn as (value: T) => Promise<U>)),
    );
  }

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): ResultPromise<T, F>;
  mapErr<F>(
    fn: (err: E) => F | Promise<F>,
  ): Result<T, F> | ResultPromise<T, F> {
    return Err(
      this.promise.then((result) =>
        result.mapErr(fn as (err: E) => Promise<F>)
      ),
    );
  }

  mapResult<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultPromiseMapResult<U> {
    return Ok(
      this.promise.then((result) =>
        result.mapResult(def, fn) as Promise<Result<U, E>>
      ),
    ) as ResultPromiseMapResult<U>;
  }

  mapOption<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultPromiseMapOption<U> {
    return Some(
      this.promise.then((result) => result.mapOption(def, fn)) as Promise<
        Option<unknown>
      >,
    ) as ResultPromiseMapOption<U>;
  }

  mapOrElse<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultPromiseMapOrElse<U> {
    return this.promise.then(
      (result) => result.mapOrElse(def, fn) as U,
    ) as ResultPromiseMapOrElse<U>;
  }

  ok(): OptionPromise<T> {
    return Some(this.promise.then((result) => result.ok()));
  }

  or(optb: Result<T, E>): ResultPromise<T, E> {
    return Ok(
      this.promise.then((result) => result.or(optb)),
    );
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): ResultPromise<T, E>;
  orElse(fn: (err: E) => Result<T, E>): ResultPromise<T, E>;
  orElse(
    fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): ResultPromise<T, E> {
    return Ok(
      this.promise.then((result) => {
        return result.orElse(fn as (err: E) => Promise<Result<T, E>>);
      }),
    );
  }

  unwrapOr(def: T): Promise<T> {
    return this.promise.then((result) => result.unwrapOr(def));
  }

  unwrapOrElse(def: (err: E) => T): Promise<T>;
  unwrapOrElse(def: (err: E) => Promise<T>): Promise<T>;
  unwrapOrElse(def: (err: E) => T | Promise<T>): Promise<T> {
    return this.promise.then((result) =>
      result.unwrapOrElse(def as (err: E) => T)
    );
  }
}
