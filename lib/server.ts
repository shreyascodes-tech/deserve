import { serve, serveTls } from "https://deno.land/std@0.181.0/http/mod.ts";

import {
  BaseParams,
  Handler,
  ListenOptions,
  ListenTlsOptions,
  Method,
  RequestEvent,
  Status,
} from "./types.ts";

/**
 * The Server represents a server instance that can be used to handle requests.
 * Middleware functions can be registered using the `use` method.
 *
 * Example:
 * ```ts
 * const app = createServer();
 * app.use((event) => {
 *    return new Response("Hello World");
 * });
 *
 * app.listen({ port: 3000 });
 * ```
 */
class Server {
  private middlewares: (
    | Handler<BaseParams>
    | {
        pattern: URLPattern;
        middleware: Handler<BaseParams>;
      }
  )[] = [];

  /**
   * The use method is used to register middleware functions that runs on every request
   * it takes any number of middleware functions and registers them.
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use((event) => {
   *    console.log("Hello from middleware");
   *    return new Response("Hello World");
   * });
   * ```
   *
   * It optionally takes a path as the first argument and registers the middleware only for that path.
   * The path can be any
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use("/api", (event) => {
   *    console.log("Hello from middleware");
   *    return new Response("Hello World from API");
   * });
   * ```
   *
   * **the event object passed to the middleware function contains the following properties**:
   *  - request: the request object
   *  - params: the params extracted from the url (if any)
   *  - method: the request method
   *  - headers: the response headers
   *
   * The middleware function can return a Response object or a Promise that resolves to a Response object.
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use(event => {
   *   // Set headers on the response
   *   event.headers.set("X-Test", "1");
   * })
   * app.use("/api", (event) => {
   *   return new Response("Hello World from API");
   * });
   * ```
   */
  use<Params extends BaseParams>(...middlewares: Handler<Params>[]): this;
  use<Params extends BaseParams>(middleware: Handler<Params>): this;
  use<Params extends BaseParams>(
    pattern: URLPattern,
    ...middlewares: Handler<Params>[]
  ): this;
  use<Params extends BaseParams>(
    path: string,
    ...middlewares: Handler<Params>[]
  ): this;
  use<Params extends BaseParams>(
    pathOrPatternOrMiddleware: string | URLPattern | Handler<Params>,
    ...middlewares: Handler<Params>[]
  ) {
    let pathOrPattern: string | URLPattern | undefined;
    if (
      typeof pathOrPatternOrMiddleware === "string" ||
      pathOrPatternOrMiddleware instanceof URLPattern
    ) {
      pathOrPattern = pathOrPatternOrMiddleware;
    } else {
      middlewares.push(pathOrPatternOrMiddleware);
    }

    for (const middleware of middlewares) {
      this.middlewares.push(
        pathOrPattern
          ? {
              pattern:
                pathOrPattern instanceof URLPattern
                  ? pathOrPattern
                  : new URLPattern({
                      pathname: pathOrPattern,
                    }),
              middleware: middleware as Handler<BaseParams>,
            }
          : (middleware as Handler<BaseParams>)
      );
    }

    return this;
  }

  /**
   * The handle method is used to handle a request and return a response
   * it takes a request and executes all the matching middleware functions
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use((event) => {
   *   console.log("Hello from middleware");
   *   return new Response("Hello World");
   * });
   *
   * const response = await app.handle(new Request("http://localhost:3000"));
   * console.log(response); // Response { body: "Hello World" }
   * ```
   */
  async handle(req: Request) {
    const middlewares = this.middlewares;
    const url = new URL(req.url);

    const event: RequestEvent<BaseParams> = {
      request: req,
      params: {},
      method: req.method as Method,
      headers: new Headers(),
    };

    let response: Response | void;
    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        response = await middleware(event);
      } else {
        const { pattern, middleware: m } = middleware;

        const match = pattern.exec(url);
        if (!match) continue;

        event.params = match.pathname.groups;

        response = await m(event);
      }

      if (response) break;
    }

    const headers = event.headers;

    if (!response)
      return new Response("Not Found", {
        status: Status.NotFound,
        headers,
      });

    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers,
      statusText: response.statusText,
    });
  }

  /**
   * The listen method is used to start a server on the given port
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use((event) => {
   *   console.log("Hello from middleware");
   *   return new Response("Hello World");
   * });
   * app.listen({ port: 3000 });
   * ```
   */
  listen(init: ListenOptions) {
    return serve(this.handle, init);
  }

  /**
   * The listenTls method is used to start a server on the given port with TLS
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.use((event) => {
   *    console.log("Hello from middleware");
   *    return new Response("Hello World");
   * });
   *
   * app.listenTls({
   * port: 3000,
   *    certFile: "./certs/cert.pem",
   *    keyFile: "./certs/key.pem",
   * });
   * ```
   */
  listenTls(init: ListenTlsOptions) {
    return serveTls(this.handle, init);
  }
}

/**
 * The createServer function is used to create a new server instance
 * it takes no arguments and returns a new server instance
 *
 * Example:
 * ```ts
 * const app = createServer();
 * app.use((event) => {
 *    console.log("Hello from middleware");
 *    return new Response("Hello World");
 * });
 */
export function createServer() {
  return new Server();
}
