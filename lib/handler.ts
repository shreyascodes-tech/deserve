// deno-lint-ignore-file ban-types
import { ConnInfo } from "https://deno.land/std@0.153.0/http/server.ts";
import { PromiseOr } from "./internal.ts";

export type ParamsDictionary = Record<string, string>;

export type Context<Params = ParamsDictionary, Extensions = {}> = {
  conn?: ConnInfo;
  pattern?: URLPattern;
  match?: URLPatternResult;
  params?: Params;
  headers: Headers;
  redirect(path: string, status?: number | undefined): Response;
  hasData(key: string | symbol | number): boolean;
  getData<T>(key: string | symbol | number): T | undefined;
  setData<T>(key: string | symbol | number, data: T): void;
  removeData(key: string | symbol | number): boolean;
} & Extensions;

export type Handler<Params = ParamsDictionary, CtxExtensions = {}> = (
  req: Request,
  ctx: Context<Params, CtxExtensions>
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

export type RouteHandler<
  Route extends string = string,
  CtxExtensions = {}
> = Handler<RouteParameters<Route>, CtxExtensions>;
