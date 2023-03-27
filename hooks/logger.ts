import { Hook, RequestEvent, Status } from "../mod.ts";

export type LoggerOptions = {
  format?:
    | string
    | ((
        event: RequestEvent,
        time_in_ms: number,
        res: Response | void | undefined
      ) => string);
  writer?: WritableStream;
};

const formats = [
  ":date",
  ":method",
  ":url",
  ":path",
  ":status",
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
            case ":date":
              return new Date().toLocaleDateString();
            case ":method":
              return event.method;
            case ":url":
              return event.request.url;
            case ":path":
              return event.url.pathname;
            case ":status":
              return res?.status ?? Status.NotFound.toString();
            case ":res[content-type]":
              return res?.headers.get("Content-Type") ?? "";
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
    writer: Deno.stdout.writable,
  }
): Hook {
  const format = options.format
    ? typeof options.format === "string"
      ? f(options.format)
      : options.format
    : defaultFormat;
  const logWriter = new TextEncoderStream();
  logWriter.readable.pipeTo(options.writer ?? Deno.stdout.writable);
  const writable = logWriter.writable.getWriter();

  const log = (msg?: string) => {
    return writable.write(msg + "\n");
  };

  return async function $loggerHook(event, resolve) {
    const start = Date.now();
    const res = await resolve(event);

    const time = Date.now() - start;
    await log(format?.(event, time, res));

    return res;
  };
}
