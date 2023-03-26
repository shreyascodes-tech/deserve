import { Status, BaseParams, BaseState } from "./types.ts";
import { createCookies, Cookies } from "./cookies.ts";

/**
 * The Method type represents the HTTP method of the request.
 * It can be one of the following values:
 *  - GET
 *  - POST
 *  - PUT
 *  - DELETE
 *  - PATCH
 *  - HEAD
 *  - OPTIONS
 */
export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

class Event<
  Params extends BaseParams = BaseParams,
  State extends BaseState = BaseState
> {
  constructor(
    public readonly request: Request,
    public readonly params: Params,
    public readonly method: Method,
    public readonly headers: Headers,
    public readonly cookies: Cookies,
    public readonly state: State = {} as State
  ) {}
}

export function setParams<Params extends BaseParams = BaseParams>(
  ev: Event,
  params: Params
) {
  // @ts-ignore - we are mutating the event
  ev.params = params;
}

export function setState<State extends BaseState = BaseState>(
  ev: Event,
  state: State
) {
  // @ts-ignore - we are mutating the event
  ev.state = state;
}

export function createResponse(ev: Event, response?: Response) {
  if (!response) {
    return new Response("Not Found", {
      status: Status.NotFound,
      headers: ev.headers,
    });
  }

  response.headers.forEach((value, key) => {
    ev.headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers: ev.headers,
    statusText: response.statusText,
  });
}

/**
 * The RequestEvent type represents the event object passed to the `Handler` function.
 * It contains the following properties:
 *  - `request`: the request object
 *  - `params`: the params extracted from the url (if any)
 *  - `method`: the request method
 *  - `headers`: the response headers
 *  - `cookies`: the cookies
 *    - `get`: a function to get a cookie by name from the request
 *    - `getAll`: a function to get all the cookies from the request
 *    - `set`: a function to set a cookie on the response
 *    - `delete`: a function to delete a cookie on the response
 *   - `state`: the state object that is shared across all the middleware functions
 *
 */
export type RequestEvent<
  Params extends Record<string, string>,
  State extends BaseState = BaseState
> = Event<Params, State>;
export function createRequestEvent<State extends BaseState = BaseState>(
  request: Request,
  state: State
) {
  const headers = new Headers();
  const cookies = createCookies(request, headers);
  return new Event(
    request,
    {},
    request.method.toUpperCase() as Method,
    headers,
    cookies,
    state
  );
}
