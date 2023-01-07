import { Option, OptionPromise } from "./option/api";
import { Result, ResultPromise } from "./result/api";

export type OptionLike<T = unknown> = Option<T> | OptionPromise<T>;

export type OptionMapOrElse<T> = T extends
  Promise<Option<infer U>> | OptionPromise<infer U> ? OptionPromise<U>
  : T extends Promise<infer P>
    ? "To return a Promise to anything other than Option, use mapOrElsePromise"
  : T;

export type ResultMapOrElse<T> = T extends
  | Promise<Result<infer U, infer F>>
  | ResultPromise<infer U, infer F> ? ResultPromise<U, F>
  : T extends Promise<infer P>
    ? "To return a Promise to anything other than Result, use mapOrElsePromise"
  : T;

export type OptionPromiseMapOrElse<T> = T extends
  Promise<Option<infer U>> | Option<infer U> | OptionPromise<infer U>
  ? OptionPromise<U>
  : "To return a Promise to anything other than Option, use mapOrElsePromise";

export type ResultPromiseMapOrElse<T> = T extends
  | Promise<Result<infer U, infer F>>
  | Result<infer U, infer F>
  | ResultPromise<infer U, infer F> ? ResultPromise<U, F>
  : "To return a Promise to anything other than Result, use mapOrElsePromise";

export type OptionMapOrElsePromise<T> = T extends
  Promise<Option<infer U>> | OptionPromise<infer U> | Option<infer U>
  ? "To return a Promise to an Option, use mapOrElse"
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type ResultMapOrElsePromise<T> = T extends
  | Promise<Result<infer U, infer F>>
  | Result<infer U, infer F>
  | ResultPromise<infer U, infer F>
  ? "To return a Promise to Result like, use mapOrElse"
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;
