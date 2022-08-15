// deno-lint-ignore-file no-explicit-any
import {
  ConnInfo,
  serve,
  ServeInit,
} from "https://deno.land/std@0.151.0/http/server.ts";
import { withLeadingSlash } from "https://esm.sh/ufo";
import { DeserveApp, Context, Handler, Hook, RouteHandler } from "./types.ts";
import {
  defaultErrorHandler,
  defaultOnListenHandler,
  response,
} from "./utils.ts";

export function createApp(): DeserveApp {
  const _handlers: Handler[] = [];
  const _hooks: Hook[] = [];

  // deno-lint-ignore ban-types
  function setMatch(pathname: string, o: object) {
    Reflect.set(
      o,
      "__path_pattern__",
      new URLPattern({ pathname: withLeadingSlash(pathname) })
    );
  }

  // deno-lint-ignore ban-types
  function getMatch(o: object): URLPattern | null {
    return Reflect.get(o, "__path_pattern__");
  }

  const handler = async function serveHandler(req: Request, conn: ConnInfo) {
    const { method, url } = req;
    const { pathname } = new URL(url);

    let res: Response | void;
    const ctx: Context = { conn };

    // Execute Pre Hooks
    for (const hook of _hooks) {
      const pattern = getMatch(hook);

      if (!pattern) {
        const res = await hook.preHandler?.(req, ctx as any);
        if (res) return res;
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

      const res = await hook.preHandler?.(req, ctx as any);
      if (res) return res;
    }

    // Execute Handlers
    for (const handler of _handlers) {
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

      if (res) break;
    }

    // Execute Post Hooks
    for (const hook of _hooks) {
      const pattern = getMatch(hook);

      if (!pattern) {
        const endRes = await hook.postHandler?.(req, { conn });
        if (endRes) return endRes;
        if (res) return res;
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

      const endRes = await hook.postHandler?.(req, ctx as any);
      if (endRes) return endRes;
      if (res) return res;
    }
    if (res) return res;

    return response(`Cannot ${method} ${pathname}`);
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
      pathOrHandler: R | Handler,
      ...handlers: RouteHandler<R>[]
    ) {
      if (typeof pathOrHandler === "string") {
        for (const handler of handlers) {
          setMatch(pathOrHandler, handler);
        }
      } else {
        _handlers.push(pathOrHandler);
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
