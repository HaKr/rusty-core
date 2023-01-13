import {
  NoOptionPromiseShouldUseMapOrElse,
  Option,
  OptionLike,
  OptionLikeShouldUseMapOption,
  OptionPromise,
  OptionPromiseLike,
  OptionPromiseShouldUseMapOption,
} from "./mod.ts";

/**
 * Type `Result<T,E>` represents an result value: every `Result` is either `Ok` and
 * contains a value of type `T`, or `Err`, which holds an error value of type `E`.
 * When using `Result` throwing `Errors` is no longer necessary. Just make sure
 * that `Result` values are properly mapped to other values, or other error types.
 *
 * @example
 * ```typescript
 * class CannotDivideByZero {}
 *
 * function divide(
 *   numerator: number,
 *   denominator: number,
 * ): Result<number, CannotDivideByZero> {
 *   if (denominator === 0) {
 *     return Err(new CannotDivideByZero());
 *   } else {
 *     return Ok(numerator / denominator);
 *   }
 * }
 *
 * // The return value of the function is always a result
 * for (const result of [divide(7, 0), divide(2.0, 3.0)]) {
 *   result.mapOrElse(
 *     (_) => console.error("Cannot divide by zero"),
 *     (ok) => console.log(`Result: ${ok}`),
 *   );
 * }
 * // "Cannot divide by zero"
 * // "Result: 0.6666666666666666"
 * ```
 */
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
  andThen<U>(op: (val: T) => ResultPromiseLike<U, E>): ResultPromise<U, E>;
  andThen<U>(op: (val: T) => Result<U, E>): Result<U, E>;

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
  map<U>(fn: (value: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (value: T) => U): Result<U, E>;

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
    fn: (value: T) => U,
  ): ResultMapResult<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultMapOption<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<T,F>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
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

/**
 * `Result` has several combinator methods, like andThen, orElse
 * and map. Those methods accept one or more callback functions that can be async.
 *
 * The examples below demonstrates how Promises and async callbacks can be combined
 * with the andThen and mapOrElse.
 *
 * @example
 *
 * ```typescript
 * type ToDo = { userId: number; id: number; title: string; completed: boolean };
 *
 * function doFetch(url: string): ResultPromise<Response, string> {
 *   return Ok(
 *     fetch(url)
 *       .then(
 *         Ok<Response, string>,
 *         (err) => Err<Response, string>(err.toString()),
 *       ),
 *   );
 * }
 *
 * function fetchJson(url: string): ResultPromise<ToDo, string> {
 *   return doFetch(url)
 *     .andThen(async (response) => {
 *       if (response.ok) return Ok<ToDo, string>(await response.json());
 *       else {return Err(
 *           `${response.status} ${response.statusText}: ${await response.text()}`,
 *         );}
 *     });
 * }
 *
 * fetchJson("https:///jsonplaceholder.typicode.com/todos/1")
 *   .mapOrElse(
 *     (err) => console.error("Failed:", err),
 *     (todo) => console.log("Success:", todo.title),
 *   );
 * ```
 */

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
  andThen<U>(op: (value: T) => ResultLike<U, E>): ResultPromise<U, E>;

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
  map<U>(fn: (value: T) => Promise<U>): ResultPromise<U, E>;
  map<U>(fn: (value: T) => U): ResultPromise<U, E>;

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
    fn: (value: T) => U,
  ): ResultPromiseMapResult<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultPromiseMapOption<U>;

  /**
   * Computes a default function result (if Err), or applies a different function to the contained value (if Ok).
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<T,F>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: (err: E) => U,
    fn: (value: T) => U,
  ): ResultPromiseMapOrElse<U>;

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

export interface UnwrapableResult<T, E> extends Result<T, E> {
  type: symbol;

  unwrap(): T;
}

export type ResultPromiseShouldUseMapResult =
  "To return a Promise to a Result, use mapResult";
export type ResultLikeShouldUseMapResult =
  "To return (a Promise to) a Result, use mapResult";
export type NoResultPromiseShouldUseMapOrElse =
  "To return a promise to anything other than Result, use mapOrElse";

/**
 * Value is something that implements an interface with
 * the `ResultPromise` combinators e.g., `andThen`, `orElse`, `map` and `mapOrElse`
 * as well as the Promise<Result> interface
 */
export type ResultPromiseLike<T, E> =
  | Promise<Result<T, E>>
  | ResultPromise<T, E>;
/**
 * Value is something that implements an interface with
 * the `Result` combinators e.g., `andThen`, `orElse`, `map` and `mapOrElse`
 */
export type ResultLike<T, E> = Result<T, E> | ResultPromiseLike<T, E>;

export type OkFrom<U, E> = U extends ResultPromiseLike<infer T, infer F>
  ? ResultPromise<T, F>
  : U extends Promise<infer O> ? ResultPromise<O, E>
  : U extends Result<infer T, infer F> ? Result<T, F>
  : U extends false | true ? Result<boolean, E>
  : Result<U, E>;

export type ErrFrom<U, E> = E extends ResultPromiseLike<infer T, infer F>
  ? ResultPromise<T, F>
  : E extends Promise<infer O> ? ResultPromise<U, O>
  : E extends Result<infer T, infer F> ? Result<T, F>
  : E extends false | true ? Result<U, boolean>
  : Result<U, E>;

export type ResultMapOrElse<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromiseShouldUseMapResult
  : T extends OptionLike<T> ? OptionPromiseShouldUseMapOption
  : T;

export type ResultPromiseMapOrElse<T> = T extends ResultLike<infer U, infer F>
  ? ResultLikeShouldUseMapResult
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type ResultMapOption<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromise<U>
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : T;

export type ResultPromiseMapOption<T> = T extends OptionLike<infer U>
  ? OptionPromise<U>
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : Promise<T>;

export type ResultMapResult<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionPromiseLike<infer U> ? OptionPromiseShouldUseMapOption
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : T;

export type ResultPromiseMapResult<T> = T extends ResultLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? NoOptionPromiseShouldUseMapOrElse
  : Promise<T>;
