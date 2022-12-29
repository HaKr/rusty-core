import { ChainableResult } from "./chainable.ts";

export const ResultType = {
  Ok: Symbol(":ok"),
  Err: Symbol(":err"),
};

export type Result<T, E> = ChainableResult<T, E>;
