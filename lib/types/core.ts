// deno-lint-ignore-file ban-types
import {
  ConnInfo,
  ServeInit,
} from "https://deno.land/std@0.151.0/http/server.ts";

export type PromiseOr<T> = T | Promise<T>;

export type ParamsDictionary = Record<string, string>;

export type Context<Params = ParamsDictionary, Extensions = {}> = {
  conn: ConnInfo;
  pattern?: URLPattern;
  match?: URLPatternResult;
  params?: Params;
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

export interface Hook<R extends string = string, CtxExtensions = {}> {
  preHandler?: RouteHandler<R, CtxExtensions>;
  postHandler?: RouteHandler<
    R,
    CtxExtensions & { response: Response | undefined }
  >;
}

export interface DeserveApp<CtxExtensions = {}> {
  hook<NewExtensions extends CtxExtensions = CtxExtensions>(
    ...hooks: Hook<string, CtxExtensions>[]
  ): DeserveApp<NewExtensions>;
  hook<
    R extends string = string,
    NewExtensions extends CtxExtensions = CtxExtensions
  >(
    path: R,
    ...hooks: Hook<R, CtxExtensions>[]
  ): DeserveApp<NewExtensions>;
  use<NewExtensions extends CtxExtensions = CtxExtensions>(
    ...handlers: Handler<ParamsDictionary, CtxExtensions>[]
  ): DeserveApp<NewExtensions>;
  use<
    R extends string = string,
    NewExtensions extends CtxExtensions = CtxExtensions
  >(
    path: R,
    ...handlers: RouteHandler<R, CtxExtensions>[]
  ): DeserveApp<NewExtensions>;

  listen(init?: ServeInit): Promise<void>;
}

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "ALL";
