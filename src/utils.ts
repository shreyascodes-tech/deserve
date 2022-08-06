import { $URL, joinURL, parseURL } from "https://esm.sh/ufo";
import { Handler, Method, PromiseOr } from "./types.ts";
import {
  serveFile,
  ServeFileOptions,
} from "https://deno.land/std@0.151.0/http/file_server.ts";

/** A pass through function for better type checking for handler functions
 *
 *  ```
 *  const helloHandler = handler((req) => new Response("Hello World"))
 *  ```
 */
export function handler(h: Handler): Handler {
  return h;
}

/** Catch errors occuring in a particular handler
 * ```ts
 *  import {
 *         deserve,
 *         errorBoundary
 *     } from "https://deno.land/x/deserve/mod.ts"
 *
 *     const app = deserve({
 *         handlers: [
 *             errorBoundary(
 *                 (req) => {
 *                     funcThatThrows();
 *                     return new Response("Unreachable.!")
 *                 },
 *                 // A function that handles the error
 *                 (req, err) => {
 *                   console.error(err)
 *                   return new Response("Oh oh an Error Occured", {
 *                       status: 500
 *                   })
 *               }
 *           )
 *       ]
 *   })
 * ```
 */
export function errorBoundary(
  handler: Handler,
  onError: (
    req: Request,
    err: unknown
  ) => PromiseOr<Response | null | undefined | void>
): Handler {
  return async (req) => {
    let res: Response | null | undefined | void;
    try {
      res = await handler(req);
    } catch (error) {
      res = await onError(req, error);
    }
    return res;
  };
}

/** A function that takes many handlers and returns a handler that
 * executes the input handlers in order until a handler returns a valid response object
 */
export function many(...handlers: Handler[]): Handler {
  return async (request) => {
    for (const handler of handlers) {
      const res = await handler(request);
      if (res === null || res === undefined) {
        continue;
      }
      return res;
    }
  };
}

/** Returns a new handler that executes the input handler only when the condition function returns true */
export function when(
  condition: (req: Request) => boolean,
  handler: Handler
): Handler {
  return (req) => {
    if (condition(req)) {
      return handler(req);
    }
  };
}

/** Executes the handler only when the request method matches the input method
 * this is a verbose function, please use get, post, put, patch etc
 */
export function method(method: Method, ...handlers: Handler[]): Handler {
  return when(
    (r) => r.method.toLowerCase() === method.toLowerCase(),
    many(...handlers)
  );
}

/** A handler utility function to send a file as a response with etag support */
export function file(
  path: string,
  {
    etagAlgorithm,
    fileInfo,
    onError,
  }: ServeFileOptions & {
    onError?: (
      req: Request,
      err: unknown
    ) => PromiseOr<void | Response | null | undefined>;
  } = {}
): Handler {
  return errorBoundary(
    (req) => serveFile(req, path, { etagAlgorithm, fileInfo }),
    onError ??
      ((_, err) => {
        console.error(err);
        return new Response("Not Found", {
          status: 404,
        });
      })
  );
}

/** A handler that serves static files in a directory
 * ```ts
 *  import {
 *        deserve,
 *        // Import the static handler
 *        staticHandler,
 *    } from "https://deno.land/x/deserve/mod.ts"
 *
 *    const app = deserve({
 *        handlers: [
 *            staticHandler(
 *                // Root Directory to serve. Defaults to "public"
 *                "public",
 *                // A flag to turn serving index.html when visiting root directory. Defaults to True
 *                true,
 *            ),
 *        ]
 *    })
 *
 *    app.listen({
 *        port: 8000,
 *    })
 * ```
 */
export function staticHandler(fsRoot = "public", serveIndex = true): Handler {
  return errorBoundary(
    async (req) => {
      const normalizedPath = parseURL(req.url).pathname;
      const fsPath = joinURL(fsRoot, normalizedPath);

      const fileInfo = await Deno.stat(fsPath);

      if (fileInfo.isDirectory && serveIndex) {
        const indexFile = joinURL(fsPath, "index.html");
        const fileInfo = await Deno.stat(indexFile);
        if (fileInfo.isFile) {
          return serveFile(req, indexFile, {
            fileInfo,
          });
        }
        return;
      }

      if (fileInfo.isFile) {
        return serveFile(req, fsPath, {
          fileInfo,
        });
      }
    },
    () => null
  );
}

const urlCache = new Map<Request, URL>();

/** Returns the parsed url from the given requests */
export function useURL(req: Request): URL {
  if (!urlCache.has(req)) {
    urlCache.set(req, new $URL(req.url));
  }

  return urlCache.get(req)!;
}

export type ContextGetter<T> = () => T;
export type ContextSetter<T> = (data: T | ((prev: T) => T)) => T;

export function createContext<T>(initialData: T) {
  const id = Math.random().toString(36).slice(2);

  let initial = true;
  return function useContext(
    req: Request
  ): [ContextGetter<T>, ContextSetter<T>] {
    // deno-lint-ignore no-explicit-any
    const r = req as any;
    r["__context__"] ??= {};

    if (initial) {
      r["__context__"][id] = initialData;
      initial = false;
    }

    function get() {
      return r["__context__"][id] as T;
    }

    function set(data: T | ((prev: T) => T)) {
      if (typeof data === "function") {
        data = (data as (p: T) => T)(r["__context__"][id]);
      }

      r["__context__"][id] = data;
      return get();
    }

    return [get, set];
  };
}
