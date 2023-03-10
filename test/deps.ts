export {
  assert,
  assertEquals,
  assertNotEquals,
  testCase,
} from "./deps.deno.ts";

export type {
  Option,
  OptionPromise,
  Result,
  ResultPromise,
} from "../src/lib.ts";

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
} from "../src/lib.ts";
