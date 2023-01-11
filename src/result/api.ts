import type {
  ErrFrom,
  OkFrom,
  ResultLike,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromiseLike,
  ResultPromiseMapOption,
  ResultPromiseMapOrElse,
  ResultPromiseMapResult,
} from "../conditional_types.ts";
import { type Option, OptionPromise } from "../option/mod.ts";
import { ErrValue, OkValue } from "./implementation.ts";
import { PromisedResult, ResultValue, UnwrapableResult } from "./result.ts";

export function Ok<T, E>(ok?: T): OkFrom<T, E> {
  return (
    (ok instanceof PromisedResult || ok instanceof ResultValue)
      ? ok
      : (ok instanceof OkValue) || (ok instanceof ErrValue)
      ? ResultValue.from(ok)
      : ok instanceof Promise
      ? PromisedResult.from(ok)
      : ResultValue.from(OkValue.from(ok) as UnwrapableResult<T, E>)
  ) as OkFrom<T, E>;
}

export function OkPromise<T, E>(value: T): ResultPromise<T, E> {
  return Ok(Promise.resolve(value)) as ResultPromise<T, E>;
}

export function Err<T, E>(err?: E): ErrFrom<T, E> {
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

export function ErrPromise<T, E>(err: E): ResultPromise<T, E> {
  return Err(Promise.resolve(err)) as unknown as ResultPromise<T, E>;
}

export function isResult<T, E>(opt: unknown): opt is Result<T, E> {
  return opt instanceof ResultValue;
}

export interface Result<T, E> {
  [Symbol.iterator]: () => IterableIterator<T>;

  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result
   * of a function call, it is recommended to use {@linkcode andThen}, which is lazily evaluated.
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   *
   * This function can be used for control flow based on Result values.
   */
  andThen<U>(op: (some: T) => ResultPromiseLike<U, E>): ResultPromise<U, E>;
  andThen<U>(op: (some: T) => Result<U, E>): Result<U, E>;

  /**
   * Converts from Result<T, E> to Option<E>.
   *
   * Converts self into an {@linkcode Option<E>}, consuming self, and discarding the success value, if any.
   */
  err(): Option<E>;

  isOk(): boolean;
  isErr(): boolean;

  /**
   * Maps an Result<T,E> to an Result<U,E> by applying a function to a contained {@linkcode Ok} value,
   * leaving an {@linkcode Err} value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map<U>(fn: (some: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (some: T) => U): Result<U, E>;

  /**
   * Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   */
  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): Result<T, F>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Result<T,E>>`, the actual return type will be `ResultPromise<T,E>`.
   * U should not be `Promise<P>` where P is not Result, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapOption<U>}for returning non-Result promises
   */
  mapResult<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapResult<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): ResultMapOption<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<T,F>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultMapOrElse<U>;

  /**
   * Converts from {@linkcode Result<T, E>} to {@linkcode Option<T>}.
   *
   * Converts self into an {@linkcode Option<T>}, consuming self, and discarding the error, if any.
   */
  ok(): Option<T>;

  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   *
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode orElse}, which is lazily evaluated.
   */
  or(res: Result<T, E>): Result<T, E>;

  /**
   * Returns the result if it contains a value, otherwise calls f and returns the result.
   */
  orElse(fn: (err: E) => Promise<Result<T, E>>): ResultPromise<T, E>;
  orElse(fn: (err: E) => Result<T, E>): Result<T, E>;

  /**
   * Returns the contained Ok value or a provided default.
   *
   * Arguments passed to unwrap_or are eagerly evaluated;
   * if you are passing the result of a function call,
   * it is recommended to use {@linkcode unwrapOrElse}, which is lazily evaluated.
   */
  unwrapOr(def: T): T;

  /**
   * Returns the contained Ok value or computes it from a closure.
   */
  unwrapOrElse(def: (err: E) => T): T;
  unwrapOrElse(def: (err: E) => Promise<T>): Promise<T> | T;
}

export interface ResultPromise<T, E> extends Promise<Result<T, E>> {
  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result
   * of a function call, it is recommended to use {@linkcode andThen}, which is lazily evaluated.
   */
  and<U>(res: Result<U, E>): ResultPromise<U, E>;

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   *
   * This function can be used for control flow based on Result values.
   */
  andThen<U>(op: (some: T) => ResultLike<U, E>): ResultPromise<U, E>;

  /**
   * Converts from Result<T, E> to Option<E>.
   *
   * Converts self into an {@linkcode Option<E>}, consuming self, and discarding the success value, if any.
   */
  err(): OptionPromise<E>;

  isOk(): Promise<boolean>;
  isErr(): Promise<boolean>;

  /**
   * Maps an Result<T,E> to an Result<U,E> by applying a function to a contained {@linkcode Ok} value,
   * leaving an {@linkcode Err} value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map<U>(fn: (some: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (some: T) => U): ResultPromise<U, E>;

  /**
   * Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   */
  mapErr<F>(fn: (err: E) => Promise<F>): ResultPromise<T, F>;
  mapErr<F>(fn: (err: E) => F): ResultPromise<T, F>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapResult<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapResult<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapOption<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<T,F>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (some: T) => U,
  ): ResultPromiseMapOrElse<U>;

  /**
   * Maps a {@linkcode Result<T, E>} to {@linkcode Result<U,F>} by applying fallback function default to a contained {@linkcode Err} value,
   * or function fn to a contained {@linkcode Ok} value.
   *
   * This function can be used to chain result promises.
   *
   * @see {@linkcode mapResult<U>} for a method that is better
   *      suited for mapping to another return types than result or option
   */
  // resultOrElse<U extends ResultLike<unknown, unknown>>(
  //   def: (err: E) => U,
  //   fn: (ok: T) => U,
  // ): ResultOrElse<U>;

  /**
   * Maps a {@linkcode Result<T, E>} to {@linkcode Option<U>} by applying fallback function default to a contained {@linkcode Err} value,
   * or function fn to a contained {@linkcode Ok} value.
   *
   * This function can be used to chain result and option promises.
   *
   * @see {@linkcode mapResult<U>} for a method that is better
   *      suited for mapping to another return types than result or option
   */
  // optionOrElse<U extends OptionLike<unknown>>(
  //   def: (err: E) => U,
  //   fn: (ok: T) => U,
  // ): OptionOrElse<U>;

  /**
   * Converts from {@linkcode Result<T, E>} to {@linkcode Option<T>}.
   *
   * Converts self into an {@linkcode Option<T>}, consuming self, and discarding the error, if any.
   */
  ok(): OptionPromise<T>;

  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   *
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode orElse}, which is lazily evaluated.
   */
  or(res: Result<T, E>): ResultPromise<T, E>;

  /**
   * Returns the result if it contains a value, otherwise calls f and returns the result.
   */
  orElse(fn: (err: E) => Promise<Result<T, E>>): ResultPromise<T, E>;
  orElse(fn: (err: E) => Result<T, E>): ResultPromise<T, E>;

  /**
   * Returns the contained Ok value or a provided default.
   *
   * Arguments passed to unwrap_or are eagerly evaluated;
   * if you are passing the result of a function call,
   * it is recommended to use {@linkcode unwrapOrElse}, which is lazily evaluated.
   */
  unwrapOr(def: T): Promise<T>;

  /**
   * Returns the contained Ok value or computes it from a closure.
   */
  unwrapOrElse(def: (err: E) => T): Promise<T>;
  unwrapOrElse(def: (err: E) => Promise<T>): Promise<T>;
}
