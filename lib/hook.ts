// deno-lint-ignore-file ban-types
import { RouteHandler } from "./handler.ts";

export interface Hook<R extends string = string, CtxExtensions = {}> {
  preHandler?: RouteHandler<R, CtxExtensions>;
  postHandler?: RouteHandler<
    R,
    CtxExtensions & { response: Response | undefined }
  >;
}
