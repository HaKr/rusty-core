import { Option, OptionPromise } from "./option/api.ts";
import { Result, ResultPromise } from "./result/api.ts";

export type OptionPromiseLike<T> = Promise<Option<T>> | OptionPromise<T>;
export type OptionLike<T> = Option<T> | OptionPromiseLike<T>;
export type ResultPromiseLike<T, E> =
  | Promise<Result<T, E>>
  | ResultPromise<T, E>;
export type ResultLike<T, E> = Result<T, E> | ResultPromiseLike<T, E>;

export type MapOption<U> = U extends Promise<Option<infer O>> ? OptionPromise<O>
  : U extends Promise<infer P> ? OptionPromise<P>
  : U extends Option<infer O> ? Option<O>
  : Option<U>;
export type OptionFrom<U> = U extends
  Promise<Option<infer O>> | OptionPromise<infer O> ? OptionPromise<O>
  : U extends Promise<infer O> ? OptionPromise<O>
  : U extends Option<infer O> ? Option<O>
  : Option<U>;

export type OkFrom<U, E> = U extends
  Promise<Result<infer T, infer F>> | ResultPromise<infer T, infer F>
  ? ResultPromise<T, F>
  : U extends Promise<infer O> ? ResultPromise<O, E>
  : U extends Result<infer T, infer F> ? Result<T, F>
  : Result<U, E>;

export type ErrFrom<U, E> = E extends
  Promise<Result<infer T, infer F>> | ResultPromise<infer T, infer F>
  ? ResultPromise<T, F>
  : E extends Promise<infer O> ? ResultPromise<U, O>
  : E extends Result<infer T, infer F> ? Result<T, F>
  : Result<U, E>;

type OptionPromiseShouldUseMapOption =
  "To return a Promise to an Option, use mapOption";
type OptionLikeShouldUseMapOption =
  "To return (a Promise to) an Option, use mapOption";
type ResultPromiseShouldUseMapResult =
  "To return a Promise to a Result, use mapResult";
type ResultLikeShouldUseMapResult =
  "To return (a Promise to) a Result, use mapResult";
type NoOptionPromiseShouldUseMapOrElse =
  "To return a promise to anything other than Option, use mapOrElse";
type NoResultPromiseShouldUseMapOrElse =
  "To return a promise to anything other than Result, use mapOrElse";

export type OptionMapOrElse<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromiseShouldUseMapOption
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T;

export type ResultMapOrElse<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromiseShouldUseMapResult
  : T extends OptionLike<T> ? OptionPromiseShouldUseMapOption
  : T;

export type OptionPromiseMapOrElse<T> = T extends OptionLike<infer U>
  ? OptionLikeShouldUseMapOption
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type ResultPromiseMapOrElse<T> = T extends ResultLike<infer U, infer F>
  ? ResultLikeShouldUseMapResult
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? Promise<P>
  : Promise<T>;

export type OptionMapOption<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromise<U>
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T extends Promise<infer P> ? OptionPromise<P>
  : T;

export type ResultMapOption<T> = T extends OptionPromiseLike<infer U>
  ? OptionPromise<U>
  : T extends ResultPromiseLike<infer U, infer F>
    ? ResultPromiseShouldUseMapResult
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : T;

export type OptionPromiseMapOption<T> = T extends OptionLike<infer U>
  ? OptionPromise<U>
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? OptionPromise<P>
  : OptionPromise<T>;

export type ResultPromiseMapOption<T> = T extends OptionLike<infer U>
  ? OptionPromise<U>
  : T extends ResultLike<infer U, infer F> ? ResultLikeShouldUseMapResult
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : Promise<T>;

export type OptionMapResult<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionPromiseLike<infer U> ? OptionPromiseShouldUseMapOption
  : T extends Promise<infer P> ? ResultPromise<P, unknown>
  : T;

export type ResultMapResult<T> = T extends ResultPromiseLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionPromiseLike<infer U> ? OptionPromiseShouldUseMapOption
  : T extends Promise<infer P> ? NoResultPromiseShouldUseMapOrElse
  : T;

export type OptionPromiseMapResult<T> = T extends ResultLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? ResultPromise<P, unknown>
  : ResultPromise<T, unknown>;

export type ResultPromiseMapResult<T> = T extends ResultLike<infer U, infer F>
  ? ResultPromise<U, F>
  : T extends OptionLike<infer U> ? OptionLikeShouldUseMapOption
  : T extends Promise<infer P> ? NoOptionPromiseShouldUseMapOrElse
  : Promise<T>;
