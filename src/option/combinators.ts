import type {
  MapOption,
  Option,
  OptionMapOption,
  OptionMapOrElse,
  OptionMapResult,
  OptionPromise,
  Result,
  ResultPromise,
} from "./mod.ts";

export interface OptionCombinators<T> {
  [Symbol.iterator]: () => IterableIterator<T>;

  /**
   * Returns None if the option is None, otherwise returns optb.
   *
   * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode andThen}, which is lazily evaluated.
   */
  and<U>(optb: Option<U>): Option<U>;

  /**
   * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   */
  andThen<U>(fn: (some: T) => OptionPromise<U>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Promise<Option<U>>): OptionPromise<U>;
  andThen<U>(fn: (some: T) => Option<U>): Option<U>;

  /**
   * Converts from Option<Option<T>> to Option<T>.
   */
  flatten<U>(this: Option<Option<U>>): Option<U>;
  flatten<U>(this: Option<U>): Option<U>;

  /**
   * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
   *
   *   - Some(t) if predicate returns true (where t is the wrapped value), and
   *   - None if predicate returns false.
   */
  filter(predicate: (some: T) => boolean): Option<T>;

  isSome(): boolean;
  isNone(): boolean;

  /**
   * Maps an Option<T> to an Option<U> by applying a function to a contained value.
   */
  map<U>(fn: (some: T) => U): MapOption<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * When U is `Promise<Option<O>>`, the actual return type will be `OptionPromise<O>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or @see {@linkcode mapResult<U>}for returning non-Option promises
   */
  mapOption<U>(def: () => U, fn: (some: T) => U): OptionMapOption<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * When U is `Promise<Result<T,F>>`, the actual return type will be `ResultPromise<T,F>`.
   * U should not be `Promise<P>` where P is not Option, @see {@linkcode mapOrElse<U>} or {@linkcode mapOption<U>} for returning other promises
   */
  mapResult<U>(def: () => U, fn: (some: T) => U): OptionMapResult<U>;

  /**
   * Computes a default function result (if None), or applies a different function to the contained value (if Some).
   *
   * U should not be `Promise<Option<P>>` @see {@linkcode mapOption<U>}, nor `Promise<Result<T,F>>`{@linkcode mapResult<U>} for
   * returning promises to Option or Result
   */
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): OptionMapOrElse<U>;

  /**
   * Transforms the {@linkcode Option<T>} into a {@linkcode Result<T, E>},
   * mapping {@linkcode Some(v)} to {@linkcode Ok(v)} and {@linkcode None} to {@linkcode Err(err)}.
   *
   * Arguments passed to okOr are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode okOrElse}, which is lazily evaluated.
   */
  okOr<E>(err: E): Result<T, E>;

  /**
   * Transforms the {@linkcode Option<T>} into a {@linkcode Result<T, E>},
   * mapping {@linkcode Some(v)} to {@linkcode Ok(v)} and {@linkcode None} to {@linkcode Err(fn())}.
   */
  okOrElse<E>(fn: () => Promise<E>): ResultPromise<T, E>;
  okOrElse<E>(fn: () => E): Result<T, E>;

  /**
   * Returns the option if it contains a value, otherwise returns optb.
   *
   * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call,
   * it is recommended to use {@linkcode orElse}, which is lazily evaluated.
   */
  or(optb: Option<T>): Option<T>;

  /**
   * Returns the option if it contains a value, otherwise calls f and returns the result.
   */
  orElse(fn: () => Promise<Option<T>>): OptionPromise<T>;
  orElse(fn: () => Option<T>): Option<T>;

  /**
   * Returns the contained Some value or a provided default.
   *
   * Arguments passed to unwrap_or are eagerly evaluated;
   * if you are passing the result of a function call,
   * it is recommended to use {@linkcode unwrapOrElse}, which is lazily evaluated.
   */
  unwrapOr(def: T): T;

  /**
   * Returns the contained Some value or computes it from a closure.
   */
  unwrapOrElse(def: () => T): T;
  unwrapOrElse(def: () => Promise<T>): Promise<T> | T;

  /**
   * Returns Some if exactly one of self, optb is Some, otherwise returns None.
   */
  xor(optb: Option<T>): Option<T>;
}

export interface UnwrapableOption<T> extends OptionCombinators<T> {
  type: symbol;

  unwrap(): T;
}
