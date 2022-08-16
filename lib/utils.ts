import {
  bold,
  brightBlue,
  brightGreen,
  brightMagenta,
  brightYellow,
  magenta,
} from "https://deno.land/std@0.151.0/fmt/colors.ts";
import { Hook } from "./types.ts";

export function defaultOnListenHandler(params: {
  hostname: string;
  port: number;
}) {
  const hostname =
    params.hostname === "0.0.0.0" ? "localhost" : params.hostname;

  const url = `http://${hostname}:${params.port}/`;

  console.log(`${magenta("Listening on")} ${bold(brightMagenta(url))}`);
}

export function defaultErrorHandler(error: unknown) {
  console.error(error);
  return new Response("Internal Server Error", { status: 500 });
}

export function createLogger(): Hook {
  let start: number;

  return {
    preHandler() {
      start = Date.now();
    },
    postHandler(req, ctx) {
      const { pathname } = new URL(req.url);
      const time = Date.now() - start;
      const status = ctx.response?.status;
      console.log(
        `${brightGreen(req.method)} | ${brightMagenta(
          status?.toString() ?? ""
        )} | ${brightYellow(pathname)} - ${brightBlue(`${time}ms`)}`
      );
    },
  };
}

export function response(
  body?: BodyInit | null | undefined,
  init?: ResponseInit | undefined
) {
  return new Response(body, init);
}
