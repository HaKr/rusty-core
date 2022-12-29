import { ChainableOption } from "./chainable.ts";

export const OptionType = {
  Some: Symbol(":some"),
  None: Symbol(":none"),
};

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
   * See also Option::get_or_insert, which doesn’t update the value if the option already contains Some.
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
