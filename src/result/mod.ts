export type {
  ErrFrom,
  NoResultPromiseShouldUseMapOrElse,
  OkFrom,
  Result,
  ResultLike,
  ResultLikeShouldUseMapResult,
  ResultMapOption,
  ResultMapOrElse,
  ResultMapResult,
  ResultPromise,
  ResultPromiseLike,
  ResultPromiseMapOption,
  ResultPromiseMapOrElse,
  ResultPromiseMapResult,
  ResultPromiseShouldUseMapResult,
  UnwrapableResult,
} from "./api.ts";
export type {
  NoOptionPromiseShouldUseMapOrElse,
  Option,
  OptionLike,
  OptionLikeShouldUseMapOption,
  OptionPromise,
  OptionPromiseLike,
  OptionPromiseShouldUseMapOption,
} from "../option/mod.ts";
export { None, Some } from "../option/mod.ts";
export { ErrValue, OkValue } from "./implementation.ts";
export {
  Err,
  ErrPromise,
  isResult,
  isResultPromise,
  Ok,
  OkPromise,
  PromisedResult,
  ResultValue,
} from "./result.ts";
