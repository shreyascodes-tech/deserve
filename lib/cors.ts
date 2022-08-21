import { Context, Handler } from "./types.ts";
import { response } from "./utils.ts";

type Origin = boolean | string | RegExp | (boolean | string | RegExp)[];

export interface CorsOptions {
  origin?: Origin | undefined;
  methods?: string | string[] | undefined;
  allowedHeaders?: string | string[] | undefined;
  exposedHeaders?: string | string[] | undefined;
  credentials?: boolean | undefined;
  maxAge?: number | undefined;
  preflightContinue?: boolean | undefined;
  optionsSuccessStatus?: number | undefined;
}

const defaults = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

function isOriginAllowed(
  origin: string,
  allowedOrigins: CorsOptions["origin"]
) {
  if (Array.isArray(allowedOrigins)) {
    for (const allowedOrigin of allowedOrigins) {
      if (isOriginAllowed(origin, allowedOrigin)) return true;
    }
    return false;
  }

  if (typeof allowedOrigins === "string" || allowedOrigins instanceof String) {
    return origin === allowedOrigins;
  }

  if (allowedOrigins instanceof RegExp) {
    return allowedOrigins.test(origin);
  }

  return !!allowedOrigins;
}

function configureOrigin(options: CorsOptions, req: Request, ctx: Context) {
  if (!options.origin || options.origin === "*") {
    ctx.headers.set("Access-Control-Allow-Origin", "*");
  } else if (
    typeof options.origin === "string" ||
    options.origin instanceof String
  ) {
    ctx.headers.set("Access-Control-Allow-Origin", options.origin as string);
    ctx.headers.append("Vary", "Origin");
  } else {
    const reqOrigin = req.headers.get("Origin")!;
    const originAllowed = isOriginAllowed(reqOrigin, options.origin);

    if (originAllowed) {
      ctx.headers.set("Access-Control-Allow-Origin", reqOrigin);
    }
    ctx.headers.append("Vary", "Origin");
  }
}

function configureCredentials(options: CorsOptions, ctx: Context) {
  if (options.credentials === true) {
    ctx.headers.set("Access-Control-Allow-Credentials", "true");
  }
}

function configureMethods(options: CorsOptions, ctx: Context) {
  // deno-lint-ignore no-explicit-any
  let methods = options.methods as any;
  if (methods?.join) {
    methods = methods.join(","); // .methods is an array, so turn it into a string
  }

  if (options.credentials === true) {
    ctx.headers.set("Access-Control-Allow-Methods", methods);
  }
}

function configureAllowedHeaders(
  options: CorsOptions,
  req: Request,
  ctx: Context
) {
  let allowedHeaders = options.allowedHeaders;

  if (!allowedHeaders) {
    allowedHeaders = req.headers.get("access-control-request-headers")!;
    ctx.headers.append("Vary", "Access-Control-Request-Headers");
  } else if (Array.isArray(allowedHeaders)) {
    ctx.headers.set("Access-Control-Allow-Headers", allowedHeaders.join(","));
  } else if (typeof allowedHeaders === "string") {
    ctx.headers.set("Access-Control-Allow-Headers", allowedHeaders);
  }
}

function configureMaxAge(options: CorsOptions, ctx: Context) {
  const maxAge =
    (typeof options.maxAge === "number" || options.maxAge) &&
    options.maxAge.toString();
  if (maxAge) {
    ctx.headers.set("Access-Control-Max-Age", maxAge);
  }
}

function configureExposedHeaders(options: CorsOptions, ctx: Context) {
  let headers = options.exposedHeaders;
  if (!headers) return;
  if (Array.isArray(headers)) {
    headers = headers.join(",");
  }

  if (typeof headers === "string") {
    ctx.headers.set("Access-Control-Expose-Headers", headers);
  }
}

export function cors(options: CorsOptions): Handler {
  if (options) {
    options = {
      ...options,
      origin: options.origin ?? defaults.origin,
      methods: options.methods ?? defaults.methods,
      preflightContinue:
        options.preflightContinue ?? defaults.preflightContinue,
      optionsSuccessStatus:
        options.optionsSuccessStatus ?? defaults.optionsSuccessStatus,
    };
  }

  return function $corsHandler(req, ctx) {
    const method = req.method.toUpperCase();

    if (method === "OPTIONS") {
      // Preflight
      configureOrigin(options, req, ctx);
      configureCredentials(options, ctx);
      configureMethods(options, ctx);
      configureAllowedHeaders(options, req, ctx);
      configureMaxAge(options, ctx);
      configureExposedHeaders(options, ctx);

      if (options.preflightContinue) return;

      return response(null, {
        status: options.optionsSuccessStatus,
        headers: [["Content-Length", "0"]],
      });
    }

    configureOrigin(options, req, ctx);
    configureCredentials(options, ctx);
    configureExposedHeaders(options, ctx);
    return;
  };
}
