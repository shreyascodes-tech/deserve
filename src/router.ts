import { match } from "https://esm.sh/path-to-regexp@6.2.1";
import { joinURL } from "https://esm.sh/ufo";

import { Handler } from "./types.ts";
import { method, useURL, many } from "./utils.ts";

export function useParams<T extends Record<string, string>>(req: Request) {
  // deno-lint-ignore no-explicit-any
  const { __params__: params } = req as unknown as any;
  return params as T;
}

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

export function get(...handlers: Handler[]): Handler;
export function get(path: string, ...handlers: Handler[]): Handler;
export function get(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("get", route(path, ...handlers));
  return method("get", path, ...handlers);
}
export function post(...handlers: Handler[]): Handler;
export function post(path: string, ...handlers: Handler[]): Handler;
export function post(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("post", route(path, ...handlers));
  return method("post", ...handlers);
}

export function put(...handlers: Handler[]): Handler;
export function put(path: string, ...handlers: Handler[]): Handler;
export function put(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("put", route(path, ...handlers));
  return method("put", ...handlers);
}

export function patch(...handlers: Handler[]): Handler;
export function patch(path: string, ...handlers: Handler[]): Handler;
export function patch(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string")
    return method("patch", route(path, ...handlers));
  return method("patch", ...handlers);
}

export function del(...handlers: Handler[]): Handler;
export function del(path: string, ...handlers: Handler[]): Handler;
export function del(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string")
    return method("delete", route(path, ...handlers));
  return method("delete", ...handlers);
}

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

export function head(...handlers: Handler[]): Handler;
export function head(path: string, ...handlers: Handler[]): Handler;
export function head(path: string | Handler, ...handlers: Handler[]): Handler {
  if (typeof path === "string") return method("head", route(path, ...handlers));
  return method("head", ...handlers);
}

export function group(
  prefix: string,
  handlers: (p: (path: string) => string) => Handler[]
): Handler {
  const p = (path: string) => joinURL(prefix, path);
  return many(...handlers(p));
}
