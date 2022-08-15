import { serveFile } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { join, normalize } from "https://deno.land/std@0.151.0/path/posix.ts";
import { Context, Handler, PromiseOr } from "./types.ts";

/** Algorithm used to determine etag */
export type EtagAlgorithm =
  | "fnv1a"
  | "sha-1"
  | "sha-256"
  | "sha-384"
  | "sha-512";

/** Interface for serveFile options. */
export type SendFileOptions = {
  /** The algorithm to use for generating the ETag. Defaults to "fnv1a". */
  etagAlgorithm?: EtagAlgorithm;
  /** An optional FileInfo object returned by Deno.stat. It is used for optimization purposes. */
  fileInfo?: Deno.FileInfo;
};

/** Interface for serveDir options. */
export type ServeStaticOptions = {
  /** Serves the files under the given directory root. Defaults to your current directory. */
  fsRoot?: string;
  /** Enable Serving index.html on base route. Defaults to true. */
  serveIndex?: boolean;
  /** The algorithm to use for generating the ETag. Defaults to "fnv1a". */
  etagAlgorithm?: EtagAlgorithm;
  /** This Functon is called whenever the file is not found */
  onError?: (
    request: Request,
    ctx: Context,
    err: unknown
  ) => PromiseOr<Response | void>;
};

/**
 * Returns an HTTP Response with the requested file as the body.
 */
export function sendFile(
  req: Request,
  filePath: string,
  options?: SendFileOptions
) {
  return serveFile(req, filePath, options);
}

function normalizeURL(url: string): string {
  let normalizedUrl = url;

  try {
    //allowed per https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
    const absoluteURI = new URL(normalizedUrl);
    normalizedUrl = absoluteURI.pathname;
  } catch (e) {
    //wasn't an absoluteURI
    if (!(e instanceof TypeError)) {
      throw e;
    }
  }

  try {
    normalizedUrl = decodeURI(normalizedUrl);
  } catch (e) {
    if (!(e instanceof URIError)) {
      throw e;
    }
  }

  if (normalizedUrl[0] !== "/") {
    throw new URIError("The request URI is malformed.");
  }

  normalizedUrl = normalize(normalizedUrl);
  const startOfParams = normalizedUrl.indexOf("?");

  normalizedUrl =
    !normalizedUrl.endsWith("/") && !normalizedUrl.match(/((.*)\.(.*))$/)
      ? normalizedUrl + "/"
      : normalizedUrl;

  return startOfParams > -1
    ? normalizedUrl.slice(0, startOfParams)
    : normalizedUrl;
}

function verifyAndSanitizeUrlRoot(urlRoot?: string) {
  if (!urlRoot) return;

  if (
    urlRoot.includes(":") ||
    (!(urlRoot.endsWith("/*") && urlRoot.endsWith("/*/")) &&
      urlRoot.endsWith("/*?") &&
      urlRoot.endsWith("/*?/"))
  )
    throw new Error(
      "path pattern for serve static must not contain any named groups and must end with a /* or /*?"
    );

  urlRoot = urlRoot?.replace(/\/\*(\?)?$/, "");
  urlRoot = urlRoot && (!urlRoot.startsWith("/") ? urlRoot : urlRoot.slice(1));
  urlRoot = urlRoot && (urlRoot.endsWith("/") ? urlRoot : urlRoot + "/");

  return urlRoot;
}

async function serveDirIndex(
  req: Request,
  dirPath: string,
  options: {
    target: string;
    etagAlgorithm?: EtagAlgorithm;
  }
) {
  const filePath = join(dirPath, "index.html");

  try {
    const fileInfo = await Deno.stat(filePath);
    return serveFile(req, filePath, {
      etagAlgorithm: options.etagAlgorithm,
      fileInfo,
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return;
    throw error;
  }
}

export function serveStatic<T>(opts: ServeStaticOptions = {}): Handler<T> {
  opts.serveIndex ??= true;

  const target = opts?.fsRoot || ".";

  return async function $serveStaticHandler(req, ctx) {
    const urlRoot = verifyAndSanitizeUrlRoot(ctx?.pattern?.pathname);

    try {
      let normalizedPath = normalizeURL(req.url);

      if (urlRoot) {
        if (normalizedPath.startsWith("/" + urlRoot)) {
          normalizedPath = normalizedPath.replace(urlRoot, "");
        } else {
          throw new Deno.errors.NotFound();
        }
      }

      const fsPath = join(target, normalizedPath);

      const fileInfo = await Deno.stat(fsPath);

      if (fileInfo.isDirectory) {
        if (!opts.serveIndex) return;

        return await serveDirIndex(req, fsPath, {
          target,
        });
      } else {
        return await serveFile(req, fsPath, {
          etagAlgorithm: opts.etagAlgorithm,
          fileInfo,
        });
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // deno-lint-ignore no-explicit-any
        const res = await opts.onError?.(req, ctx as any, error);
        if (res) return res;
        return;
      }
      throw error;
    }
  };
}
