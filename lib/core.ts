// deno-lint-ignore-file no-explicit-any
import {
  ConnInfo,
  serve,
  ServeInit,
} from "https://deno.land/std@0.151.0/http/server.ts";
import { getMatch, setMatch, withLeadingSlash } from "./internal.ts";
import {
  DeserveApp,
  Context,
  Handler,
  Hook,
  RouteHandler,
  ParamsDictionary,
  PromiseOr,
} from "./types/core.ts";
import {
  defaultErrorHandler,
  defaultOnListenHandler,
  response,
} from "./utils.ts";

// deno-lint-ignore ban-types
export function createApp<T = {}>(
  createContext?: (req: Request, conn: ConnInfo) => PromiseOr<T>
): DeserveApp<T> {
  const _handlers: Handler[] = [];
  const _hooks: Hook[] = [];
  const ctxData = new Map();

  const handler = async function serveHandler(req: Request, conn: ConnInfo) {
    const { method, url } = req;
    const { pathname } = new URL(url);

    let res: Response | void;

    const ctxExt = (await createContext?.(req, conn)) ?? {};

    ctxData.clear();
    const ctx: Context = {
      conn,
      headers: new Headers(),
      hasData(key) {
        return ctxData.has(key);
      },
      getData(key) {
        return ctxData.get(key);
      },
      setData(key, data) {
        return ctxData.set(key, data);
      },
      removeData(key) {
        return ctxData.delete(key);
      },
      redirect(path, status) {
        const url = new URL(req.url);
        url.pathname = withLeadingSlash(path);
        return Response.redirect(url, status);
      },
      ...ctxExt,
    };

    // Execute Pre Hooks
    for (const hook of _hooks) {
      const pattern = getMatch(hook);

      if (!pattern) {
        const newRes = await hook.preHandler?.(req, ctx as any);
        if (newRes) {
          res = newRes;
          break;
        } else continue;
      }

      if (pattern && !pattern.test(url)) continue;

      const match = pattern.exec(url)!;
      const {
        pathname: { groups: params },
      } = match;

      ctx.pattern = pattern;
      ctx.match = match;
      ctx.params = params;

      const newRes = await hook.preHandler?.(req, ctx as any);
      if (newRes) res = newRes;
    }

    // Execute Handlers
    for (const handler of _handlers) {
      if (res) break;

      const pattern = getMatch(handler);

      if (!pattern) {
        res = await handler(req, ctx);
        if (res) break;
        else continue;
      }

      if (pattern && !pattern.test(url)) continue;

      const match = pattern.exec(url)!;
      const {
        pathname: { groups: params },
      } = match;

      ctx.pattern = pattern;
      ctx.match = match;
      ctx.params = params;

      res = await handler(req, ctx);
    }

    if (!res) {
      res = response(`Cannot ${method} ${pathname}`, {
        status: 404,
      });
    }

    // Execute Post Hooks
    for (const hook of _hooks) {
      const pattern = getMatch(hook);

      if (!pattern) {
        const newRes: Response | void = await hook.postHandler?.(req, {
          ...ctx,
          response: res as any,
        });
        if (newRes) res = newRes;
        continue;
      }

      if (pattern && !pattern.test(url)) continue;

      const match = pattern.exec(url)!;
      const {
        pathname: { groups: params },
      } = match;

      ctx.pattern = pattern;
      ctx.match = match;
      ctx.params = params;

      const newRes: Response | void = await hook.postHandler?.(req, {
        ...ctx,
        response: res as any,
      });
      if (newRes) res = newRes;
    }

    const resHeaders = new Headers(res?.headers);

    if (res) {
      resHeaders.forEach((val, k) => res!.headers.append(k, val));
      return res;
    }

    return response(`Cannot ${method} ${pathname}`, {
      status: 404,
      headers: resHeaders,
    });
  };

  return {
    hook<R extends string = string>(pathOrHook: R | Hook, ...hooks: Hook<R>[]) {
      if (typeof pathOrHook === "string") {
        for (const hook of hooks) {
          setMatch(pathOrHook, hook);
        }
      } else {
        _hooks.push(pathOrHook);
      }
      for (const hook of hooks) {
        _hooks.push(hook as any);
      }
      return this;
    },

    use<R extends string = string>(
      pathOrHandler: R | Handler<ParamsDictionary, T>,
      ...handlers: RouteHandler<R, T>[]
    ) {
      if (typeof pathOrHandler === "string") {
        for (const handler of handlers) {
          setMatch(pathOrHandler, handler);
        }
      } else {
        _handlers.push(pathOrHandler as any);
      }

      for (const handler of handlers) {
        _handlers.push(handler as any);
      }
      return this;
    },

    listen(init?: ServeInit) {
      return serve(handler, {
        onListen: defaultOnListenHandler,
        onError: defaultErrorHandler,
        ...init,
      });
    },
  };
}
