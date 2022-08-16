import { serveFile } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { join } from "https://deno.land/std@0.151.0/path/posix.ts";
import {
  normalizeURL,
  serveDirIndex,
  verifyAndSanitizeUrlRoot,
} from "./internal.ts";
import { Handler, ParamsDictionary } from "./types/core.ts";
import { SendFileOptions, ServeStaticOptions } from "./types/static.ts";

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
