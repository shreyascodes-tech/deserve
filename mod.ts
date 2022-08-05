import {
  bold,
  brightMagenta,
  magenta,
} from "https://deno.land/std@0.151.0/fmt/colors.ts";
import { serve, ServeInit } from "https://deno.land/std@0.151.0/http/server.ts";
import { DeserveConfig, PromiseOr } from "./src/types.ts";
import { useURL } from "./src/utils.ts";

function defaultOnListenHandler(params: { hostname: string; port: number }) {
  const hostname =
    params.hostname === "0.0.0.0" ? "localhost" : params.hostname;

  const url = `http://${hostname}:${params.port}/`;

  console.log(`${magenta("Listening on")} ${bold(brightMagenta(url))}`);
}

function defaultErrorHandler(error: unknown) {
  console.error(error);
  return new Response("Internal Server Error", { status: 500 });
}

class Deserve {
  constructor(private config: DeserveConfig) {}

  async #requestHandler(request: Request) {
    const { pathname } = useURL(request);
    let resp: PromiseOr<Response> = new Response(
      `Cannot ${request.method} ${pathname}`
    );

    for (const { initial } of this.config.hooks) {
      const res = await initial(request);
      if (res === null || res === undefined) continue;
      resp = res;
      break;
    }

    for (const handler of this.config.handlers) {
      const res = await handler(request);
      if (res === null || res === undefined) continue;
      resp = res;
      break;
    }

    for (const { final } of this.config.hooks) {
      final(request);
    }

    return resp;
  }

  listen(init: ServeInit) {
    return serve(this.#requestHandler.bind(this), {
      onListen: defaultOnListenHandler,
      onError: defaultErrorHandler,
      ...init,
    });
  }
}

export function deserve(config: Partial<DeserveConfig>) {
  return new Deserve({
    handlers: config.handlers ?? [],
    hooks: config.hooks ?? [],
  });
}

export * from "./src/types.ts";
export * from "./src/hooks.ts";
export * from "./src/utils.ts";
export * from "./src/router.ts";
