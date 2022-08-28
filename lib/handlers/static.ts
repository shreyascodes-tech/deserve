import { serveFile } from "https://deno.land/std@0.153.0/http/file_server.ts";
import { join } from "https://deno.land/std@0.153.0/path/posix.ts";
import {
  normalizeURL,
  PromiseOr,
  serveDirIndex,
  verifyAndSanitizeUrlRoot,
} from "../internal.ts";
import { Context, Handler, ParamsDictionary } from "../handler.ts";

export type EtagAlgorithm =
  | "fnv1a"
  | "sha-1"
  | "sha-256"
  | "sha-384"
  | "sha-512";

/** Interface for serveFile options. */
export interface SendFileOptions {
  /** The algorithm to use for generating the ETag. Defaults to "fnv1a". */
  etagAlgorithm?: EtagAlgorithm;
  /** An optional FileInfo object returned by Deno.stat. It is used for optimization purposes. */
  fileInfo?: Deno.FileInfo;
}

/** Interface for serveDir options. */
export interface ServeStaticOptions {
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
}

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

// deno-lint-ignore ban-types
export function serveStatic<Params = ParamsDictionary, CtxExtensions = {}>(
  opts: ServeStaticOptions = {}
): Handler<Params, CtxExtensions> {
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
