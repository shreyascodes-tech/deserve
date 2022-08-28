import {
  bold,
  brightBlue,
  brightGreen,
  brightMagenta,
  brightYellow,
  magenta,
} from "https://deno.land/std@0.153.0/fmt/colors.ts";
import { Context, Handler } from "./handler.ts";
import { Hook } from "./hook.ts";
import { PromiseOr } from "./internal.ts";

export function defaultOnListenHandler(params: {
  hostname: string;
  port: number;
}) {
  const hostname =
    params.hostname === "0.0.0.0" ? "localhost" : params.hostname;

  const url = `http://${hostname}:${params.port}/`;

  console.log(`${magenta("Listening on")} ${bold(brightMagenta(url))}`);
}

export function defaultErrorHandler(error: unknown) {
  console.error(error);
  return new Response("Internal Server Error", { status: 500 });
}

export function createLogger(filterPaths?: string[]): Hook {
  let start: number;

  return {
    preHandler() {
      start = Date.now();
    },
    postHandler(req, ctx) {
      const { pathname } = new URL(req.url);

      if (filterPaths?.includes(pathname)) return;

      const time = Date.now() - start;
      const status = ctx.response?.status;
      console.log(
        `${brightGreen(req.method)} | ${brightMagenta(
          status?.toString() ?? ""
        )} | ${brightYellow(pathname)} - ${brightBlue(`${time}ms`)}`
      );
    },
  };
}

/** An alias for the Response constructor */
export function response(
  body?: BodyInit | null | undefined,
  init?: ResponseInit | undefined
) {
  return new Response(body, init);
}

/** Creates a JSON Response object with given data */
export function json(data?: unknown, init?: ResponseInit | undefined) {
  return Response.json(data, init);
}

/** Catch errors occurring in a particular handler
 * ```ts
 *  errorBoundary(
 *        (req) => {
 *            funcThatThrows();
 *            return response("Unreachable.!")
 *        },
 *        // A function that handles the error
 *        (req, ctx, err) => {
 *          console.error(err)
 *          return response("Oh oh an Error Occured", {
 *              status: 500
 *          })
 *      }
 *  )
 * ```
 */
export function errorBoundary(
  handler: Handler,
  onError: (
    req: Request,
    cts: Context,
    err: unknown
  ) => PromiseOr<Response | null | undefined | void>
): Handler {
  return async (req, ctx) => {
    let res: Response | undefined;
    try {
      // deno-lint-ignore no-explicit-any
      res = (await handler(req, ctx)) as any;
    } catch (error) {
      // deno-lint-ignore no-explicit-any
      res = (await onError(req, ctx, error)) as any;
    }
    return res;
  };
}
