import { type Option } from "../option/mod.ts";
import { type Result, ResultPromise, type UnwrapableResult } from "./api.ts";
import { ErrValue, OkValue } from "./implementation.ts";

export function Ok<T, E>(value: T): Result<T, E> {
  return ResultValue.from(new OkValue<T, E>(value));
}

export function Err<T, E>(err: E): Result<T, E> {
  return ResultValue.from(new ErrValue<T, E>(err));
}

export function resultFrom<T, E>(
  promise: Promise<Result<T, E>>,
): ResultPromise<T, E> {
  return PromisedResult.from(promise);
}

export class ResultValue<T, E> implements Result<T, E>, UnwrapableResult<T, E> {
  constructor(
    private result: UnwrapableResult<T, E>,
  ) {}

  get type(): symbol {
    return this.result.type;
  }

  static from<T, E>(result: UnwrapableResult<T, E>): Result<T, E> {
    return new ResultValue(result);
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return this.result.and(res);
  }

  andThen<U>(fn: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U>(fn: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U>(
    fn: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): PromisedResult<U, E> | Result<U, E> {
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

  map<U>(fn: (some: T) => Promise<U>): PromisedResult<U, E>;
  map<U>(fn: (some: T) => U): Result<U, E>;
  map<U>(
    fn: (some: T) => U | Promise<U>,
  ): PromisedResult<U, E> | Result<U, E> {
    return this.result.map(fn as (some: T) => U);
  }

  mapOrElse<U>(
    def: (err: E) => Promise<U>,
    fn: (ok: T) => Promise<U>,
  ): Promise<U>;
  mapOrElse<U>(
    def: (err: E) => Promise<U>,
    fn: (ok: T) => U,
  ): Promise<U> | U;
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (ok: T) => Promise<U>,
  ): Promise<U> | U;
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): U;
  mapOrElse<U>(
    def: (err: E) => U | Promise<U>,
    fn: (ok: T) => U | Promise<U>,
  ): U | Promise<U> {
    return this.result.mapOrElse(def as (err: E) => U, fn as (ok: T) => U);
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

export class PromisedResult<T, E> extends Promise<Result<T, E>>
  implements ResultPromise<T, E> {
  constructor(
    private promise: Promise<Result<T, E>>,
  ) {
    super((resolve) => {
      resolve(undefined as unknown as Result<T, E>);
    });
  }

  static from<U, E>(promise: Promise<Result<U, E>>): PromisedResult<U, E> {
    return new PromisedResult(promise);
  }

  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      // deno-lint-ignore no-explicit-any
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  and<U>(res: Result<U, E>): ResultPromise<U, E> {
    return PromisedResult.from<U, E>(
      this.promise.then((result) => result.and(res)),
    );
  }

  andThen<U>(fn: (some: T) => Promise<Result<U, E>>): ResultPromise<U, E>;
  andThen<U>(fn: (some: T) => Result<U, E>): ResultPromise<U, E>;
  andThen<U>(
    fn: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): ResultPromise<U, E> {
    return PromisedResult.from(
      this.promise.then((result) => {
        return result.andThen(fn as (some: T) => Result<U, E>);
      }),
    );
  }

  isOk(): Promise<boolean> {
    return this.promise.then((result) => result.isOk());
  }

  isErr(): Promise<boolean> {
    return this.promise.then((result) => result.isErr());
  }

  map<U>(fn: (some: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (some: T) => U): ResultPromise<U, E>;
  map<U>(fn: unknown): ResultPromise<U, E> {
    return PromisedResult.from(
      this.promise.then((result) => result.map(fn as (some: T) => Promise<U>)),
    );
  }

  mapOrElse<U>(
    def: (err: E) => Promise<U>,
    fn: (ok: T) => Promise<U>,
  ): Promise<U>;
  mapOrElse<U>(
    def: (err: E) => Promise<U>,
    fn: (ok: T) => U,
  ): Promise<U> | U;
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (ok: T) => Promise<U>,
  ): Promise<U> | U;
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): U;
  mapOrElse<U>(
    def: (err: E) => U | Promise<U>,
    fn: (ok: T) => U | Promise<U>,
  ): Promise<U> {
    return this.promise.then((result) =>
      result.mapOrElse(
        def as (err: E) => Promise<U>,
        fn as (ok: T) => Promise<U>,
      )
    );
  }

  or(optb: Result<T, E>): ResultPromise<T, E> {
    return PromisedResult.from(
      this.promise.then((result) => result.or(optb)),
    );
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): ResultPromise<T, E>;
  orElse(fn: (err: E) => Result<T, E>): ResultPromise<T, E>;
  orElse(
    fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): ResultPromise<T, E> {
    return PromisedResult.from(
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
