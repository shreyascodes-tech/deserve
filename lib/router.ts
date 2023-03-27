import { joinURL } from "https://esm.sh/v113/ufo@1.1.1/dist/index";
import { RequestEvent, setState } from "./event.ts";
import { Routes } from "./routes.ts";
import { type Server } from "./server.ts";
import {
  BaseParams,
  BaseState,
  PathParameters,
  Handler,
  Method,
} from "./types.ts";

export interface RouterOptions<
  Prefix extends string = string,
  // PrefixParams extends BaseParams = PathParameters<Prefix>,
  RouterState extends BaseState = BaseState
> {
  prefix?: Prefix;
  state: RouterState;
}

/**
 * The Router class represents a router instance.
 * It is used to register routes and middleware.
 * It is created using the createRouter function.
 * It can be added to a server using the server.use method.
 *
 * Example:
 * ```ts
 * const server = createServer();
 * const router = createRouter({ server, prefix: "/api" });
 *
 * router.get("/hello", (event) => {
 *   return new Response("Hello World");
 * }); // This route will be available at http://localhost:8080/api/hello
 *
 * server.use(router.handler());
 *
 * server.listen({ port: 8080 });
 * ```
 */
class Router<
  Prefix extends string = string,
  RouterState extends BaseState = BaseState
> {
  private routes: Routes;
  public state: RouterState;

  constructor(config: RouterOptions<Prefix, RouterState>) {
    this.routes = new Routes(config.prefix);
    this.state = config.state;
  }

  /**
   * The use method is used to register middleware functions that runs on every request
   * it takes any number of middleware functions and registers them.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.use((event) => {
   *    console.log("Hello from middleware");
   * }); // This middleware will run on every request to the path /api
   *
   * ```
   *
   * It optionally takes a path as the first argument and registers the middleware only for that path.
   * The path can be any
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.use("/v1", (event) => {
   *    console.log("Hello from middleware");
   * }); // This middleware will run on every request to the path /api/v1
   *
   * ```
   */
  use<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  use<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  use<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    if (typeof path === "string") {
      this.routes.addHandlers(
        handlers as unknown as Handler<string, BaseState, BaseParams>[],
        path
      );
    } else {
      this.routes.addHandlers([path, ...handlers] as unknown as Handler<
        string,
        BaseState,
        BaseParams
      >[]);
    }
    return this;
  }

  /**
   * A Handler that handles GET requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.get("/v1", (event) => {
   *   return new Response("Hello from GET /api/v1");
   * }); // This handler will run on every GET request to the path /api/v1
   *
   * ```
   */
  get<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  get<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  get<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("GET", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles POST requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.post("/v1", (event) => {
   *  return new Response("Hello from POST /api/v1");
   * }); // This handler will run on every POST request to the path /api/v1
   *
   * ```
   */
  post<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  post<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  post<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("POST", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles PUT requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.put("/v1", (event) => {
   *    return new Response("Hello from PUT /api/v1");
   * }); // This handler will run on every PUT request to the path /api/v1
   *
   * ```
   */
  put<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  put<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  put<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("PUT", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles PATCH requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.patch("/v1", (event) => {
   *   return new Response("Hello from PATCH /api/v1");
   * }); // This handler will run on every PATCH request to the path /api/v1
   *
   * ```
   */
  delete<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  delete<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  delete<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("DELETE", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles PATCH requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.patch("/v1", (event) => {
   *  return new Response("Hello from PATCH /api/v1");
   * }); // This handler will run on every PATCH request to the path /api/v1
   * ```
   */
  head<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  head<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  head<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("HEAD", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles PATCH requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.patch("/v1", (event) => {
   *    return new Response("Hello from PATCH /api/v1");
   * }); // This handler will run on every PATCH request to the path /api/v1
   *
   * ```
   */
  options<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  options<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  options<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("OPTIONS", path, ...handlers);
    return this;
  }

  /**
   * A Handler that handles PATCH requests to the router.
   * It optionally takes a path as the first argument and registers the handler only for that path.
   *
   * Example:
   * ```ts
   * const server = createServer();
   * const router = createRouter({ server, prefix: "/api" });
   *
   * router.patch("/v1", (event) => {
   *   return new Response("Hello from PATCH /api/v1");
   * }); // This handler will run on every PATCH request to the path /api/v1
   *
   * ```
   */
  patch<State extends BaseState = RouterState, Path extends string = string>(
    path: Path,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ): Router<Prefix, RouterState & State>;
  patch<State extends BaseState = RouterState>(
    ...handlers: Handler<string, State & RouterState, BaseParams>[]
  ): Router<Prefix, RouterState & State>;
  patch<State extends BaseState = RouterState, Path extends string = string>(
    path: Path | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    this.addRoute("PATCH", path, ...handlers);
    return this;
  }

  private addRoute<Path extends string, State extends BaseState>(
    method: Method,
    path: string | Handler<Path, State & RouterState, PathParameters<Prefix>>,
    ...handlers: Handler<Path, State & RouterState, PathParameters<Prefix>>[]
  ) {
    if (typeof path === "string") {
      this.routes.addHandlers(
        handlers as unknown as Handler<string, BaseState, BaseParams>[],
        path,
        method
      );
    } else {
      this.routes.addHandlers(
        [path, ...handlers] as unknown as Handler<
          string,
          BaseState,
          BaseParams
        >[],
        undefined,
        method
      );
    }
    return this;
  }

  addRouter<Prefix extends string, State extends BaseState>(
    router: Router<Prefix, State>
  ) {
    router.routes.prefix = joinURL(
      this.routes.prefix ?? "/",
      router.routes.prefix ?? "/"
    );

    this.routes.addHandlers([
      async (event: RequestEvent<BaseParams>) => {
        const state = event.state;
        setState(event, {
          ...state,
          ...router.state,
        });

        const res = await router.routes.handleEvent(event);
        setState(event, state);

        return res;
      },
    ]);
    return this;
  }

  private async handle(event: RequestEvent<BaseParams>) {
    const state = event.state;
    setState(event, {
      ...state,
      ...this.state,
    });

    const res = await this.routes.handleEvent(event);

    setState(event, state);

    return res;
  }

  handler() {
    return this.handle.bind(this);
  }
}

/**
 * The Router class represents a router instance.
 * It is used to register routes and middleware.
 * It is created using the createRouter function.
 * It can be added to a server using the server.use method.
 *
 * Example:
 * ```ts
 * const server = createServer();
 * const router = createRouter({ server, prefix: "/api" });
 *
 * router.get("/hello", (event) => {
 *   return new Response("Hello World");
 * }); // This route will be available at http://localhost:8080/api/hello
 *
 * server.use(router.handler());
 *
 * server.listen({ port: 8080 });
 * ```
 */

export function createRouter<
  Prefix extends string,
  RouterState extends BaseState,
  ServerState extends BaseState
>({
  prefix = "" as Prefix,
  state = {} as RouterState,
  server,
  autoRegister = true,
}: {
  prefix?: Prefix;
  state?: RouterState;
  server?: Server<ServerState>;
  autoRegister?: boolean;
} = {}) {
  const router = new Router({
    prefix,
    state,
  }) as Router<Prefix, ServerState & RouterState>;

  if (server && autoRegister) {
    server.use(router.handler());
  }

  return router;
}
