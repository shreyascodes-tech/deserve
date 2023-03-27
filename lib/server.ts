import { serve, serveTls } from "https://deno.land/std@0.181.0/http/mod.ts";

import {
  BaseParams,
  BaseState,
  Handler,
  ListenOptions,
  ListenTlsOptions,
  Status,
  Hook,
  NotFoundHandler,
} from "./types.ts";

import {
  createRequestEvent,
  createResponse,
  RequestEvent,
  setParams,
} from "./event.ts";

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
class Server<ServerState extends BaseState = BaseState> {
  private middlewares: (
    | Handler<string, BaseParams>
    | {
        pattern: URLPattern;
        middleware: Handler<string, BaseParams>;
      }
  )[] = [];

  private hook: Hook<ServerState> = (event, resolve) => resolve(event);

  constructor(
    public state: ServerState = {} as ServerState,
    private notFoundHandler: NotFoundHandler = ({
      method,
      url: { pathname },
    }) =>
      new Response(`cannot ${method} ${pathname}`, { status: Status.NotFound })
  ) {}

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
  use<
    State extends BaseState = ServerState,
    Params extends BaseParams = BaseParams
  >(
    ...middlewares: Handler<string, Params, ServerState & State>[]
  ): Server<ServerState & State>;
  use<
    State extends BaseState = ServerState,
    Params extends BaseParams = BaseParams
  >(
    middleware: Handler<string, Params, ServerState & State>
  ): Server<ServerState & State>;
  use<
    State extends BaseState = ServerState,
    Params extends BaseParams = BaseParams
  >(
    pattern: URLPattern,
    ...middlewares: Handler<string, Params, ServerState & State>[]
  ): Server<ServerState & State>;
  use<Path extends string = string, State extends BaseState = ServerState>(
    path: Path,
    ...middlewares: Handler<Path, ServerState & State>[]
  ): Server<ServerState & State>;
  use(
    pathOrPatternOrMiddleware: string | URLPattern | Handler<string>,
    ...middlewares: Handler<string>[]
  ) {
    if (
      typeof pathOrPatternOrMiddleware === "string" ||
      pathOrPatternOrMiddleware instanceof URLPattern
    ) {
      this.addMiddlewareWithPattern(pathOrPatternOrMiddleware, ...middlewares);
    } else {
      this.addMiddleware(pathOrPatternOrMiddleware, ...middlewares);
    }

    return this;
  }

  /**
   * The useHook method is used to register a hook function that runs before every request.
   * The hook function takes the request event object and a resolve function as arguments,
   * the resolve function is used to call the next hook or the registered middleware functions.
   * the hook function can return a Response object or a Promise that resolves to a Response object.
   *
   * Example:
   * ```ts
   * const app = createServer();
   * app.useHook((event, resolve) => {
   *      if (!event.cookies.get("token")) {
   *          return new Response("Unauthorized", { status: Status.Unauthorized });
   *      }
   *      return resolve();
   * });
   * app.use((event) => {
   *   return new Response("Hello World");
   * }); // The response will be "Unauthorized" if the token cookie is not set
   * ```
   */
  useHook<State extends BaseState = BaseState>(
    hook: Hook<ServerState & State>
  ) {
    this.addHook(hook as Hook<ServerState>);
    return this as Server<ServerState & State>;
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
    const event = createRequestEvent(req, {
      ...this.state,
    });

    const res = await this.hook(event as RequestEvent<never, ServerState>, () =>
      this.handler(event)
    );

    if (!res) {
      return this.notFoundHandler(event);
    }

    return res;
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
    return serve(this.handle.bind(this), init);
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
    return serveTls(this.handle.bind(this), init);
  }

  private addMiddleware(...middleware: Handler<string, BaseParams>[]) {
    for (const m of middleware) {
      this.middlewares.push(m);
    }
  }

  private addMiddlewareWithPattern(
    pattern: URLPattern | string,
    ...middleware: Handler<string, BaseParams>[]
  ) {
    if (typeof pattern === "string") {
      pattern = new URLPattern({ pathname: pattern });
    }

    for (const m of middleware) {
      this.middlewares.push({ pattern, middleware: m });
    }
  }

  private async handler(event: RequestEvent) {
    const middlewares = this.middlewares;
    const url = event.url;

    let response: Response | undefined;
    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        response = (await middleware(event)) as Response | undefined;
      } else {
        const { pattern, middleware: m } = middleware;

        const match = pattern.exec(url);
        if (!match) continue;

        setParams(event, match.pathname.groups);

        response = (await m(event)) as Response | undefined;
      }

      if (response) break;
    }

    return createResponse(event, response);
  }

  private addHook(hook: Hook<ServerState>) {
    const _hook = this.hook as Hook<ServerState>;
    this.hook = async (event, resolve) => {
      return await _hook(event, (event) => hook(event, resolve));
    };
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
export function createServer<ServerState extends BaseState = BaseState>(
  state: ServerState = {} as ServerState
) {
  return new Server(state);
}

export { type Server };
