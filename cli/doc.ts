import { Err, None, Ok, Option, Result, Some } from "../src";
import { NonePromise, SomePromise } from "../src/option/api";

function divide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) {
    return None();
  } else {
    return Some(numerator / denominator);
  }
}

// The return value of the function is an option
const result = divide(2.0, 3.0);

// Pattern match to retrieve the value
const message = result.mapOrElse(
  () => "Cannot divide by 0",
  (some) => `Result: ${some}`,
);

console.log(message); // "Result: 0.6666666666666666"

// This can al be done using combinators
console.log(
  Some(2.0 / 3.0)
    .map((some) => `Result: ${some}`)
    .unwrapOr("Cannot divide by 0"),
);

const calculate = (s: string) =>
  Promise.resolve(42).then((res) => {
    console.log("calculation finished");
    return res;
  });

console.log("First");
Some(calculate("555"))
  .mapOption(
    () => None<number>(),
    (n) => Some(n % 2 == 0 ? 2 : 1),
  ).map(console.log);

console.log("Second");
Some("555");

None<string>()
  .mapOption(
    () => NonePromise<number>(),
    async (s) => Some(await calculate(s) % 2 == 0 ? 2 : 1),
  ).then(console.log);

function httpStatus(status: number): Result<number, number> {
  return status >= 200 && status < 400 ? Ok(status) : Err(status);
}
console.log(httpStatus(200));
console.log(httpStatus(204));
console.log(httpStatus(404));
