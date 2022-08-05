import { $URL, joinURL, parseURL } from "https://esm.sh/ufo";
import { Handler, Method, PromiseOr } from "./types.ts";
import {
  serveFile,
  ServeFileOptions,
} from "https://deno.land/std@0.151.0/http/file_server.ts";

/** A pass through function for better type checking for handler functions  */
export function handler(h: Handler): Handler {
  return h;
}

/** Catch errors occuring in a particular handler */
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
 * executes all the input handlers until a handler returns a valid response object
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

/** Executes the handler only when the request method matches the input method */
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
