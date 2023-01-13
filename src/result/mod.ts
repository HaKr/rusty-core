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
} from "./api";
export type {
  NoOptionPromiseShouldUseMapOrElse,
  Option,
  OptionLike,
  OptionLikeShouldUseMapOption,
  OptionPromise,
  OptionPromiseLike,
  OptionPromiseShouldUseMapOption,
} from "../option/mod";
export { None, Some } from "../option/mod";
export { ErrValue, OkValue } from "./implementation";
export {
  Err,
  ErrPromise,
  isResult,
  isResultPromise,
  Ok,
  OkPromise,
  PromisedResult,
  ResultValue,
} from "./result";
