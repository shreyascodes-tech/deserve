import {
  ConnInfo,
  ServeInit,
} from "https://deno.land/std@0.151.0/http/server.ts";

export type PromiseOr<T> = T | Promise<T>;

type ParamsDictionary = Record<string, string>;

export type Context<Params = ParamsDictionary> = {
  conn: ConnInfo;
  pattern?: URLPattern;
  match?: URLPatternResult;
  params?: Params;
};

export type Handler<Params = ParamsDictionary> = (
  req: Request,
  ctx: Context<Params>
) => PromiseOr<Response | void>;

type RemoveTail<
  S extends string,
  Tail extends string
> = S extends `${infer P}${Tail}` ? P : S;

type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<
    RemoveTail<
      RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
      `.${string}`
    >,
    `+`
  >,
  `*`
>;

/** The type alias to help infer what the route parameters are for a route based
 * on the route string. */
export type RouteParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}(${string}`
  ? ParamsDictionary
  : Route extends `${string}:${infer Rest}`
  ? (GetRouteParameter<Rest> extends never
      ? ParamsDictionary
      : GetRouteParameter<Rest> extends `${infer ParamName}?`
      ? { [P in ParamName]?: string }
      : { [P in GetRouteParameter<Rest>]: string }) &
      (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
        ? RouteParameters<Next>
        : unknown)
  : ParamsDictionary;

export type RouteHandler<Route extends string = string> = Handler<
  RouteParameters<Route>
>;

export type Hook<R extends string = string> = {
  preHandler?: RouteHandler<R>;
  postHandler?: RouteHandler<R>;
};

export type DeserveApp = {
  hook(...hooks: Hook[]): DeserveApp;
  hook<R extends string = string>(path: R, ...hooks: Hook<R>[]): DeserveApp;
  use(...handlers: Handler[]): DeserveApp;
  use<R extends string = string>(
    path: R,
    ...handlers: RouteHandler<R>[]
  ): DeserveApp;
  listen(init?: ServeInit): Promise<void>;
};

const http_methods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "TRACE",
  "ALL",
] as const;

export type Method = typeof http_methods[number];

export interface Route<T = ParamsDictionary> {
  pattern: URLPattern;
  handler: Handler<T>;
}

/**
 * import { createApp, createRouter, redirect, cookie, jsx } from "deserve"
 * import { listen, static, file } from "deserve/deno"
 * const app = createApp()
 *
 * const router = createRouter()
 * router.get("/", () => "Hello World")
 * router.put("/", () => redirect("/"))
 * router.post("/", file("file.txt"))
 *
 * app.use(router.routes())
 *
 * app.listen({ port: 3333 })
 */
