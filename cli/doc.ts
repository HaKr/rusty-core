import { isOptionPromise, Ok, Some } from "../src/lib.ts";
import { assertEquals } from "../test/deps.ts";

function getAnswer() {
  return Promise.resolve(42);
}

Ok(getAnswer())
  .map(async (answer) => await Promise.resolve(`${answer}`))
  .map((answerText) => `answer: ${answerText}`)
  .map(console.log);

const vut: unknown = Some(Promise.resolve(42));
if (isOptionPromise<number>(vut)) {
  vut.map(console.log);
}

const futureAnswer = Some(Promise.resolve(42));

futureAnswer
  .then((answer) => assertEquals(answer, Some(42)))
  .then((v) => assertEquals(v, undefined));

futureAnswer
  .map((answer) => assertEquals(answer, 42))
  .map((v) => assertEquals(v, undefined));

/*
Some(42)
  .mapOption(
    // when using Some here, the compiler will error on calculate with an Argument Error
    () => SomePromise(-1),
    calculate,
  );
*/
