export type {
  Option,
  OptionLike,
  OptionPromise,
  OptionPromiseLike,
} from "./option/mod.ts";
export type {
  Result,
  ResultLike,
  ResultPromise,
  ResultPromiseLike,
} from "./result/mod.ts";

export {
  isOption,
  isOptionPromise,
  None,
  NonePromise,
  Some,
  SomePromise,
} from "./option/mod.ts";
export {
  Err,
  ErrPromise,
  isResult,
  isResultPromise,
  Ok,
  OkPromise,
} from "./result/mod.ts";

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
