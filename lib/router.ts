// deno-lint-ignore-file no-explicit-any
import { Handler, Method, Route, RouteHandler } from "./types.ts";
import { joinURL } from "https://esm.sh/ufo";

const routesMapSymbol = Symbol();

export type Router = {
  [routesMapSymbol]: Map<string, Route[]>;
  all<R extends string>(path: R, handler: RouteHandler<R>): Router;
  get<R extends string>(path: R, handler: RouteHandler<R>): Router;
  post<R extends string>(path: R, handler: RouteHandler<R>): Router;
  put<R extends string>(path: R, handler: RouteHandler<R>): Router;
  patch<R extends string>(path: R, handler: RouteHandler<R>): Router;
  delete<R extends string>(path: R, handler: RouteHandler<R>): Router;
  options<R extends string>(path: R, handler: RouteHandler<R>): Router;
  head<R extends string>(path: R, handler: RouteHandler<R>): Router;
  trace<R extends string>(path: R, handler: RouteHandler<R>): Router;
  append(router: Router): Router;
  routes(): Handler;
};

export function createRouter(prefix = ""): Router {
  const _routes = new Map<Method, Route[]>();

  function addRoute<T>(
    pattern: URLPattern,
    handler: Handler<T>,
    method: Method
  ) {
    _routes.set(method, [{ pattern, handler } as any]);
  }

  function route<T>(path: string, handler: Handler<T>, method: Method) {
    path = joinURL(prefix, path);

    const pattern = new URLPattern({ pathname: path });

    if (!_routes.has(method)) {
      addRoute(pattern, handler, method);
    }

    const prev = _routes.get(method)!;

    _routes.set(method, [...prev, { pattern, handler } as any] as any);
  }
  return {
    [routesMapSymbol]: _routes,
    all<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "ALL");
      return this;
    },
    get<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "GET");
      return this;
    },
    post<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "POST");
      return this;
    },
    put<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "PUT");
      return this;
    },
    patch<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "PATCH");
      return this;
    },
    delete<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "DELETE");
      return this;
    },
    options<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "OPTIONS");
      return this;
    },
    head<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "HEAD");
      return this;
    },
    trace<R extends string>(path: R, handler: RouteHandler<R>) {
      route(path, handler, "TRACE");
      return this;
    },
    append(router) {
      const routes = router[routesMapSymbol];
      for (const [method, rs] of routes) {
        for (const { handler, pattern } of rs) {
          addRoute(pattern, handler, method as Method);
        }
      }
      return this;
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
