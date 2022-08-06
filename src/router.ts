import { match, MatchFunction } from "https://esm.sh/path-to-regexp@6.2.1";
import { joinURL } from "https://esm.sh/ufo";

import { Handler } from "./types.ts";
import { method, useURL, many, createContext } from "./utils.ts";

const useRouterContext = createContext({
  path: "",
  params: {} as Record<string, string>,
});

/**
 * Extracts URL query params from the request
 *
 * ```ts
 *  import { deserve, get, useParams } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // ...
 *        get("/post/:slug", (req) => {
 *            const { slug } = useParams<{ slug: string }>(req)
 *            return new Response(`Post ${slug}`);
 *        })
 *    ]
 *  })
 * ```
 */
export function useParams<T extends Record<string, string>>(req: Request) {
  const [routerCtx] = useRouterContext(req);

  return routerCtx().params as T;
}

/**
 * A handler That accept accepts more handlers that only run on a particular route
 *
 * ```ts
 *  import { deserve, route, get, post } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // ...
 *        route(
 *          "/todo",
 *          get((req) => {
 *            return Response.json({
 *                todos: [
 *                  //...
 *                ]
 *            }) // json
 *          }), // get
 *          post((req) => {
 *            return Response.json({
 *                message: "Todo created Successfully"
 *            }) //json
 *          }) // post
 *        ) // route
 *    ] // handlers
 *  }) // deserve
 * ```
 */
export function route(path: string, ...handlers: Handler[]): Handler;
export function route(
  opts: { path: string; exact?: boolean },
  ...handlers: Handler[]
): Handler;
export function route(
  pathOrOpts: string | { path: string; exact?: boolean },
  ...handlers: Handler[]
): Handler {
  if (typeof pathOrOpts === "string") {
    pathOrOpts = {
      path: pathOrOpts,
      exact: true,
    };
  }

  const { path, exact } = pathOrOpts as { path: string; exact?: boolean };

  const handler = many(...handlers);
  // deno-lint-ignore ban-types
  let matcher: MatchFunction<object>;
  return (req) => {
    const [, setRouterCtx] = useRouterContext(req);
    const { pathname } = useURL(req);

    const { path: newPath } = setRouterCtx((data) => {
      return {
        ...data,
        path: joinURL(data?.path ?? "", path),
      };
    });

    matcher ??= match(newPath, { end: exact });
    const matchData = matcher(pathname);
    if (!matchData) return;
    const { params } = matchData;

    setRouterCtx((data) => ({
      ...data,
      params: params as Record<string, string>,
    }));
    return handler(req);
  };
}

/**
 * Executes the handlers only if the method is get and optionally accepts a path
 *
 * ```ts
 *  import { deserve, get } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every get Request that matches the path
 *        get("/", (req) => new Response("Home Route"))
 *        // Runs on every get Request that reaches this handler
 *        get((req) => {
 *            return new Response("get Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function get(...handlers: Handler[]): Handler;
export function get(path: string, ...handlers: Handler[]): Handler;
export function get(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("get", route(path, ...handlers));
  return method("get", path, ...handlers);
}

/**
 * Executes the handlers only if the method is post and optionally accepts a path
 *
 * ```ts
 *  import { deserve, post } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every post Request that matches the path
 *        post("/", (req) => new Response("Home Route"))
 *        // Runs on every post Request that reaches this handler
 *        post((req) => {
 *            return new Response("post Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function post(...handlers: Handler[]): Handler;
export function post(path: string, ...handlers: Handler[]): Handler;
export function post(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("post", route(path, ...handlers));
  return method("post", path, ...handlers);
}

/**
 * Executes the handlers only if the method is put and optionally accepts a path
 *
 * ```ts
 *  import { deserve, put } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every put Request that matches the path
 *        put("/", (req) => new Response("Home Route"))
 *        // Runs on every put Request that reaches this handler
 *        put((req) => {
 *            return new Response("put Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function put(...handlers: Handler[]): Handler;
export function put(path: string, ...handlers: Handler[]): Handler;
export function put(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("put", route(path, ...handlers));
  return method("put", path, ...handlers);
}

/**
 * Executes the handlers only if the method is patch and optionally accepts a path
 *
 * ```ts
 *  import { deserve, patch } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every patch Request that matches the path
 *        patch("/", (req) => new Response("Home Route"))
 *        // Runs on every patch Request that reaches this handler
 *        patch((req) => {
 *            return new Response("patch Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function patch(...handlers: Handler[]): Handler;
export function patch(path: string, ...handlers: Handler[]): Handler;
export function patch(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string")
    return method("patch", route(path, ...handlers));
  return method("patch", path, ...handlers);
}

/**
 * Executes the handlers only if the method is delete and optionally accepts a path
 *
 * ```ts
 *  import { deserve, del } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every delete Request that matches the path
 *        del("/", (req) => new Response("Home Route"))
 *        // Runs on every delete Request that reaches this handler
 *        del((req) => {
 *            return new Response("delete Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function del(...handlers: Handler[]): Handler;
export function del(path: string, ...handlers: Handler[]): Handler;
export function del(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string")
    return method("delete", route(path, ...handlers));
  return method("delete", path, ...handlers);
}

/**
 * Executes the handlers only if the method is options and optionally accepts a path
 *
 * ```ts
 *  import { deserve, options } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every options Request that matches the path
 *        options("/", (req) => new Response("Home Route"))
 *        // Runs on every options Request that reaches this handler
 *        options((req) => {
 *            return new Response("options Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function options(...handlers: Handler[]): Handler;
export function options(path: string, ...handlers: Handler[]): Handler;
export function options(
  path: string | Handler,
  ...handlers: Handler[]
): Handler {
  if (typeof path === "string")
    return method("options", route(path, ...handlers));
  return method("options", path, ...handlers);
}

/**
 * Executes the handlers only if the method is get and optionally accepts a path
 *
 * ```ts
 *  import { deserve, head } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *        // Runs on every head Request that matches the path
 *        head("/", (req) => new Response("Home Route"))
 *        // Runs on every head Request that reaches this handler
 *        head((req) => {
 *            return new Response("head Handler");
 *        })
 *    ]
 *  })
 * ```
 */
export function head(...handlers: Handler[]): Handler;
export function head(path: string, ...handlers: Handler[]): Handler;
export function head(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("head", route(path, ...handlers));
  return method("head", path, ...handlers);
}

/**
 * Creates a new router that takes multiple route handlers
 *
 * ```ts
 *  import { deserve, group, get post } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *      router(
 *        // Only runs the handlers under the api path
 *        "/api",
 *        router(
 *          // Only runs the handlers under the api/auth path
 *          "/auth",
 *          get("/me", () => new Response("User Details (/api/auth/me)"))
 *          post("/login", () => new Response("Login (/api/auth/login)"))
 *          post("/register", () => new Response("Login (/api/auth/register)"))
 *        )
 *      )
 *    ]
 *  })
 * ```
 */
export function router(prefix: string, ...handlers: Handler[]): Handler {
  return route({ path: prefix, exact: false }, ...handlers);
}
