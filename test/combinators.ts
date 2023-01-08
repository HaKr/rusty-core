import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.170.0/testing/asserts.ts";
import {
  Err,
  ErrPromise,
  Ok,
  OkPromise,
  Result,
  ResultPromise,
} from "../src/index.ts";

import {
  NonePromise,
  type Option,
  OptionPromise,
  Some,
  SomePromise,
} from "../src/option/api.ts";
import { OptionValue, PromisedOption } from "../src/option/option.ts";
import { PromisedResult } from "../src/result/result.ts";

function promisify<T>(arg: T) {
  return Promise.resolve(arg);
}

function sleep(ms: number): Promise<number> {
  return Promise.resolve(ms / 1_000.0);
}

type ExpectedValue =
  | OptionPromise<number>
  | OptionPromise<string>
  | Option<string>
  | Option<number>
  | Result<number, number>
  | ResultPromise<number, number>
  | Promise<string>
  | Promise<number>
  | string
  | number;
type Expectation = ((v: ExpectedValue) => void | never) | ExpectedValue;
type Task = {
  fn: (ms: Option<number>) => ExpectedValue;
  expected?: Expectation;
  expectedThen?: Expectation;
  expectedMap?: Expectation;
};

const tasks: { [key: string]: Task } = {
  "Option.mapOrElse to number": {
    fn: (ms: Option<number>) => {
      return ms.mapOrElse(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 101,
  },
  "Option.mapOrElse to Option": {
    fn: (ms: Option<number>) =>
      ms.mapOrElse(
        () => Some(0),
        Some,
      ),
    expected: Some(102),
  },
  "Option.mapOrElse to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.mapOrElse(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expectedThen: Some(0.103),
  },
  "Option.mapOrElse to Promise": {
    fn: (ms: Option<number>) =>
      ms.mapOrElse(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: ((actual) => assert(actual instanceof Promise)),
    expectedThen: 104,
  },

  "OptionPromise.mapOrElse to number": {
    fn: (ms: Option<number>) => {
      return ms.map(promisify).mapOrElse(
        () => 0,
        (ms) => ms,
      );
    },
    expectedThen: 105,
  },
  "OptionPromise.mapOrElse to Option": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOrElse(
        () => Some(0),
        Some,
      ),
    expected: ((actual) => assert(actual instanceof Promise)),
    expectedThen: Some(106),
  },
  "OptionPromise.mapOrElse to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOrElse(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expectedThen: Some(0.107),
  },
  "OptionPromise.mapOrElse to Promise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOrElse(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: ((actual) => assert(actual instanceof Promise)),
    expectedThen: 108,
  },
  "Option.mapOption to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.mapOption(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expectedThen: (v: ExpectedValue) => assert(v instanceof OptionValue),
    expectedMap: 0.109,
  },

  "Option.mapOption to number": {
    fn: (ms: Option<number>) => {
      return ms.mapOption(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 110,
  },

  "Option.mapOption to Option": {
    fn: (ms: Option<number>) =>
      ms.mapOption(
        () => Some(0),
        Some,
      ),
    expected: Some(111),
  },
  "Option.mapOption to Promise": {
    fn: (ms: Option<number>) =>
      ms.mapOption(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    // Illogical combination: OptionPromise returned, but resolves to number, not Option<number>
    // Type inference wil show a string as warning
    expected: ((actual) => assert(actual instanceof PromisedOption)),
    expectedThen: 112,
  },
  "OptionPromise.mapOption to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expectedThen: (v: ExpectedValue) => assert(v instanceof OptionValue),
    expectedMap: 0.113,
  },

  "OptionPromise.mapOption to number": {
    fn: (ms: Option<number>) => {
      return ms.map(promisify).mapOption(
        () => 0,
        (ms) => ms,
      );
    },
    expectedThen: 114,
  },

  "OptionPromise.mapOption to Option": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => Some(0),
        Some,
      ),
    expectedMap: 115,
  },
  "OptionPromise.mapOption to Promise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: ((actual) => assert(actual instanceof PromisedOption)),
    expectedThen: 116,
  },

  "Option.mapResult to number": {
    fn: (ms: Option<number>) => {
      return ms.mapResult(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 117,
  },
  "Option.mapResult to Option": {
    fn: (ms: Option<number>) =>
      ms.mapResult(
        () => Some(0),
        Some,
      ),
    expectedMap: 118,
  },
  "Option.mapResult to Result": {
    fn: (ms: Option<number>) =>
      ms.mapResult(
        () => Err(0),
        Ok<number, number>,
      ),
    expected: Ok(119),
    expectedMap: 119,
  },
  "Option.mapResult to ResultPromise": {
    fn: (ms: Option<number>) =>
      ms.mapResult(
        () => ErrPromise(0),
        OkPromise<number, number>,
      ),
    expectedThen: Ok(120),
    expectedMap: 120,
  },
  "Option.mapResult to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.mapResult(
        () => NonePromise(),
        SomePromise,
      ),
    expectedThen: Some(121),
    expectedMap: 121,
  },
  "Option.mapResult to Promise": {
    fn: (ms: Option<number>) =>
      ms.mapResult(
        () => Promise.resolve(""),
        (some) => Promise.resolve(`${some}`),
      ),
    expected: ((rv) => assert(rv instanceof PromisedResult)),
    expectedThen: "122",
  },
  "OptionPromise.mapResult to number": {
    fn: (ms: Option<number>) => {
      return ms.map(promisify).mapResult(
        () => 0,
        (ms) => ms,
      );
    },
    expectedThen: 123,
  },
  "OptionPromise.mapResult to Option": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => Some(0),
        Some,
      ),
    expectedThen: Some(124),
  },
  "OptionPromise.mapResult to Result": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => Err(0),
        Ok<number, number>,
      ),
    expectedThen: Ok(125),
    expectedMap: 125,
  },
  "OptionPromise.mapResult to ResultPromise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => ErrPromise<number, number>(0),
        OkPromise<number, number>,
      ),
    expectedThen: Ok(126),
    expectedMap: 126,
  },
  "OptionPromise.mapResult to OptionPromise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => NonePromise(),
        SomePromise,
      ),
    expectedThen: Some(127),
    expectedMap: 127,
  },
  "OptionPromise.mapResult to Promise": {
    fn: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => Promise.resolve(""),
        (some) => Promise.resolve(`${some}`),
      ),
    expected: ((rv) => assert(rv instanceof PromisedResult)),
    expectedThen: "128",
  },
};

interface Mapable {
  map(fn: (n: ExpectedValue) => unknown): Option<unknown>;
}

function asMapable(v: ExpectedValue, expected: Expectation): Mapable {
  const mapable = (v as unknown as Mapable);
  return (typeof mapable.map == "function") ? mapable : {
    map: (_: (actual: ExpectedValue) => ExpectedValue) => {
      assert(false, `Expected an Option or OptionPromise to ${expected}`);
    },
  };
}

interface Thenable {
  then(fn: (actual: ExpectedValue) => void): void;
}

function asThenable(v: ExpectedValue, expected: Expectation): Thenable {
  const thenable = (v as unknown as Thenable);
  return (typeof thenable.then == "function") ? thenable : {
    then: (_: (actual: ExpectedValue) => void) =>
      assert(false, `Expected a promise to ${expected}`),
  };
}

function check(actual: ExpectedValue, expected: Expectation) {
  if (typeof expected == "function") expected(actual);
  else assertEquals(actual, expected);
}

function taskRunner(
  ms: number,
  task: Task,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const expectedThen = task.expectedThen;
    const expectedMap = task.expectedMap;
    const noThen = expectedThen == undefined;
    const noMap = expectedMap == undefined;

    try {
      const rv = task.fn(Some(ms));
      if (task.expected !== undefined) check(rv, task.expected);
      if (noThen && noMap) resolve();

      if (expectedThen !== undefined) {
        asThenable(rv, expectedThen).then((actual) => {
          try {
            check(actual, expectedThen);
          } catch (e) {
            reject(e);
          }

          if (noMap) resolve();
        });
      }
      if (expectedMap !== undefined) {
        asMapable(rv, expectedMap).map((actual) => {
          try {
            check(actual, expectedMap);
          } catch (e) {
            reject(e);
          }
          resolve();
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

let ms = 101;
for (const taskName in tasks) {
  Deno.test(taskName, async () => await taskRunner(ms++, tasks[taskName]));
}
