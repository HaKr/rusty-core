import {
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
} from "../conditional_types";
import { None, type Option, optionFrom, Some } from "../option/mod";
import type { Result, ResultPromise } from "./api";
import {
  Err,
  Ok,
  PromisedResult,
  resultFrom,
  ResultValue,
  UnwrapableResult,
} from "./result";

const ResultType = {
  Ok: Symbol(":ok"),
  Err: Symbol(":err"),
};

export class OkValue<T, E> implements UnwrapableResult<T, E> {
  okValue: T;

  constructor(okValue: T) {
    this.okValue = okValue;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return [this.okValue][Symbol.iterator]();
  }

  get type(): symbol {
    return ResultType.Ok;
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U>(op: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U>(op: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U>(
    op: (some: T) => Result<U, E> | Promise<Result<U, E>>,
  ): PromisedResult<U, E> | Result<U, E> {
    const alt = op(this.okValue);
    return alt instanceof Promise ? PromisedResult.from(alt) : alt;
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

    return newVal instanceof PromisedResult
      ? newVal
      : newVal instanceof Promise
      ? PromisedResult.from(newVal.then(Ok<U, E>))
      : Ok(newVal);
  }

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  mapErr<F>(
    _: (err: E) => Result<T, F> | Promise<Result<T, F>>,
  ): Result<T, F> | ResultPromise<T, F> {
    return Ok(this.okValue);
  }

  mapResult<U>(
    _: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapResult<U> {
    const rv = fn(this.okValue);
    return (rv instanceof Promise
      ? resultFrom(rv as Promise<Result<unknown, unknown>>)
      : rv) as ResultMapResult<U>;
  }

  mapOption<U>(
    _: (err: E) => U,
    fn: (some: T) => U,
  ): ResultMapOption<U> {
    const rv = fn(this.okValue);
    return (rv instanceof Promise
      ? optionFrom(rv as Promise<Result<unknown, unknown>>)
      : rv) as ResultMapOption<U>;
  }

  mapOrElse<U>(
    _: (err: E) => U,
    fn: (some: T) => U,
  ): ResultMapOrElse<U> {
    return fn(this.okValue) as ResultMapOrElse<U>;
  }

  ok(): Option<T> {
    return Some(this.okValue);
  }

  or(_: Result<T, E>): Result<T, E> {
    return ResultValue.from<T, E>(this);
  }

  orElse(fn: (err: E) => Promise<Result<T, E>>): PromisedResult<T, E>;
  orElse(fn: (err: E) => Result<T, E>): Result<T, E>;
  orElse(
    _: (err: E) => Result<T, E> | Promise<Result<T, E>>,
  ): PromisedResult<T, E> | Result<T, E> {
    return ResultValue.from<T, E>(this);
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

export class ErrValue<T, E> implements UnwrapableResult<T, E> {
  constructor(private errValue: E) {}

  [Symbol.iterator](): IterableIterator<T> {
    return [][Symbol.iterator]();
  }

  and<U>(_: Result<U, E>): Result<U, E> {
    return ResultValue.from(this as unknown as ErrValue<U, E>);
  }

  andThen<U>(fn: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U>(fn: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U>(
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

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  mapErr<F>(
    fn: (err: E) => F | Promise<F>,
  ): Result<T, F> | ResultPromise<T, F> {
    const alt = fn(this.errValue);

    return alt instanceof Promise
      ? resultFrom(alt.then((err) => Err(err)))
      : Err(alt);
  }

  mapResult<U>(
    def: (err: E) => U,
    _: (ok: T) => U,
  ): ResultMapResult<U> {
    const rv = def(this.errValue);
    return (rv instanceof Promise
      ? resultFrom(rv as Promise<Result<unknown, unknown>>)
      : rv) as ResultMapResult<U>;
  }

  mapOption<U>(
    def: (err: E) => U,
    _: (some: T) => U,
  ): ResultMapOption<U> {
    const rv = def(this.errValue);
    return (rv instanceof Promise
      ? optionFrom(rv as Promise<Result<unknown, unknown>>)
      : rv) as ResultMapOption<U>;
  }

  mapOrElse<U>(
    def: (err: E) => U,
    _: (some: T) => U,
  ): ResultMapOrElse<U> {
    return def(this.errValue) as ResultMapOrElse<U>;
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
    return alt instanceof Promise ? PromisedResult.from(alt) : alt;
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
