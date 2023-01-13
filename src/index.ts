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
