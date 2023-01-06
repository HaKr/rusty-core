import { None, NonePromise, Some, SomePromise } from "../src/option/api.ts";

Some(12)
  .mapOrElse(
    None<number>,
    (some) => Some(some + 1),
  )
  .mapOrElse(
    NonePromise<number>,
    (some) => SomePromise(some * 2),
  )
  .mapOrElse(
    NonePromise<number>,
    (some) => SomePromise(some * 3),
  ).mapOrElse(
    None<number>,
    (some) => Some<number>(some * 4),
  )
  .mapOrElse(
    () => Promise.resolve(None<number>()),
    (n) => Promise.resolve(Some<number>(n * 5)),
  )
  .mapOrElse(
    NonePromise<number>,
    (some) => SomePromise<number>(some * 6),
  )
  .mapOrElsePromise(
    () => 0,
    (n) => n,
  ).then((y) =>
    Some(y).okOrElse(() => "nothing found")
      .mapOrElse(
        (err) => console.error("Failed: ", err),
        (ok) => console.log("Success: ", ok, (12 + 1) * 2 * 3 * 4 * 5 * 6),
      )
  );
/*
Ok<number, string>(42)
  .mapOrElse(
    Err<number, string>,
    (n) => Ok(n + 1),
  )
  .mapOrElse(
    ErrPromise<number, string>,
    (n) => OkPromise<number, string>(n * 2),
  )
  .mapOrElse(
    ErrPromise<number, string>,
    (n) => OkPromise<number, string>(n * 3),
  )
  .mapOrElse(
    Err<number, string>,
    (ok) => Ok(ok * 4),
  )
  .mapOrElse(
    (err) => Promise.resolve(Err<number, string>(err)),
    (ok) => Promise.resolve(Ok(ok * 5)),
  )
  .mapOrElse(
    ErrPromise<number, string>,
    async (n) => await OkPromise<number, string>(n * 6),
  )
  .mapOrElse<void>(
    (err) => console.error("Failed: ", err),
    (ok) => console.log("Success: ", ok, (42 + 1) * 2 * 3 * 4 * 5 * 6),
  );
*/
