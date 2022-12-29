import { type Option } from "../option/mod.ts";
import { Result } from "./api.ts";
import { PromisedResult } from "./result.ts";

export interface ChainableResult<T, E> {
  [Symbol.iterator]: () => IterableIterator<T>;

  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result
   * of a function call, it is recommended to use {@linkcode andThen}, which is lazily evaluated.
   */
  and<U, E>(res: Result<U, E>): Result<U, E>;

  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   *
   * This function can be used for control flow based on Result values.
   */
  andThen<U, E>(op: (some: T) => Promise<Result<U, E>>): PromisedResult<U, E>;
  andThen<U, E>(op: (some: T) => Result<U, E>): Result<U, E>;

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
  map<U, E>(fn: (some: T) => Promise<U>): PromisedResult<U, E>;
  map<U, E>(fn: (some: T) => U): Result<U, E>;

  /**
   * Maps a {@linkcode Result<T, E>} to U by applying fallback function default to a contained {@linkcode Err} value,
   * or function f to a contained {@linkcode Ok} value.
   *
   * This function can be used to unpack a successful result while handling an error.
   */
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
  orElse(fn: (err: E) => Promise<Result<T, E>>): PromisedResult<T, E>;
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

export interface UnwrapableResult<T, E> extends ChainableResult<T, E> {
  type: symbol;

  unwrap(): T;
}
