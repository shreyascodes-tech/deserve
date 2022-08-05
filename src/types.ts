export type PromiseOr<T> = T | Promise<T>;

export type Handler = (
  request: Request
) => PromiseOr<Response | null | undefined | void>;

export interface Hook {
  initial: Handler;
  final: (request: Request) => PromiseOr<void>;
}

export interface DeserveConfig {
  hooks: Hook[];
  handlers: Handler[];
}

export type Method =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";
