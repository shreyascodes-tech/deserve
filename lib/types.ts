import {
  ServeInit,
  ServeTlsInit,
  Status,
} from "https://deno.land/std@0.181.0/http/mod.ts";

export { Status };

export type ListenOptions = ServeInit;
export type ListenTlsOptions = ServeTlsInit;

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";

export type RequestEvent<Params extends Record<string, string>> = {
  request: Request;
  params: Params;
  method: Method;
  headers: Headers;
};

export type PromiseOr<T> = T | Promise<T>;

export type BaseParams = Record<string, string>;

export type Handler<Params extends BaseParams> = (
  event: RequestEvent<Params>
) => PromiseOr<Response | void>;
