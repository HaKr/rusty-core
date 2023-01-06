import { Option, OptionPromise } from "./option/api.ts";
import { Result, ResultPromise } from "./result/api.ts";

type UseOptionPromiseInstead =
  "Returning a promise here is not advisable, use optionOrElse instead";
export type OptionLike<T = unknown> = Option<T> | OptionPromise<T>;
// export type OptionOrElse<T> = T extends OptionLike<infer U> ? OptionPromise<U>
//   : never;
export type OptionMapOrElse<T> = T extends
  Promise<Option<infer U>> | OptionPromise<infer U> ? OptionPromise<U>
  : T extends Promise<infer P>
    ? "To return a Promise to anything other than Option, use mapOrElsePromise"
  : T;
export type OptionPromiseMapOrElse<T> = T extends
  Promise<Option<infer U>> | Option<infer U> | OptionPromise<infer U>
  ? OptionPromise<U>
  : "To return a Promise to anything other than Option, use mapOrElsePromise";

export type OptionMapOrElsePromise<T> = T extends
  Promise<Option<infer U>> | OptionPromise<infer U> | Option<infer U>
  ? "To return a Promise to an Option, use mapOrElse"
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type OptionPromiseMapOrElsePromise<T> = T extends
  Promise<Option<infer U>> | Option<infer U> | OptionPromise<infer U>
  ? "To return anything other than Option, use mapOrElsePromise"
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type ResultMapOrElse<T> = T extends
  | Promise<Result<infer U, infer F>>
  | ResultPromise<infer U, infer F>
  | Result<infer U, infer F> ? ResultPromise<U, F>
  : T extends Promise<infer P>
    ? "To return a Promise to anything other than Result, use mapOrElsePromise"
  : T;

export type ResultPromiseMapOrElse<T> = T extends
  | Promise<Result<infer U, infer F>>
  | ResultPromise<infer U, infer F>
  | Result<infer U, infer F> ? ResultPromise<U, F>
  : T extends Promise<infer P>
    ? "To return a Promise to anything other than Result, use mapOrElsePromise"
  : Promise<T>;
type UseResultPromiseInstead =
  "Returning a promise here is not advisable, use resultOrElse instead";
export type ResultLike<U, F> = Result<U, F> | ResultPromise<U, F>;
export type AnythingButResult<T> = T extends ResultLike<infer U, infer F>
  ? UseResultPromiseInstead
  : T extends Promise<infer U> ? Promise<U>
  : Promise<T>;
export type ResultOrElse<T> = T extends ResultLike<infer U, infer F>
  ? ResultPromise<U, F>
  : never;
