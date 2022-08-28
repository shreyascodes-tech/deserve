// deno-lint-ignore-file no-explicit-any ban-types
import { DeserveApp } from "../deserve.ts";
import { Handler, ParamsDictionary, RouteHandler } from "../handler.ts";
import { joinURL } from "../internal.ts";
// import { AppRouter, Route, routesMapSymbol } from "./types/router.ts";

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

const routesMapSymbol = Symbol();

interface Route<T = ParamsDictionary> {
  pattern: URLPattern;
  handler: Handler<T>;
}

export interface Router<CtxExtensions> {
  [routesMapSymbol]: Map<Method, Route[]>;
  all<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  get<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  post<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  put<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  patch<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  delete<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  options<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  head<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  trace<R extends string>(
    path: R,
    ...handler: RouteHandler<R, CtxExtensions>[]
  ): Router<CtxExtensions>;
  append<T>(router: Router<T>): Router<CtxExtensions>;
  routes(): Handler;
}

type GetCtxExts<T> = T extends DeserveApp<infer CtxExtensions>
  ? CtxExtensions
  : T;

export type AppRouter<T extends DeserveApp> = Router<GetCtxExts<T>>;

export function createRouter<App extends DeserveApp = DeserveApp<{}>>(
  prefix = ""
): AppRouter<App> {
  const _routes = new Map<Method, Route[]>();

  function addRoutes(
    pattern: URLPattern,
    method: Method,
    ...handlers: Handler[]
  ) {
    for (const handler of handlers) {
      const prev = _routes.has(method) ? _routes.get(method)! : [];
      _routes.set(method, [...prev, { pattern, handler }]);
    }
  }

  function route(
    path: string,
    method: Method,
    handlers: RouteHandler<any, any>[]
  ) {
    path = joinURL(prefix, path);

    const pattern = new URLPattern({ pathname: path });

    addRoutes(pattern, method, ...handlers);
  }
  return {
    [routesMapSymbol]: _routes,
    all(path, ...handlers) {
      route(path, "ALL", handlers);
      return this as any;
    },
    get(path, ...handlers) {
      route(path, "GET", handlers);
      return this as any;
    },
    post(path, ...handlers) {
      route(path, "POST", handlers);
      return this as any;
    },
    put(path, ...handlers) {
      route(path, "PUT", handlers);
      return this as any;
    },
    patch(path, ...handlers) {
      route(path, "PATCH", handlers);
      return this as any;
    },
    delete(path, ...handlers) {
      route(path, "DELETE", handlers);
      return this as any;
    },
    options(path, ...handlers) {
      route(path, "OPTIONS", handlers);
      return this as any;
    },
    head(path, ...handlers) {
      route(path, "HEAD", handlers);
      return this as any;
    },
    trace(path, ...handlers) {
      route(path, "TRACE", handlers);
      return this as any;
    },
    append(router) {
      const routes = router[routesMapSymbol];
      for (const [method, rs] of routes) {
        for (const { handler, pattern } of rs) {
          addRoutes(pattern, method, handler);
        }
      }
      return this as any;
    },
    routes() {
      return async function $routeHandler(req, ctx) {
        const { method, url } = req;

        const matchedRoutes = _routes.get(method as Method);

        if (!matchedRoutes) return;

        for (const { pattern, handler } of matchedRoutes) {
          if (!pattern.test(url)) continue;

          const {
            pathname: { groups: params },
          } = pattern.exec(url)!;

          ctx.params = params;

          const res = await handler(req, ctx);
          if (res) return res;
        }
      };
    },
  };
}
