import { match } from "https://esm.sh/path-to-regexp@6.2.1";
import { joinURL } from "https://esm.sh/ufo";

import { Handler } from "./types.ts";
import { method, useURL, many } from "./utils.ts";

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
  // deno-lint-ignore no-explicit-any
  const { __params__: params } = req as unknown as any;
  return params as T;
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
export function route(path: string, ...handlers: Handler[]): Handler {
  const matcher = match(path);
  const handler = many(...handlers);
  return (req) => {
    const { pathname } = useURL(req);
    const match = matcher(pathname);
    if (!match) return;
    const { params } = match;
    Object.defineProperty(req, "__params__", {
      value: params,
      writable: false,
    });
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
  return method("post", ...handlers);
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
  return method("put", ...handlers);
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
  return method("patch", ...handlers);
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
  return method("delete", ...handlers);
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
  return method("options", ...handlers);
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
  return method("head", ...handlers);
}

/**
 * Group multiple handlers and routes under a single base path
 *
 * ```ts
 *  import { deserve, group, get post } from "https://deno.land/x/deserve/mod.ts"
 *
 *  const app = deserve({
 *    handlers: [
 *      // Only runs the handlers under the api path
 *      group("/api", (p) => [
 *        // Only runs the handlers under the api/auth path
 *        // {p} is a funtion that joins the pathwith the previous groups base path
 *        group(p("/auth"), (req) => [
 *          get(p("/me"), () => new Response("User Details (/api/auth/me)"))
 *          post(p("/login"), () => new Response("Login (/api/auth/login)"))
 *          post(p("/register"), () => new Response("Login (/api/auth/register)"))
 *        ])
 *      ])
 *    ]
 *  })
 * ```
 */
export function group(
  prefix: string,
  handlers: (p: (path: string) => string) => Handler[]
): Handler {
  const p = (path: string) => joinURL(prefix, path);
  return many(...handlers(p));
}
