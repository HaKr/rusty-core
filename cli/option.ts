import {
  None,
  NonePromise,
  type OptionPromise,
  Some,
  SomePromise,
} from "../src/option/api.ts";

// Some(12)
None<number>()
  .mapOrElse(
    () => Some(9),
    (some) => Some(some),
  )
  .mapOrElse<OptionPromise<number>>(
    NonePromise,
    SomePromise,
  )
  .optionOrElse(
    NonePromise<number>,
    SomePromise<number>,
  ).optionOrElse(
    None<number>,
    Some<number>,
  ).optionOrElse(
    NonePromise<number>,
    SomePromise<number>,
  )
  .okOrElse(() => "nothing found")
  .mapOrElse(
    (err) => console.error("Failed: ", err),
    (ok) => console.log("Success: ", ok),
  );
