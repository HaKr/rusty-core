import { type Option, OptionPromise } from "../option/mod.ts";
import { ErrValue, OkValue } from "./implementation.ts";
import { PromisedResult, ResultValue } from "./result.ts";

export function Ok<T, E>(value: T): Result<T, E> {
  return ResultValue.from(new OkValue<T, E>(value));
}

export function OkPromise<T, E>(value: T): ResultPromise<T, E> {
  return resultFrom(Promise.resolve(Ok(value)));
}

export function Err<T, E>(err: E): Result<T, E> {
  return ResultValue.from(new ErrValue<T, E>(err));
}

export function ErrPromise<T, E>(err: E): ResultPromise<T, E> {
  return resultFrom(Promise.resolve(Err(err)));
}

export function resultFrom<T, E>(
  from: Promise<Result<T, E>>,
): ResultPromise<T, E> {
  return PromisedResult.from(from);
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
  andThen<U>(op: (some: T) => Promise<Result<U, E>>): ResultPromise<U, E>;
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
   * Maps a {@linkcode Result<T, E>} to U by applying fallback function default to a contained {@linkcode Err} value,
   * or function f to a contained {@linkcode Ok} value.
   *
   * This function can be used to unpack a successful result while handling an error.
   */
  mapOrElse<U, F>(
    def: (err: E) => ResultPromise<U, F>,
    fn: (ok: T) => ResultPromise<U, F>,
  ): ResultPromise<U, F>;
  mapOrElse<U, F>(
    def: (err: E) => ResultPromise<U, F>,
    fn: (ok: T) => Result<U, F>,
  ): never;
  mapOrElse<U, F>(
    def: (err: E) => Result<U, F>,
    fn: (ok: T) => ResultPromise<U, F>,
  ): never;
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
  andThen<U>(op: (some: T) => Promise<Result<U, E>>): ResultPromise<U, E>;
  andThen<U>(op: (some: T) => Result<U, E>): ResultPromise<U, E>;

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
   * Maps a {@linkcode Result<T, E>} to U by applying fallback function default to a contained {@linkcode Err} value,
   * or function f to a contained {@linkcode Ok} value.
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * @returns `never` when any of the callback would return an Option or a Result,
   *          indication you probably should use {@linkcode resultOrElse<U, F>} or {@linkcode optionOrElse<U>}
   * @see {@linkcode resultOrElse<U, F>} or {@linkcode optionOrElse<U>} for methods that are better
   *      suited for asynchronous mapping to another result or option
   */
  mapOrElse<U, F>(
    def: (err: E) => Result<U, F> | ResultPromise<U, F>,
    fn: (ok: T) => Result<U, F> | ResultPromise<U, F>,
  ): never;
  mapOrElse<U, F>(
    def: () => Option<U> | OptionPromise<U>,
    fn: (ok: T) => Option<U> | OptionPromise<U>,
  ): never;
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (ok: T) => U,
  ): Promise<U>;

  /**
   * Maps a {@linkcode Result<T, E>} to {@linkcode Result<U,F>} by applying fallback function default to a contained {@linkcode Err} value,
   * or function fn to a contained {@linkcode Ok} value.
   *
   * This function can be used to chain result promises.
   *
   * @see {@linkcode mapOrElse<U>} for a method that is better
   *      suited for mapping to another return types than result or option
   */
  resultOrElse<U, F>(
    def: (err: E) => Result<U, F>,
    fn: (ok: T) => Result<U, F>,
  ): ResultPromise<U, F>;
  resultOrElse<U, F>(
    def: (err: E) => ResultPromise<U, F>,
    fn: (ok: T) => ResultPromise<U, F>,
  ): ResultPromise<U, F>;

  /**
   * Maps a {@linkcode Result<T, E>} to {@linkcode Option<U>} by applying fallback function default to a contained {@linkcode Err} value,
   * or function fn to a contained {@linkcode Ok} value.
   *
   * This function can be used to chain result and option promises.
   *
   * @see {@linkcode mapOrElse<U>} for a method that is better
   *      suited for mapping to another return types than result or option
   */
  optionOrElse<U>(
    def: (err: E) => Option<U>,
    fn: (ok: T) => Option<U>,
  ): OptionPromise<U>;
  optionOrElse<U, F>(
    def: (err: E) => OptionPromise<U>,
    fn: (ok: T) => OptionPromise<U>,
  ): OptionPromise<U>;

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
