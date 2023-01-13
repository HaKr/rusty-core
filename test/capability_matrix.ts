import {
  assertEquals,
  Err as ResultErr,
  ErrPromise,
  None as OptionNone,
  Ok as ResultOk,
  OkPromise,
  Some as OptionSome,
  SomePromise,
  testCase,
} from "./deps";

type MethodResult = unknown;
type Binding = (value: unknown) => unknown;
type MethodNames = "Some" | "Ok" | "Err";
type MethodResults = Record<MethodNames, MethodResult>;

// get functions in current scope, so eval() can access them
const None = OptionNone;
const Some = OptionSome;
const Ok = ResultOk;
const Err = ResultErr;

const methodResultsPerInput: Map<string, MethodResults> = new Map([
  ["NaN", { Some: None(), Ok: Ok(NaN), Err: Err(NaN) }],
  ["undefined", { Some: None(), Ok: Ok(undefined), Err: Err(undefined) }],
  ["null", { Some: None(), Ok: Ok(null), Err: Err(null) }],
  ["-1", { Some: Some(-1), Ok: Ok(-1), Err: Err(-1) }],
  ["0", { Some: Some(0), Ok: Ok(0), Err: Err(0) }],
  ["1", { Some: Some(1), Ok: Ok(1), Err: Err(1) }],
  ["false", { Some: Some(false), Ok: Ok(false), Err: Err(false) }],
  ["true", { Some: Some(true), Ok: Ok(true), Err: Err(true) }],
  ["''", { Some: Some(""), Ok: Ok(""), Err: Err("") }],
  ["'hello'", { Some: Some("hello"), Ok: Ok("hello"), Err: Err("hello") }],
  ["new Error('ai')", {
    Some: Some(new Error("ai")),
    Ok: Ok(new Error("ai")),
    Err: Err(new Error("ai")),
  }],
  ["None()", { Some: None(), Ok: Ok(None()), Err: Err(None()) }],
  ["Some(2)", { Some: Some(2), Ok: Ok(Some(2)), Err: Err(Some(2)) }],
  ["Some(Some(3))", { Some: Some(3), Ok: Ok(Some(3)), Err: Err(Some(3)) }],
  ["Some(Some(Some(4)))", {
    Some: Some(4),
    Ok: Ok(Some(4)),
    Err: Err(Some(4)),
  }],
  ["Some(None())", { Some: None(), Ok: Ok(None()), Err: Err(None()) }],
  ["Ok(5)", { Some: Some(Ok(5)), Ok: Ok(5), Err: Ok(5) }],
  ["Ok(Some(6))", {
    Some: Some(Ok(Some(6))),
    Ok: Ok(Some(6)),
    Err: Ok(Some(6)),
  }],
  ["Err('expected')", {
    Some: Some(Err("expected")),
    Ok: Err("expected"),
    Err: Err("expected"),
  }],
]);

const methodBinding: Map<MethodNames, Binding> = new Map<MethodNames, Binding>([
  ["Some", Some as Binding],
  ["Ok", Ok],
  ["Err", Err],
]);

const promiseBinding: Map<MethodNames, Binding> = new Map<MethodNames, Binding>(
  [
    ["Some", SomePromise as Binding],
    ["Ok", OkPromise],
    ["Err", ErrPromise],
  ],
);

for (const [input, expectedResults] of methodResultsPerInput) {
  const inputValue = eval(input);
  for (const [methodName, binding] of methodBinding.entries()) {
    const returnValue = binding(inputValue);
    const expected = expectedResults[methodName];
    testCase(
      `${methodName}(${input})`,
      () => assertEquals(returnValue, expected),
    );
  }
  for (const [methodName, binding] of promiseBinding.entries()) {
    const expected = expectedResults[methodName];
    testCase(
      `${methodName}Promise(${input})`,
      async () => assertEquals(await binding(inputValue), expected),
    );
  }
}
