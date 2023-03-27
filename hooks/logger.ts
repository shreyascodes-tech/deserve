import { Hook, RequestEvent, Status } from "../mod.ts";

export type LoggerOptions = {
  format?:
    | string
    | ((
        event: RequestEvent,
        time_in_ms: number,
        res: Response | void | undefined
      ) => string);
};

const formats = [
  ":method",
  ":url",
  ":path",
  ":status",
  ":res[content-length]",
  ":res[content-type]",
  ":res[time_ms]",
] as const;

function f(format: string) {
  return function (
    event: RequestEvent,
    time_in_ms: number,
    res?: Response | void
  ) {
    return format
      .split(" ")
      .map((segment) => {
        if (formats.includes(segment as typeof formats[number])) {
          switch (segment) {
            case ":method":
              return event.method;
            case ":url":
              return event.request.url;
            case ":path":
              return event.url.pathname;
            case ":status":
              return res?.status ?? Status.NotFound.toString();
            case ":res[content-length]":
              return res?.headers.get("content-length") ?? "";
            case ":res[content-type]":
              return res?.headers.get("content-type") ?? "";
            case ":res[time_ms]":
              return time_in_ms;
          }
        }
        return segment;
      })
      .join(" ");
  };
}

function defaultFormat(
  event: RequestEvent,
  time_in_ms: number,
  res: Response | void | undefined
) {
  return `${new Date().toLocaleDateString()} ${event.method}[${
    res?.status ?? 404
  }] ${event.url.pathname} ${time_in_ms}ms`;
}

export function createLogger(
  options: LoggerOptions = {
    format: defaultFormat,
  }
): Hook {
  const format =
    typeof options.format === "string" ? f(options.format) : options.format;

  return async function $loggerHook(event, resolve) {
    const start = Date.now();
    const res = await resolve(event);

    const time = Date.now() - start;
    console.log(format?.(event, time, res));

    return res;
  };
}
