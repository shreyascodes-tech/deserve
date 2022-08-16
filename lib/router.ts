// deno-lint-ignore-file no-explicit-any ban-types
import { Handler, Method, Route, RouteHandler } from "./types.ts";
import { joinURL } from "./internal.ts";
import { AppRouter, routesMapSymbol } from "./types/router.ts";

export function createRouter<CtxExtensions = {}>(
  prefix = ""
): AppRouter<CtxExtensions> {
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

    // if (!_routes.has(method)) {
    //   addRoutes(pattern, method, handlers);
    // }

    // const prev = _routes.get(method)!;
    // _routes.set(method, [...prev, { pattern, handler } as any] as any);

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
