import {
  ServeInit,
  ServeTlsInit,
  Status,
  type Cookie,
} from "https://deno.land/std@0.181.0/http/mod.ts";
import type { RequestEvent, Method } from "./event.ts";

export { Status, Cookie, Method };

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
 * The handler function that is called when a request is received.
 * It takes a `RequestEvent` object as the first argument.
 * It can return a `Response` object or a `Promise` that resolves to a `Response` object.
 * If the handler function returns `undefined` or `void` the request is passed to the next middleware.
 */
export type Handler<Params extends BaseParams> = (
  event: RequestEvent<Params>
) => PromiseOr<Response | void | undefined>;
