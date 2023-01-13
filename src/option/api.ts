import {
  OptionCombinators,
  ResultLike,
  ResultLikeShouldUseMapResult,
  ResultPromise,
  ResultPromiseLike,
  ResultPromiseShouldUseMapResult,
} from "./mod";

/**
 * Type `Option<T>` represents an optional value: every Option is either `Some` and contains a value,
 * or `None`, and does not.
 * `Option` types are very common, as they have a number of uses:
 *
 * 	- Initial values
 * 	- Return values for functions that are not defined over their entire input range (partial functions)
 * 	- Return value for otherwise reporting simple errors, where `None` is returned on error
 * 	- Optional fields
 * 	- Optional function arguments
 * 	- Nullable pointers
 * 	- Swapping things out of difficult situations
 *
 * ### A note on (the lack of) unwrap/expect
 *
 * Rust has two methods that might panic: `unwrap` and `expect`
 *
 * ```rust
 * let body = document.body.unwrap();
 * let title = body.get_attribute("title").expect("should have title attribute!");
 * ```
 *
 * Neither of these are implemented in this Javascript library. Use the combinator
 * methods to handle all possibilities:
 *
 * ```typescript
 * const title = document.body()
 *   .map( body => body.getAttribute("title) )
 *   .unwrapOr("*** No title given ***");
 * ```
 *
 * @example
 * ```typescript
 * function divide(numerator: number, denominator: number): Option<number> {
 *   if (denominator === 0) {
 *     return None();
 *   } else {
 *     return Some(numerator / denominator);
 *   }
 * }
 *
 * // The return value of the function is an option
 * const result = divide(2.0, 3.0);
 *
 * // Pattern match to retrieve the value
 * const message = result.mapOrElse(
 *   () => "Cannot divide by 0",
 *   (some) => `Result: ${some}`,
 * );
 *
 * console.log(message); // "Result: 0.6666666666666666"
 *
 * // This can al be done using combinators
 * console.log(
 *   Some(2.0 / 3.0)
 *     .map((some) => `Result: ${some}`)
 *     .unwrapOr("Cannot divide by 0"),
 * );
 * ```
 */
export interface Option<T> extends OptionCombinators<T> {
  /**
   * Inserts value into the option if it is None, then returns a mutable reference to the contained value.
   *
   * See also Option::insert, which updates the value even if the option already contains Some.
   * ```typescript
   * const x = None<{answer: number}>();
   * const y = x.getOrInsert({ answer: 41});
   * y.answer = 42;
   * assertEquals( x, Some({ answer: 42}));
   * ```
   */
  getOrInsert(value: T): T;

  /**
   * Inserts a value computed from f into the option if it is None, then returns a mutable reference to the contained value.
   */
  getOrInsertWith(fn: () => T): T;

  /**
   * Inserts value into the option, then returns a mutable reference to it.
   *
   * If the option already contains a value, the old value is dropped.
   *
   * See also Option::getOrInsert, which doesn’t update the value if the option already contains Some.
   */
  insert(value: T): T;

  /**
   *  Replaces the actual value in the option by the value given in parameter,
   * returning the old value if present, leaving a Some in its place without deinitializing either one.
   *
   * @example
   * ```typescript
   * let mut x = Some(2);
   * let old = x.replace(5);
   * assert_eq!(x, Some(5));
   * assert_eq!(old, Some(2));
   *
   * let mut x = None;
   * let old = x.replace(3);
   * assert_eq!(x, Some(3));
   * assert_eq!(old, None);
   * ```
   */
  replace(value: T): Option<T>;

  /**
   * Takes the value out of the option, leaving a None in its place.
   */
  take(): Option<T>;
}

/**
 * `Option` has several combinator methods, like andThen, orElse
 * and map. Those methods accept one or more callback functions that can be async.
 *
 * The examples below demonstrates how Promises and async callbacks can be combined
 * with the andThen and mapOrElse.
 *
 * @example
 * ```typescript
 * function getAnswer() {
 *   return Promise.resolve(42);
 * }
 *
 * Some(getAnswer())
 *   .map(async (answer) => await Promise.resolve(`${answer}`))
 *   .map((answerText) => `answer: ${answerText}`)
 *   .map(console.log);
 * ```
 */
export interface OptionPromise<T> extends Promise<Option<T>> {
  /**
   * Returns None if the option is None, otherwise returns optb.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode andThen}, which is lazily evaluated.
   */
  and<U>(optb: Option<U>): OptionPromise<U>;

  /**
   * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThen<U>(fn: (some: T) => OptionPromise<U>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): OptionPromise<U>;

  /**
   * Converts from Option<Option<T>> to Option<T>.
   */
  flatten<U>(this: Option<Option<U>>): OptionPromise<U>;
  flatten<U>(this: Option<U>): OptionPromise<U>;

  /**
   * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
   *
   *   - Some(t) if predicate returns true (where t is the wrapped value), and
   *   - None if predicate returns false.
   */
  filter(predicate: (some: T) => boolean): OptionPromise<T>;

  isSome(): Promise<boolean>;
  isNone(): Promise<boolean>;

  /**
   * Maps an Option<T> to an Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => U): OptionPromise<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapOption<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * When U is `Promise<Result<T,F>>`, the actual return type will be `ResultPromise<T,F>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or {@linkcode mapOption<U>} for returning other promises
   */
  mapResult<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapResult<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * When U is `Promise<P>`, the actual return type will be Promise<P>, otherwise the return type will be Promise<U>.
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<U>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionPromiseMapOrElse<U>;

  /**
   * Transforms the {@linkcode Option<T>} into a {@linkcode Result<T, E>},
   * mapping {@linkcode Some(v)} to {@linkcode Ok(v)} and {@linkcode None} to {@linkcode Err(err)}.
   *
   * Arguments passed to okOr are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode okOrElse}, which is lazily evaluated.
   */
  okOr<E>(err: E): ResultPromise<T, E>;

  /**
   * Transforms the {@linkcode Option<T>} into a {@linkcode Result<T, E>},
   * mapping {@linkcode Some(v)} to {@linkcode Ok(v)} and {@linkcode None} to {@linkcode Err(fn())}.
   */
  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E): ResultPromise<T, E>;

  /**
   * Returns the option if it contains a value, otherwise returns optb.
   *
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode orElse}, which is lazily evaluated.
   */
  or(optb: Option<T>): OptionPromise<T>;

  /**
   * Returns the option if it contains a value, otherwise calls f and returns the result.
   */
  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): OptionPromise<T>;

  /**
   * Returns the contained Some value or a provided default.
   *
   * Arguments passed to unwrap_or are eagerly evaluated;
   * if you are passing the result of a function call,
   * it is recommended to use {@linkcode unwrapOrElse}, which is lazily evaluated.
   */
  unwrapOr(def: T): Promise<T>;

  /**
   * Returns the contained Some value or computes it from a closure.
   */
  unwrapOrElse(def: () => T): Promise<T>;
  unwrapOrElse(def: () => Promise<T>): Promise<T>;

  /**
   * Returns Some if exactly one of self, optb is Some, otherwise returns None.
   */
  xor(optb: Option<T>): OptionPromise<T>;
}

export type OptionPromiseShouldUseMapOption =
  "To return a Promise to an Option, use mapOption";
export type OptionLikeShouldUseMapOption =
  "To return (a Promise to) an Option, use mapOption";
export type NoOptionPromiseShouldUseMapOrElse =
  "To return a promise to anything other than Option, use mapOrElse";

/**
 * Value is something that implements an interface with
 * the `OptionPromise` combinators e.g., `andThen`, `orElse`, `map` and `mapOrElse`
 * as well as the Promise<Option> interface
 */
export type OptionPromiseLike<T> = Promise<Option<T>> | OptionPromise<T>;

/**
 * Value is something that implements an interface with
 * the `Option` combinators e.g., `andThen`, `orElse`, `map` and `mapOrElse`
 */
export type OptionLike<T> = Option<T> | OptionPromiseLike<T>;

export type MapOption<U> = U extends Promise<Option<infer O>> ? OptionPromise<O>
  : U extends Promise<infer P> ? OptionPromise<P>
  : U extends Option<infer O> ? Option<O>
  : Option<U>;
export type OptionFrom<U> = U extends
  Promise<Option<infer O>> | OptionPromise<infer O> ? OptionPromise<O>
  : U extends Promise<infer O> ? OptionPromise<O>
  : U extends Option<infer O> ? Option<O>
  : Option<U>;

export type OptionMapOrElse<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromiseShouldUseMapOption
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T;

export type OptionPromiseMapOrElse<T> = T extends OptionLike<infer U>
  ? OptionLikeShouldUseMapOption
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type OptionMapOption<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromise<U>
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T extends Promise<infer P> ? OptionPromise<P>
  : T;

export type OptionPromiseMapOption<T> = T extends OptionLike<infer U>
  ? OptionPromise<U>
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? OptionPromise<P>
  : OptionPromise<T>;

export type OptionMapResult<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionPromiseLike<infer U> ? OptionPromiseShouldUseMapOption
  : T extends Promise<infer P> ? ResultPromise<P, unknown>
  : T;

export type OptionPromiseMapResult<T> = T extends ResultLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? ResultPromise<P, unknown>
  : ResultPromise<T, unknown>;
