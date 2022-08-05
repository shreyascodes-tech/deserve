export type PromiseOr<T> = T | Promise<T>;

/**A Handler is a function that accepts a request object and returns a response object
 * if no response is returned then the next handler is called untill no more handlers remain
 */
export type Handler = (
  request: Request
) => PromiseOr<Response | null | undefined | void>;

/** Hook is an object with initial and final function that run before and after a request reqpectively */
export interface Hook {
  initial?: Handler;
  final?: (request: Request) => PromiseOr<void>;
}

export interface DeserveConfig {
  hooks: Hook[];
  handlers: Handler[];
}

/** A type that represents a union of all http methods */
export type Method =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";
