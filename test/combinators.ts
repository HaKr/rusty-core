import {
  assert,
  assertEquals,
  Err,
  ErrPromise,
  isOptionPromise,
  isResultPromise,
  NonePromise,
  Ok,
  OkPromise,
  type Option,
  OptionPromise,
  Result,
  ResultPromise,
  Some,
  SomePromise,
  testCase,
} from "./deps";

type ExpectedValue =
  | OptionPromise<unknown>
  | Option<unknown>
  | Result<unknown, unknown>
  | ResultPromise<unknown, unknown>
  | Promise<unknown>
  | string
  | number;
type Expectation = ((v: ExpectedValue) => void | never) | ExpectedValue;
type Task = {
  action: (ms: Option<number>) => ExpectedValue;
  /** Value expected to be returned from `action`, or a function to check the returned value with */
  expected: Expectation;
  /**
   * Value expected to be passed to promise.then(), or a function to check it with
   * if this value is omitted, the return from `action` may not be a promise like
   */
  expectedThen?: Expectation;
  /**
   * Value expected to be passed to option.map()/result.map(), or a function to check it with
   * if this value is omitted, there may be no map function on the return from `action`
   */
  expectedMap?: Expectation;
};

function isPromise(p: unknown): p is Promise<unknown> {
  return p instanceof Promise;
}

function promisify<T>(arg: T) {
  return Promise.resolve(arg);
}

function sleep(ms: number): Promise<number> {
  return Promise.resolve(ms / 1_000.0);
}

const tasks: { [key: string]: Task } = {
  "Option.mapOrElse to number": {
    action: (ms: Option<number>) => {
      return ms.mapOrElse(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 101,
  },
  "Option.mapOrElse to Option": {
    action: (ms: Option<number>) =>
      ms.mapOrElse(
        () => Some(0),
        Some,
      ),
    expected: Some(102),
    expectedMap: 102,
  },
  "Option.mapOrElse to OptionPromise compile error: return type is Promise<Option>>, thus no combinators":
    {
      action: (ms: Option<number>) =>
        ms.mapOrElse(
          () => SomePromise(0),
          async (ms) => Some(await sleep(ms)),
        ),
      expected: isPromise,
      expectedThen: Some(0.103),
    },
  "Option.mapOrElse to Promise": {
    action: (ms: Option<number>) =>
      ms.mapOrElse(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: isPromise,
    expectedThen: 104,
  },

  "OptionPromise.mapOrElse to number": {
    action: (ms: Option<number>) => {
      return ms.map(promisify).mapOrElse(
        () => 0,
        (ms) => ms,
      );
    },
    expected: isPromise,
    expectedThen: 105,
  },
  "OptionPromise.mapOrElse to Option: compile warning as return type is Promise<Option>>, thus no combinators":
    {
      action: (ms: Option<number>) =>
        ms.map(promisify).mapOrElse(
          () => Some(0),
          Some,
        ),
      expected: isPromise,
      expectedThen: Some(106),
    },
  "OptionPromise.mapOrElse to OptionPromise: compile warning as return type is Promise<OptionPromise>>, thus no combinators":
    {
      action: (ms: Option<number>) =>
        ms.map(promisify).mapOrElse(
          () => SomePromise(0),
          async (ms) => Some(await sleep(ms)),
        ),
      expected: isOptionPromise,
      expectedThen: Some(0.107),
    },
  "OptionPromise.mapOrElse to Promise": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapOrElse(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: isPromise,
    expectedThen: 108,
  },

  "Option.mapOption to OptionPromise": {
    action: (ms: Option<number>) =>
      ms.mapOption(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expected: isOptionPromise,
    expectedThen: Some(0.109),
    expectedMap: 0.109,
  },

  "Option.mapOption to number": {
    action: (ms: Option<number>) => {
      return ms.mapOption(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 110,
  },

  "Option.mapOption to Option": {
    action: (ms: Option<number>) =>
      ms.mapOption(
        () => Some(0),
        Some,
      ),
    expected: Some(111),
    expectedMap: 111,
  },
  "Option.mapOption to Promise": {
    action: (ms: Option<number>) =>
      ms.mapOption(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: isOptionPromise,
    expectedThen: Some(112),
    expectedMap: 112,
  },
  "OptionPromise.mapOption to OptionPromise": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => SomePromise(0),
        async (ms) => Some(await sleep(ms)),
      ),
    expected: isOptionPromise,
    expectedThen: Some(0.113),
    expectedMap: 0.113,
  },

  "OptionPromise.mapOption to number": {
    action: (ms: Option<number>) => {
      return ms.map(promisify).mapOption(
        () => 0,
        (ms) => ms,
      );
    },
    expected: isOptionPromise,
    expectedThen: Some(114),
    expectedMap: 114,
  },

  "OptionPromise.mapOption to Option": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => Some(0),
        Some,
      ),
    expected: isOptionPromise,
    expectedThen: Some(115),
    expectedMap: 115,
  },
  "OptionPromise.mapOption to Promise": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapOption(
        () => Promise.resolve(0),
        (ms) => Promise.resolve(ms),
      ),
    expected: isOptionPromise,
    expectedThen: Some(116),
    expectedMap: 116,
  },

  "Option.mapResult to number": {
    action: (ms: Option<number>) => {
      return ms.mapResult(
        () => 0,
        (ms) => ms,
      );
    },
    expected: 117,
  },
  "Option.mapResult to Option: weird, but allowed": {
    action: (ms: Option<number>) =>
      ms.mapResult(
        () => Some(0),
        Some,
      ),
    expected: Some(118),
    expectedMap: 118,
  },
  "Option.mapResult to Result": {
    action: (ms: Option<number>) =>
      ms.mapResult(
        () => Err<number, number>(0),
        Ok<number, number>,
      ),
    expected: Ok(119),
    expectedMap: 119,
  },
  "Option.mapResult to ResultPromise": {
    action: (ms: Option<number>) =>
      ms.mapResult(
        () => ErrPromise(0),
        OkPromise<number, number>,
      ),
    expected: isResultPromise,
    expectedThen: Ok(120),
    expectedMap: 120,
  },
  "Option.mapResult to OptionPromise compile error: mapResult combinators would expect Result, not Option":
    {
      action: (ms: Option<number>) =>
        ms.mapResult(
          () => NonePromise(),
          SomePromise,
        ),
      expected: isOptionPromise,
      expectedThen: Some(121),
      expectedMap: 121,
    },
  "Option.mapResult to Promise": {
    action: (ms: Option<number>) =>
      ms.mapResult(
        () => Promise.resolve(""),
        (some) => Promise.resolve(`${some}`),
      ),
    expected: isResultPromise,
    expectedThen: Ok("122"),
    expectedMap: "122",
  },
  "OptionPromise.mapResult to number": {
    action: (ms: Option<number>) => {
      return ms.map(promisify).mapResult(
        () => 0,
        (ms) => ms,
      );
    },
    expected: isResultPromise,
    expectedThen: Ok(123),
    expectedMap: 123, // to here
  },
  "OptionPromise.mapResult to Option: compiler warning mapResult combinators would expect Result, not Option":
    {
      action: (ms: Option<number>) =>
        ms.map(promisify).mapResult(
          () => Some(0),
          Some,
        ),
      expected: isOptionPromise,
      expectedThen: Ok(Some(124)),
      expectedMap: Some(124),
    },
  "OptionPromise.mapResult to Result": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => Err(0),
        Ok<number, number>,
      ),
    expected: isResultPromise,
    expectedThen: Ok(125),
    expectedMap: 125,
  },
  "OptionPromise.mapResult to ResultPromise": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => ErrPromise<number, number>(0),
        OkPromise<number, number>,
      ),
    expected: isResultPromise,
    expectedThen: Ok(126),
    expectedMap: 126,
  },
  "OptionPromise.mapResult to OptionPromise: compiler warning mapResult combinators would expect Result, not Option":
    {
      action: (ms: Option<number>) =>
        ms.map(promisify).mapResult(
          () => NonePromise(),
          SomePromise,
        ),
      expected: isResultPromise,
      expectedThen: Ok(Some(127)),
      expectedMap: Some(127),
    },
  "OptionPromise.mapResult to Promise": {
    action: (ms: Option<number>) =>
      ms.map(promisify).mapResult(
        () => Promise.resolve(""),
        (some) => Promise.resolve(`${some}`),
      ),
    expected: isResultPromise,
    expectedThen: Ok("128"),
    expectedMap: "128",
  },
  "Option.mapOption to ResultPromise: compile warning as combinators would expect Option, not Result":
    {
      action: (ms: Option<number>) =>
        ms.mapOption(
          () => OkPromise<number, number>(0),
          async (ms) => ErrPromise(await sleep(ms)),
        ),
      expected: isResultPromise,
      expectedThen: Some(Err(0.129)),
      expectedMap: Err(0.129),
    },
  "OptionPromise.mapOption to ResultPromise: compile warning as combinators would expect Option, not Result":
    {
      action: (ms: Option<number>) =>
        ms.map(promisify).mapOption(
          () => OkPromise<number, number>(0),
          async (ms) => ErrPromise(await sleep(ms)),
        ),
      expected: isResultPromise,
      expectedThen: Some(Err(0.13)),
      expectedMap: Err(0.13),
    },
  "Option.mapOption to Result: weird, but allowed": {
    action: (ms: Option<number>) =>
      ms.mapOption(
        () => Ok(0),
        Ok<number, unknown>,
      ),
    expected: Ok(131),
    expectedMap: 131,
  },
};

interface Mapable {
  map(fn: (n: ExpectedValue) => unknown): Option<unknown>;
}

function asMapable(v: ExpectedValue, expected: Expectation): Mapable {
  const mapable = v as unknown as Mapable;
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
  const thenable = v as unknown as Thenable;
  return (typeof thenable.then == "function") ? thenable : {
    then: (_: (actual: ExpectedValue) => void) =>
      assert(false, `Expected a promise to ${expected}`),
  };
}

function check(actual: ExpectedValue, expected: Expectation) {
  if (typeof expected == "function") expected(actual);
  else assert.deepStrictEqual(actual, expected);
}

function taskRunner(
  ms: number,
  taskName: string,
  task: Task,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const expectedThen = task.expectedThen;
    const expectedMap = task.expectedMap;
    const noThen = expectedThen == undefined;
    const noMap = expectedMap == undefined;

    try {
      const rv = task.action(Some(ms));
      check(rv, task.expected);

      if (expectedThen !== undefined) {
        asThenable(rv, expectedThen).then((actual) => {
          try {
            check(actual, expectedThen);
          } catch (e) {
            reject(e);
          }

          if (noMap) resolve();
        });
      } else {
        assertEquals((rv as Thenable).then, undefined);
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
      } else {
        assertEquals((rv as Mapable).map, undefined);
      }
      if (noThen && noMap) resolve();
    } catch (e) {
      reject(e);
    }
  });
}

let ix = 101, ms = 101;
for (const taskName in tasks) {
  testCase(`${ix++}-${taskName}`, async () => {
    await taskRunner(ms++, tasks[taskName]);
  });
}
