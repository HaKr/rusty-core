import { Result, ResultPromise } from "../result/api";
import type { Option, OptionPromise } from "./api";

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
  map<U>(fn: (some: T) => Promise<U>): OptionPromise<U>;
  map<U>(fn: (some: T) => U): Option<U>;

  /**
   * Computes a default function result (if none), or applies a different function to the contained value (if any).
   */
  mapOrElse<U>(
    def: () => OptionPromise<U>,
    fn: (some: T) => OptionPromise<U>,
  ): OptionPromise<U>;
  mapOrElse<U>(
    def: () => Promise<U>,
    fn: (some: T) => Promise<U>,
  ): Promise<U>;
  mapOrElse<U>(
    def: () => Promise<U>,
    fn: (some: T) => U,
  ): Promise<U> | U;
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => Promise<U>,
  ): Promise<U> | U;
  mapOrElse<U>(def: () => U, fn: (some: T) => U): U;

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
