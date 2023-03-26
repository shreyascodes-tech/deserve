import {
  ServeInit,
  ServeTlsInit,
  Status,
  type Cookie,
} from "https://deno.land/std@0.181.0/http/mod.ts";
import type { RequestEvent, Method } from "./event.ts";

export { Status, Cookie, Method, RequestEvent };

/**
 * The options that can be passed to the `listen` method.
 */
export type ListenOptions = ServeInit;
/**
 * The options that can be passed to the `listenTls` method.
 */
export type ListenTlsOptions = ServeTlsInit;

/**
 * A utility type that represents a `Promise` or a value.
 */
export type PromiseOr<T> = T | Promise<T>;

/**
 * Represents the params of a requested path.
 */
export type BaseParams = Record<string, string>;

/**
 * Represents the shared state of the application.
 */
// deno-lint-ignore no-explicit-any
export type BaseState = Record<string, any>;

type RemoveTail<
  S extends string,
  Tail extends string
> = S extends `${infer P}${Tail}` ? P : S;

type GetPathParameter<S extends string> = RemoveTail<
  RemoveTail<
    RemoveTail<
      RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
      `.${string}`
    >,
    `+`
  >,
  `*`
>;

/** The type alias to help infer what the path parameters are for a path based
 * on the path string.
 * This types are taken from the (Oak Framework)[https://github.com/oakserver/oak/blob/9926162dc4704944f7b5dd2189be2b46b7e52019/router.ts#LL183-L203C49]
 */
export type PathParameters<Path extends string> = string extends Path
  ? BaseParams
  : Path extends `${string}(${string}`
  ? BaseParams
  : Path extends `${string}:${infer Rest}`
  ? (GetPathParameter<Rest> extends never
      ? BaseParams
      : GetPathParameter<Rest> extends `${infer ParamName}?`
      ? { [P in ParamName]?: string }
      : { [P in GetPathParameter<Rest>]: string }) &
      (Rest extends `${GetPathParameter<Rest>}${infer Next}`
        ? PathParameters<Next>
        : unknown)
  : BaseParams;

/**
 * The handler function that is called when a request is received.
 * It takes a `RequestEvent` object as the first argument.
 * It can return a `Response` object or a `Promise` that resolves to a `Response` object.
 * If the handler function returns `undefined` or `void` the request is passed to the next middleware.
 */
export type Handler<
  Path extends string = string,
  State extends BaseState = BaseState,
  Params extends BaseParams = BaseParams
> = (
  event: RequestEvent<PathParameters<Path> & Params, State>
) => PromiseOr<Response | void | undefined>;
