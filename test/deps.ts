export { assert, assertEquals, assertNotEquals, testCase } from "./deps.npm";

export type { Option, OptionPromise, Result, ResultPromise } from "../src/lib";

export {
  Err,
  ErrPromise,
  isOption,
  isOptionPromise,
  isResult,
  isResultPromise,
  None,
  NonePromise,
  Ok,
  OkPromise,
  Some,
  SomePromise,
} from "../src/lib";
