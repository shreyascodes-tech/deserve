export type {
  Context,
  DeserveApp,
  Handler,
  Hook,
  Method,
  ParamsDictionary,
  //   PromiseOr, // This is Internal
  Route,
  RouteHandler,
  RouteParameters,
} from "./types/core.ts";
export type { AppRouter } from "./types/router.ts";
export * from "./types/static.ts";

/**
 * import { createApp, createRouter, redirect, cookie, jsx } from "deserve"
 * import { listen, static, file } from "deserve/deno"
 * const app = createApp()
 *
 * const router = createRouter()
 * router.get("/", () => "Hello World")
 * router.put("/", () => redirect("/"))
 * router.post("/", file("file.txt"))
 *
 * app.use(router.routes())
 *
 * app.listen({ port: 3333 })
 */
