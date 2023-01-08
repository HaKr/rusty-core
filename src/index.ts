export type { Option, OptionPromise } from "./option/api";
export { None, NonePromise, optionFrom, Some, SomePromise } from "./option/api";

export type { Result, ResultPromise } from "./result/api";
export { Err, ErrPromise, Ok, OkPromise, resultFrom } from "./result/api";
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
} from "./conditional_types";
