import { None, type Option, Some } from "../option/mod.ts";
import { Result, ResultType } from "./api.ts";
import { ChainableResult, UnwrapableResult } from "./chainable.ts";
import { Ok, PromisedResult, ResultValue } from "./result.ts";

export class OkValue<T, E>
  implements ChainableResult<T, E>, UnwrapableResult<T, E> {
  constructor(private okValue: T) {}

  [Symbol.iterator](): IterableIterator<T> {
    return [this.okValue][Symbol.iterator]();
  }

  get type(): symbol {
    return ResultType.Ok;
  }

  and<U, E>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U, E>(op: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U, E>(op: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U, E>(
    op: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): PromisedResult<U, E> | Result<U, E> {
    const alt = op(this.okValue);
    return alt instanceof Promise ? PromisedResult.create(alt) : alt;
  }

  err(): Option<E> {
    return None();
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  /**
   * Maps an Result<T,E> to Result<U,E> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => Promise<U>): PromisedResult<U, E>;
  map<U>(fn: (some: T) => U): Result<U, E>;
  map<U>(
    fn: (some: T) => U | Promise<U>,
  ): Result<U, E> | PromisedResult<U, E> {
    const newVal = fn(this.okValue);

    return newVal instanceof Promise
      ? PromisedResult.create(newVal.then(Ok<U, E>))
      : Ok(newVal);
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
    _: (err: E) => U | Promise<U>,
    fn: (ok: T) => U | Promise<U>,
  ): U | Promise<U> {
    return fn(this.okValue);
  }

  ok(): Option<T> {
    return Some(this.okValue);
  }

  or(_: Result<T, E>): Result<T, E> {
    return ResultValue.from(this);
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): PromisedResult<T, E>;
  orElse(fn: (err: E) => Result<T, E>): Result<T, E>;
  orElse(
    _: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): PromisedResult<T, E> | Result<T, E> {
    return ResultValue.from(this);
  }

  unwrap(): T {
    return this.okValue;
  }

  unwrapOr(_: T): T {
    return this.okValue;
  }

  unwrapOrElse(def: (err: E) => T): T;
  unwrapOrElse(def: (err: E) => Promise<T>): T | Promise<T>;
  unwrapOrElse(_: (err: E) => T | Promise<T>): T {
    return this.okValue;
  }
}

export class ErrValue<T, E>
  implements ChainableResult<T, E>, UnwrapableResult<T, E> {
  constructor(private errValue: E) {}

  [Symbol.iterator](): IterableIterator<T> {
    return [][Symbol.iterator]();
  }

  and<U, E>(_: Result<U, E>): Result<U, E> {
    return ResultValue.from(this as unknown as ErrValue<U, E>);
  }

  andThen<U, E>(fn: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U, E>(fn: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U, E>(
    _: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): PromisedResult<U, E> | Result<U, E> {
    return ResultValue.from(this as unknown as ErrValue<U, E>);
  }

  err(): Option<E> {
    return Some(this.errValue);
  }

  isOk(): boolean {
    return false;
  }
  isErr(): boolean {
    return true;
  }

  map<U>(fn: (some: T) => Promise<U>): PromisedResult<U, E>;
  map<U>(fn: (some: T) => U): Result<U, E>;
  map<U>(
    _: (val: T) => U | Promise<U>,
  ): Result<U, E> | PromisedResult<U, E> {
    return ResultValue.from(this as unknown as ErrValue<U, E>);
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
    _: (some: T) => U | Promise<U>,
  ): U | Promise<U> {
    return def(this.errValue);
  }

  ok(): Option<T> {
    return None();
  }

  or(optb: Result<T, E>): Result<T, E> {
    return optb;
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): PromisedResult<T, E>;
  orElse(fn: (err: E) => Result<T, E>): Result<T, E>;
  orElse(
    fn: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): PromisedResult<T, E> | Result<T, E> {
    const alt = fn(this.errValue);
    return alt instanceof Promise ? PromisedResult.create(alt) : alt;
  }

  unwrap(): T {
    throw new Error("Cannot unwrap None");
  }

  unwrapOr(def: T): T {
    return def;
  }

  unwrapOrElse(def: (err: E) => T): T;
  unwrapOrElse(def: (err: E) => Promise<T>): T | Promise<T>;
  unwrapOrElse(def: (err: E) => Promise<T> | T): T | Promise<T> {
    return def(this.errValue);
  }

  get type(): symbol {
    return ResultType.Err;
  }
}
