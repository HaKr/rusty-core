import type {
  ResultFrom,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromiseMapOption,
  ResultPromiseMapOrElse,
  ResultPromiseMapResult,
} from "../conditional_types";
import { optionFrom } from "../option/api";
import type { Option, OptionPromise } from "../option/api";
import { isResult, Result, resultFrom, ResultPromise } from "./api";
import { ErrValue, OkValue } from "./implementation";

export function Ok<T, E>(value: T): Result<T, E> {
  return ResultValue.from(new OkValue<T, E>(value));
}

export function Err<T, E>(err: E): Result<T, E> {
  return ResultValue.from(new ErrValue<T, E>(err));
}

export interface UnwrapableResult<T, E> extends Result<T, E> {
  type: symbol;

  unwrap(): T;
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

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  mapErr<F>(
    fn: (err: E) => F | Promise<F>,
  ): Result<T, F> | ResultPromise<T, F> {
    return this.result.mapErr(fn as (err: E) => F);
  }

  mapResult<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapResult<U> {
    return this.result.mapResult(def, fn);
  }

  mapOption<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapOption<U> {
    return this.result.mapOption(def, fn);
  }

  mapOrElse<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
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

export class PromisedResult<T, E> implements ResultPromise<T, E> {
  private promise: Promise<Result<T, E>>;

  constructor(
    promise: Promise<Result<T, E>>,
  ) {
    this.promise = promise.then((resolved) =>
      isResult<T, E>(resolved) ? resolved : resultFrom(resolved)
    );
  }

  get [Symbol.toStringTag](): string {
    return `PromisedResult`; //this.promise[Symbol.toStringTag];
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
    return resultFrom(
      this.promise.then((result) => result.and(res)),
    );
  }

  andThen<U>(fn: (some: T) => Promise<Result<U, E>>): ResultPromise<U, E>;
  andThen<U>(fn: (some: T) => Result<U, E>): ResultPromise<U, E>;
  andThen<U>(
    fn: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): ResultPromise<U, E> {
    return resultFrom(
      this.promise.then((result) => {
        return result.andThen(fn as (some: T) => Result<U, E>);
      }),
    );
  }

  err(): OptionPromise<E> {
    return optionFrom(this.promise.then((result) => result.err()));
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
    return resultFrom(
      this.promise.then((result) => result.map(fn as (some: T) => Promise<U>)),
    );
  }

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): ResultPromise<T, F>;
  mapErr<F>(
    fn: (err: E) => F | Promise<F>,
  ): Result<T, F> | ResultPromise<T, F> {
    return resultFrom(
      this.promise.then((result) =>
        result.mapErr(fn as (err: E) => Promise<F>)
      ),
    );
  }

  mapResult<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapResult<U> {
    return resultFrom(
      this.promise.then((result) =>
        result.mapResult(def, fn) as Promise<Result<U, E>>
      ),
    ) as ResultPromiseMapResult<U>;
  }

  mapOption<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapOption<U> {
    return optionFrom(
      this.promise.then((result) => result.mapOption(def, fn)) as Promise<
        Option<unknown>
      >,
    ) as ResultPromiseMapOption<U>;
  }

  mapOrElse<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapOrElse<U> {
    return this.promise.then(
      (result) => result.mapOrElse(def, fn) as U,
    ) as ResultPromiseMapOrElse<U>;
  }

  ok(): OptionPromise<T> {
    return optionFrom(this.promise.then((result) => result.ok()));
  }

  or(optb: Result<T, E>): ResultPromise<T, E> {
    return resultFrom(
      this.promise.then((result) => result.or(optb)),
    );
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): ResultPromise<T, E>;
  orElse(fn: (err: E) => Result<T, E>): ResultPromise<T, E>;
  orElse(
    fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): ResultPromise<T, E> {
    return resultFrom(
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
