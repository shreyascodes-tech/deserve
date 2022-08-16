import { serveFile } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { join, normalize } from "https://deno.land/std@0.151.0/path/posix.ts";
import { EtagAlgorithm } from "./types.ts";

/** URL UTILS ( Yanked from the oak repo ) */

const TRAILING_SLASH_RE = /\/$|\/\?/;

export function hasTrailingSlash(input = "", queryParams = false): boolean {
  if (!queryParams) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}

export function hasLeadingSlash(input = ""): boolean {
  return input.startsWith("/");
}

export function withLeadingSlash(input = ""): string {
  return hasLeadingSlash(input) ? input : "/" + input;
}

export function withoutLeadingSlash(input = ""): string {
  return (hasLeadingSlash(input) ? input.substr(1) : input) || "/";
}

export function withTrailingSlash(input = ""): string {
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  const [s0, ...s] = input.split("?");
  return s0 + "/" + (s.length ? `?${s.join("?")}` : "");
}

export function isNonEmptyURL(url: string) {
  return url && url !== "/";
}

export function joinURL(base: string, ...input: string[]): string {
  let url = base || "";

  for (const i of input.filter(isNonEmptyURL)) {
    url = url ? withTrailingSlash(url) + withoutLeadingSlash(i) : i;
  }

  return url;
}

/** CORE */
// deno-lint-ignore ban-types
export function setMatch(pathname: string, o: object) {
  Reflect.set(
    o,
    "__path_pattern__",
    new URLPattern({ pathname: withLeadingSlash(pathname) })
  );
}

// deno-lint-ignore ban-types
export function getMatch(o: object): URLPattern | null {
  return Reflect.get(o, "__path_pattern__");
}

/** STATIC */

export function normalizeURL(url: string): string {
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

export function verifyAndSanitizeUrlRoot(urlRoot?: string) {
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

export async function serveDirIndex(
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
