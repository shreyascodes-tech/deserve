import { Context, PromiseOr } from "./core.ts";

/** Algorithm used to determine etag */
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
