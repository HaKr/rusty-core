import {
  Err,
  ErrPromise,
  None,
  NonePromise,
  Ok,
  OkPromise,
  Some,
  SomePromise,
} from "../src/lib.ts";

Some(12)
  .mapOrElse(
    None<number>,
    (some) => Some(some + 1),
  )
  .mapOption(
    NonePromise<number>,
    (some) => SomePromise(some * 2),
  )
  .mapOption(
    NonePromise<number>,
    (some) => SomePromise(some * 3),
  ).mapOption(
    None<number>,
    (some) => Some<number>(some * 4),
  )
  .mapOption(
    () => Promise.resolve(None<number>()),
    (n) => Promise.resolve(Some<number>(n * 5)),
  )
  .mapOption(
    NonePromise<number>,
    (some) => SomePromise<number>(some * 6),
  )
  .mapOrElse(
    () => 0,
    (n) => n,
  ).then((y) =>
    Some(y).okOrElse(() => "nothing found")
      .mapResult(
        (err) => console.error("Failed: ", err),
        (ok) => console.log("Success: ", ok, (12 + 1) * 2 * 3 * 4 * 5 * 6),
      )
  );

Ok<number, string>(42)
  .mapOrElse(
    Err<number, string>,
    (n) => Ok(n + 1),
  )
  .mapResult(
    ErrPromise<number, string>,
    (n) => OkPromise<number, string>(n * 2),
  )
  .mapResult(
    ErrPromise<number, string>,
    (n) => OkPromise<number, string>(n * 3),
  )
  .mapResult(
    Err<number, string>,
    (ok) => Ok(ok * 4),
  )
  .mapResult(
    (err) => Promise.resolve(Err<number, string>(err)),
    (ok) => Promise.resolve(Ok(ok * 5)),
  )
  .mapResult(
    ErrPromise<number, string>,
    async (n) => await OkPromise<number, string>(n * 6),
  )
  .mapResult(
    () => 0,
    (n) => n,
  ).then((y) =>
    Ok(y).ok().mapOrElse(
      () => console.error("Failed: "),
      (ok) => console.log("Success: ", ok, (42 + 1) * 2 * 3 * 4 * 5 * 6),
    )
  )
  .then(console.log);
