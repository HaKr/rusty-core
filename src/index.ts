export type { Option, OptionPromise } from "./option/api.ts";
export {
  None,
  NonePromise,
  optionFrom,
  Some,
  SomePromise,
} from "./option/api.ts";

export type { Result, ResultPromise } from "./result/api.ts";
export { Err, ErrPromise, Ok, OkPromise, resultFrom } from "./result/api.ts";
export type {
  OptionMapOrElse,
  OptionMapOrElsePromise,
  OptionPromiseMapOrElse,
  ResultMapOrElse,
  ResultMapOrElsePromise,
  ResultPromiseMapOrElse,
} from "./conditional_types.ts";
