import {
  getCookies,
  setCookie,
  deleteCookie,
} from "https://deno.land/std@0.181.0/http/mod.ts";
import { Cookie } from "./types.ts";

export type CookieOptions = Omit<Cookie, "name" | "value">;

class Cookies {
  constructor(private readonly request: Request, private headers: Headers) {}

  getAll() {
    return getCookies(this.request.headers);
  }

  get(name: string) {
    return getCookies(this.request.headers)[name];
  }

  set(name: string, value: string, options?: CookieOptions) {
    setCookie(this.request.headers, { name, value, ...options });
  }

  delete(
    name: string,
    options?: {
      path?: string | undefined;
      domain?: string | undefined;
    }
  ) {
    deleteCookie(this.headers, name, options);
  }
}

export function createCookies(request: Request, headers: Headers): Cookies {
  return new Cookies(request, headers);
}

export type { Cookies };
