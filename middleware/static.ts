import { serveFile } from "https://deno.land/std@0.181.0/http/file_server.ts";
import { DigestAlgorithm } from "https://deno.land/std@0.181.0/crypto/crypto.ts";
import * as posix from "https://deno.land/std@0.181.0/path/posix.ts";
import { Handler, PromiseOr, RequestEvent, Status } from "../mod.ts";

/** Interface for serveFile options. */
export interface SendFileOptions {
  /** The algorithm to use for generating the ETag. Defaults to "fnv1a". */
  etagAlgorithm: DigestAlgorithm;
  /** An optional FileInfo object returned by Deno.stat. It is used for optimization purposes. */
  fileInfo: Deno.FileInfo;
}

/** Interface for serveDir options. */
export interface ServeStaticOptions {
  /** Serves the files under the given directory root. Defaults to your current directory. */
  fsRoot?: string;
  /** The URL root to serve the files from. Defaults to "/". */
  urlRoot?: string;
  /** Enable Serving index.html on base route. Defaults to true. */
  serveIndex?: boolean;
  /** The algorithm to use for generating the ETag. Defaults to "fnv1a". */
  etagAlgorithm?: DigestAlgorithm;
  /** Show directory listing if the requested path is a directory. Defaults to true. */
  showDirListing?: boolean;
  /** Show dotfiles in directory listing. Defaults to false. */
  showDotfiles?: boolean;
  /** This Function is called whenever the file is not found */
  onError?: (
    event: RequestEvent,
    err: unknown
  ) => PromiseOr<Response | void | undefined>;
}

/**
 * Returns an HTTP Response with the requested file as the body.
 */
export function sendFile(
  event: RequestEvent,
  filePath: string,
  options?: SendFileOptions
) {
  return serveFile(event.request, filePath, options);
}

export function serveStatic(opts: ServeStaticOptions = {}): Handler {
  return async function $serveStaticHandler(event) {
    let response: Response | undefined = undefined;
    const target = opts.fsRoot || ".";
    const urlRoot = opts.urlRoot;
    const showIndex = opts.serveIndex ?? true;

    try {
      let normalizedPath = normalizeURL(event.request.url);
      if (urlRoot) {
        if (normalizedPath.startsWith("/" + urlRoot)) {
          normalizedPath = normalizedPath.replace(urlRoot, "");
        } else {
          const errRes = await opts.onError?.(
            event,
            new Deno.errors.NotFound()
          );
          if (errRes) return errRes;
        }
      }

      const fsPath = posix.join(target, normalizedPath);
      const fileInfo = await Deno.stat(fsPath);

      if (fileInfo.isDirectory) {
        if (showIndex) {
          try {
            const path = posix.join(fsPath, "index.html");
            const indexFileInfo = await Deno.lstat(path);
            if (indexFileInfo.isFile) {
              // If the current URL's pathname doesn't end with a slash, any
              // relative URLs in the index file will resolve against the parent
              // directory, rather than the current directory. To prevent that, we
              // return a 301 redirect to the URL with a slash.
              if (!fsPath.endsWith("/")) {
                const url = new URL(event.request.url);
                url.pathname += "/";
                return Response.redirect(url, 301);
              }
              response = await serveFile(event.request, path, {
                etagAlgorithm: opts.etagAlgorithm,
                fileInfo: indexFileInfo,
              });
            }
          } catch (e) {
            if (!(e instanceof Deno.errors.NotFound)) {
              throw e;
            }
            const errRes = await opts.onError?.(event, e);
            if (errRes) return errRes;
          }
        }
        if (!response && opts.showDirListing) {
          response = await serveDirIndex(event, fsPath, {
            dotfiles: opts.showDotfiles || false,
            target,
          });
        }
        if (!response) {
          throw new Deno.errors.NotFound();
        }
      } else {
        response = await serveFile(event.request, fsPath, {
          etagAlgorithm: opts.etagAlgorithm,
          fileInfo,
        });
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error("[non-error thrown]");
      const errRes = await opts.onError?.(event, err);
      if (errRes) return errRes;
    }

    return response!;
  };

  function normalizeURL(url: string): string {
    return posix.normalize(decodeURIComponent(new URL(url).pathname));
  }
}

interface EntryInfo {
  mode: string;
  size: string;
  url: string;
  name: string;
}

function modeToString(isDir: boolean, maybeMode: number | null): string {
  const modeMap = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];

  if (maybeMode === null) {
    return "(unknown mode)";
  }
  const mode = maybeMode.toString(8);
  if (mode.length < 3) {
    return "(unknown mode)";
  }
  let output = "";
  mode
    .split("")
    .reverse()
    .slice(0, 3)
    .forEach((v) => {
      output = `${modeMap[+v]} ${output}`;
    });
  output = `${isDir ? "d" : "-"} ${output}`;
  return output;
}

function fileLenToString(len: number): string {
  const multiplier = 1024;
  let base = 1;
  const suffix = ["B", "K", "M", "G", "T"];
  let suffixIndex = 0;

  while (base * multiplier < len) {
    if (suffixIndex >= suffix.length - 1) {
      break;
    }
    base *= multiplier;
    suffixIndex++;
  }

  return `${(len / base).toFixed(2)}${suffix[suffixIndex]}`;
}

function dirViewerTemplate(dirname: string, entries: EntryInfo[]): string {
  const paths = dirname.split("/");

  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Deno File Server</title>
          <style>
            :root {
              --background-color: #fafafa;
              --color: rgba(0, 0, 0, 0.87);
            }
            @media (prefers-color-scheme: dark) {
              :root {
                --background-color: #292929;
                --color: #fff;
              }
              thead {
                color: #7f7f7f;
              }
            }
            @media (min-width: 960px) {
              main {
                max-width: 960px;
              }
              body {
                padding-left: 32px;
                padding-right: 32px;
              }
            }
            @media (min-width: 600px) {
              main {
                padding-left: 24px;
                padding-right: 24px;
              }
            }
            body {
              background: var(--background-color);
              color: var(--color);
              font-family: "Roboto", "Helvetica", "Arial", sans-serif;
              font-weight: 400;
              line-height: 1.43;
              font-size: 0.875rem;
            }
            a {
              color: #2196f3;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            thead {
              text-align: left;
            }
            thead th {
              padding-bottom: 12px;
            }
            table td {
              padding: 6px 36px 6px 0px;
            }
            .size {
              text-align: right;
              padding: 6px 12px 6px 24px;
            }
            .mode {
              font-family: monospace, monospace;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Index of
            <a href="/">home</a>${paths
              .map((path, index, array) => {
                if (path === "") return "";
                const link = array.slice(0, index + 1).join("/");
                return `<a href="${link}">${path}</a>`;
              })
              .join("/")}
            </h1>
            <table>
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Size</th>
                  <th>Name</th>
                </tr>
              </thead>
              ${entries
                .map(
                  (entry) => `
                    <tr>
                      <td class="mode">
                        ${entry.mode}
                      </td>
                      <td class="size">
                        ${entry.size}
                      </td>
                      <td>
                        <a href="${entry.url}">${entry.name}</a>
                      </td>
                    </tr>
                  `
                )
                .join("")}
            </table>
          </main>
        </body>
      </html>
    `;
}
const encoder = new TextEncoder();

function setBaseHeaders(event: RequestEvent) {
  // Set "accept-ranges" so that the client knows it can make range requests on future requests
  event.headers.set("accept-ranges", "bytes");
  event.headers.set("date", new Date().toUTCString());
}

async function serveDirIndex(
  event: RequestEvent,
  dirPath: string,
  options: {
    dotfiles: boolean;
    target: string;
  }
): Promise<Response> {
  const showDotfiles = options.dotfiles;
  const dirUrl = `/${posix.relative(options.target, dirPath)}`;
  const listEntry: EntryInfo[] = [];

  // if ".." makes sense
  if (dirUrl !== "/") {
    const prevPath = posix.join(dirPath, "..");
    const fileInfo = await Deno.stat(prevPath);
    listEntry.push({
      mode: modeToString(true, fileInfo.mode),
      size: "",
      name: "../",
      url: posix.join(dirUrl, ".."),
    });
  }

  for await (const entry of Deno.readDir(dirPath)) {
    if (!showDotfiles && entry.name[0] === ".") {
      continue;
    }
    const filePath = posix.join(dirPath, entry.name);
    const fileUrl = encodeURIComponent(
      posix.join(dirUrl, entry.name)
    ).replaceAll("%2F", "/");
    const fileInfo = await Deno.stat(filePath);
    listEntry.push({
      mode: modeToString(entry.isDirectory, fileInfo.mode),
      size: entry.isFile ? fileLenToString(fileInfo.size ?? 0) : "",
      name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
      url: `${fileUrl}${entry.isDirectory ? "/" : ""}`,
    });
  }
  listEntry.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );
  const formattedDirUrl = `${dirUrl.replace(/\/$/, "")}/`;
  const page = encoder.encode(dirViewerTemplate(formattedDirUrl, listEntry));

  setBaseHeaders(event);
  event.headers.set("content-type", "text/html");

  //   return createCommonResponse(Status.OK, page, { headers });
  return new Response(page, {
    status: Status.OK,
  });
}
