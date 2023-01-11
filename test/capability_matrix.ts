import assert from "node:assert/strict";
import { SomePromise } from "../src/option/api";
import { ErrPromise, OkPromise } from "../src/result/api";
import {
  Err as ResultErr,
  None as OptionNone,
  Ok as ResultOk,
  Some as OptionSome,
} from "../src/index";

type MethodResult = unknown;
type Binding = (value: unknown) => unknown;
type MethodNames = "Some" | "Ok" | "Err";
type MethodResults = Record<MethodNames, MethodResult>;

// get functions in current scope, so eval() can access them
const None = OptionNone;
const Some = OptionSome;
const Ok = ResultOk;
const Err = ResultErr;

const methodBinding: Map<MethodNames, Binding> = new Map([
  ["Some", Some as Binding],
  ["Ok", Ok],
  ["Err", Err],
]);

const promiseBinding: Map<MethodNames, Binding> = new Map([
  ["Some", SomePromise as Binding],
  ["Ok", OkPromise],
  ["Err", ErrPromise],
]);

const methodResultsPerInput: Map<string, MethodResults> = new Map([
  ["NaN", { Some: None(), Ok: Ok(NaN), Err: Err(NaN) }],
  ["undefined", { Some: None(), Ok: Ok(), Err: Err() }],
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

for (const [input, expectedResults] of methodResultsPerInput) {
  const inputValue = eval(input);
  for (const [methodName, binding] of methodBinding.entries()) {
    const returnValue = binding(inputValue);
    const expected = expectedResults[methodName];
    it(`${methodName}(${input})`, () =>
      assert.deepStrictEqual(returnValue, expected));
  }
  for (const [methodName, binding] of promiseBinding.entries()) {
    const expected = expectedResults[methodName];
    it(`${methodName}Promise(${input})`, async () =>
      assert.deepStrictEqual(await binding(inputValue), expected));
  }
}
