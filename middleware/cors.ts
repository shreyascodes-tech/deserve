import { Handler, RequestEvent, Status } from "../mod.ts";

type Origin = boolean | string | RegExp | (boolean | string | RegExp)[];

/**
 * The options that can be passed to the `cors` middleware.
 * It is an object with the following properties:
 *  - `origin`: a string, regex, or array of strings or regexes that match the origin of the request. If a string or regex is provided, only requests with origins that match will be allowed. If an array is provided, the first origin that matches will be allowed. If `true` is provided, all origins will be allowed. If `false` is provided, no origins will be allowed. Defaults to `*`.
 *  - `methods`: a string or array of strings that match the HTTP methods that are allowed. Defaults to `GET,HEAD,PUT,PATCH,POST,DELETE`.
 *  - `allowedHeaders`: a string or array of strings that match the headers that are allowed. Defaults to `Content-Type,Authorization,X-Requested-With`.
 *  - `exposedHeaders`: a string or array of strings that match the headers that are exposed. Defaults to `Content-Type,Authorization,X-Requested-With`.
 *  - `credentials`: a boolean that indicates whether or not the response to the request can be exposed when the credentials flag is true. Defaults to `true`.
 *  - `maxAge`: a number that indicates how long the results of a preflight request can be cached. Defaults to `86400` (24 hours).
 *  - `preflightContinue`: a boolean that indicates whether or not the actual request should be continued to be handled after the preflight request. Defaults to `false`.
 *  - `optionsSuccessStatus`: a number that indicates what status code should be returned for the preflight request. Defaults to `204`.
 */
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
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: Status.NoContent,
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

function configureOrigin(options: CorsOptions, event: RequestEvent) {
  if (!options.origin || options.origin === "*") {
    event.headers.set("Access-Control-Allow-Origin", "*");
  } else if (
    typeof options.origin === "string" ||
    options.origin instanceof String
  ) {
    event.headers.set("Access-Control-Allow-Origin", options.origin as string);
    event.headers.append("Vary", "Origin");
  } else {
    const reqOrigin = event.request.headers.get("Origin")!;
    const originAllowed = isOriginAllowed(reqOrigin, options.origin);

    if (originAllowed) {
      event.headers.set("Access-Control-Allow-Origin", reqOrigin);
    }
    event.headers.append("Vary", "Origin");
  }
}

function configureCredentials(options: CorsOptions, event: RequestEvent) {
  if (options.credentials === true) {
    event.headers.set("Access-Control-Allow-Credentials", "true");
  }
}

function configureMethods(options: CorsOptions, event: RequestEvent) {
  let methods = options.methods;

  if (Array.isArray(methods)) {
    methods = methods.join(","); // .methods is an array, so turn it into a string
  }

  if (options.credentials === true) {
    event.headers.set("Access-Control-Allow-Methods", methods as string);
  }
}

function configureAllowedHeaders(options: CorsOptions, event: RequestEvent) {
  let allowedHeaders = options.allowedHeaders;

  if (!allowedHeaders) {
    allowedHeaders = event.request.headers.get(
      "access-control-request-headers"
    )!;
    event.headers.append("Vary", "Access-Control-Request-Headers");
  } else if (Array.isArray(allowedHeaders)) {
    event.headers.set("Access-Control-Allow-Headers", allowedHeaders.join(","));
  } else if (typeof allowedHeaders === "string") {
    event.headers.set("Access-Control-Allow-Headers", allowedHeaders);
  }
}

function configureMaxAge(options: CorsOptions, event: RequestEvent) {
  const maxAge =
    (typeof options.maxAge === "number" || options.maxAge) &&
    options.maxAge.toString();
  if (maxAge) {
    event.headers.set("Access-Control-Max-Age", maxAge);
  }
}

function configureExposedHeaders(options: CorsOptions, event: RequestEvent) {
  let headers = options.exposedHeaders;
  if (!headers) return;
  if (Array.isArray(headers)) {
    headers = headers.join(",");
  }

  if (typeof headers === "string") {
    event.headers.set("Access-Control-Expose-Headers", headers);
  }
}

/**
 * CORS middleware
 * It is a middleware that can be used to enable CORS with various options.
 *
 * Example:
 * ```ts
 * const server = createServer();
 * server.use(cors());
 * ```
 */
export function cors(options: CorsOptions = {}): Handler {
  if (options) {
    options = {
      ...options,
      origin: options.origin ?? defaults.origin,
      methods: options.methods ?? defaults.methods,
      credentials: options.credentials ?? defaults.credentials,
      preflightContinue:
        options.preflightContinue ?? defaults.preflightContinue,
      optionsSuccessStatus:
        options.optionsSuccessStatus ?? defaults.optionsSuccessStatus,
    };
  }

  return function $corsHandler(event) {
    if (event.method === "OPTIONS") {
      // Preflight
      configureOrigin(options, event);
      configureCredentials(options, event);
      configureMethods(options, event);
      configureAllowedHeaders(options, event);
      configureMaxAge(options, event);
      configureExposedHeaders(options, event);

      if (options.preflightContinue) return;

      return new Response(null, {
        status: options.optionsSuccessStatus,
        headers: [["Content-Length", "0"]],
      });
    }

    configureOrigin(options, event);
    configureCredentials(options, event);
    configureExposedHeaders(options, event);
    return;
  };
}
