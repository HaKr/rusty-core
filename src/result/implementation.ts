import {
  OkFrom,
  ResultLike,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromiseLike,
} from "../conditional_types";
import { None, type Option, Some } from "../option/mod";
import type { Result, ResultPromise } from "./api";
import { Err, Ok } from "./api";
import { PromisedResult, ResultValue, UnwrapableResult } from "./result";

const ResultType = {
  Ok: Symbol(":ok"),
  Err: Symbol(":err"),
};

export class OkValue<T, E> implements UnwrapableResult<T, E> {
  okValue: T;

  constructor(okValue: T) {
    this.okValue = okValue;
  }

  static from<T, E>(ok: T): Result<T, E> {
    return new OkValue(ok);
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

  andThen<U>(op: (some: T) => ResultPromiseLike<U, E>): ResultPromise<U, E>;
  andThen<U>(op: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U>(op: (some: T) => ResultLike<U, E>): ResultLike<U, E> {
    return Ok(op(this.okValue));
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
    return Ok(fn(this.okValue)) as Result<U, E>;
  }

  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;
  mapErr<F>(
    _: (err: E) => Result<T, F> | Promise<Result<T, F>>,
  ): Result<T, F> | ResultPromise<T, F> {
    return Ok(this.okValue) as Result<T, F>;
  }

  mapResult<U>(
    _: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapResult<U> {
    return Ok(fn(this.okValue)) as ResultMapResult<U>;
  }

  mapOption<U>(
    _: (err: E) => U,
    fn: (some: T) => U,
  ): ResultMapOption<U> {
    const rv = fn(this.okValue);
    return (rv instanceof Promise ? Some(rv) : rv) as ResultMapOption<U>;
  }

  mapOrElse<U>(
    _: (err: E) => U,
    fn: (some: T) => U,
  ): ResultMapOrElse<U> {
    return fn(this.okValue) as ResultMapOrElse<U>;
  }

  ok(): Option<T> {
    return Some(this.okValue) as Option<T>;
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

  static from<T, E>(err: E): Result<T, E> {
    return new ErrValue(err);
  }

  and<U>(_: Result<U, E>): Result<U, E> {
    return ResultValue.from(this as unknown as ErrValue<U, E>);
  }

  andThen<U>(fn: (some: T) => ResultPromiseLike<U, E>): PromisedResult<U, E>;
  andThen<U>(fn: (some: T) => Result<U, E>): Result<U, E>;
  andThen<U>(_: (some: T) => ResultLike<U, E>): ResultLike<U, E> {
    return Ok(this) as ResultLike<U, E>;
  }

  err(): Option<E> {
    return Some(this.errValue) as Option<E>;
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
    return Err(fn(this.errValue)) as Result<T, F>;
  }

  mapResult<U>(
    def: (err: E) => U,
    _: (ok: T) => U,
  ): ResultMapResult<U> {
    const rv = def(this.errValue);
    return (rv instanceof Promise ? Ok(rv) : rv) as ResultMapResult<U>;
  }

  mapOption<U>(
    def: (err: E) => U,
    _: (some: T) => U,
  ): ResultMapOption<U> {
    const rv = def(this.errValue);
    return (rv instanceof Promise ? Some(rv) : rv) as ResultMapOption<U>;
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
