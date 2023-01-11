export type { Option, OptionPromise } from "./option/api.ts";
export { None, NonePromise, Some, SomePromise } from "./option/api.ts";

export type { Result, ResultPromise } from "./result/api.ts";
export { Err, ErrPromise, Ok, OkPromise } from "./result/api.ts";
export type {
  OptionLike,
  OptionMapOption,
  OptionMapOrElse,
  OptionMapResult,
  OptionPromiseLike,
  OptionPromiseMapOption,
  OptionPromiseMapOrElse,
  OptionPromiseMapResult,
  ResultLike,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromiseLike,
  ResultPromiseMapOption,
  ResultPromiseMapOrElse,
  ResultPromiseMapResult,
} from "./conditional_types.ts";
