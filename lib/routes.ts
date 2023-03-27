import { RequestEvent, setParams } from "./event.ts";
import { BaseParams, BaseState, Handler, Method } from "./types.ts";
import { joinURL } from "https://esm.sh/ufo@1.1.1";

export class Routes {
  private paths: (string | undefined)[] = [];
  private methods: (Method | undefined)[] = [];
  private handlers: Handler<string, BaseState, BaseParams>[][] = [];

  constructor(public prefix?: string) {}

  addHandlers(
    handlers: Handler<string, BaseState, BaseParams>[],
    path?: string,
    method?: Method
  ) {
    this.paths.push(path);
    this.methods.push(method);
    this.handlers.push(handlers);
  }

  handleEvent(event: RequestEvent<BaseParams>) {
    const { pathname } = new URL(event.request.url);

    for (let i = 0; i < this.handlers.length; i++) {
      const method = this.methods[i];
      const handlers = this.handlers[i];
      const pattern = new URLPattern({
        pathname: joinURL(this.prefix ?? "/", this.paths[i] ?? "/**") || "/",
      });

      const match = pattern?.exec(pathname, event.request.url) ?? undefined;

      if (pattern && !match) {
        continue;
      }
      if (method && method !== event.request.method) {
        continue;
      }

      if (pattern) {
        setParams(event, match!.pathname.groups);
      } else {
        setParams(event, {});
      }

      for (const handler of handlers) {
        const result = handler(event);

        if (result) {
          return result;
        }
      }
    }
  }
}
