// deno-lint-ignore-file ban-types no-explicit-any
import {
  serve,
  ServeInit,
  ConnInfo,
} from "https://deno.land/std@0.153.0/http/mod.ts";
import {
  defaultErrorHandler,
  defaultOnListenHandler,
  response,
} from "./utils.ts";
import { Context, Handler, ParamsDictionary, RouteHandler } from "./handler.ts";
import { Hook } from "./hook.ts";
import { PromiseOr, withLeadingSlash, getMatch, setMatch } from "./internal.ts";

/** */
export interface DeserveApp<CtxExtensions = {}> {
  hook(...hooks: Hook<string, CtxExtensions>[]): DeserveApp<CtxExtensions>;
  hook<R extends string = string>(
    path: R,
    ...hooks: Hook<R, CtxExtensions>[]
  ): DeserveApp<CtxExtensions>;
  use(
    ...handlers: Handler<ParamsDictionary, CtxExtensions>[]
  ): DeserveApp<CtxExtensions>;
  use<R extends string = string>(
    path: R,
    ...handlers: RouteHandler<R, CtxExtensions>[]
  ): DeserveApp<CtxExtensions>;

  listen(init?: ServeInit): Promise<void>;
}

function contextCreator(
  ctxData: Map<any, any>,
  createContext?: (req: Request, conn: ConnInfo) => PromiseOr<any>
) {
  return async function $createContext(
    req: Request,
    conn: ConnInfo
  ): Promise<Context> {
    const ctxExt = (await createContext?.(req, conn)) ?? {};
    return {
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
  };
}

export function createApp<T = {}>(
  createContext?: (req: Request, conn: ConnInfo) => PromiseOr<T>
): DeserveApp<T> {
  const _handlers: Handler[] = [];
  const _hooks: Hook[] = [];
  const ctxData = new Map();

  const createCtx = contextCreator(ctxData, createContext);

  async function handler(req: Request, conn: ConnInfo) {
    const { method, url } = req;
    const { pathname } = new URL(url);

    let res: Response | void;

    const ctx = await createCtx(req, conn);

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
  }

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
