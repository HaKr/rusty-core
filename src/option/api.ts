import { type ResultPromise } from "../result/api";
import { type ChainableOption } from "./chainable";
import { NoneValue, SomeValue } from "./implementation";
import { OptionValue, PromisedOption } from "./option";

export function Some<T>(value: T): Option<T> {
  return OptionValue.from(new SomeValue<T>(value));
}

export function None<T>(): Option<T> {
  return OptionValue.from(new NoneValue<T>());
}

export function optionFrom<T>(from: Promise<Option<T>>): OptionPromise<T>;
export function optionFrom<T>(from: T): Option<T>;
export function optionFrom<T>(
  from: undefined | null | number | unknown | Promise<Option<T>>,
): OptionPromise<T> | Option<T> {
  return from instanceof PromisedOption
    ? from
    : from instanceof Promise
    ? PromisedOption.create(from)
    : from === undefined || (typeof from == "object" && from == null) ||
        (typeof from == "number" && (Number.isNaN(from) || from == Infinity))
    ? None()
    : Some(from as T);
}

export interface Option<T> extends ChainableOption<T> {
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
  map<U>(fn: (some: T) => Promise<U>): OptionPromise<U>;
  map<U>(fn: (some: T) => U): OptionPromise<U>;

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
  ): Promise<U>;
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => Promise<U>,
  ): Promise<U>;
  mapOrElse<U>(
    def: () => U,
    fn: (some: T) => U,
  ): Promise<U>;

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
