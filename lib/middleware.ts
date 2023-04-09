import { RequestEvent } from "./event.ts";
import { BaseParams, BaseState, Hook, Handler } from "./types.ts";

export async function executeHooks<State extends BaseState = BaseState>(
  hooks: Hook<State>[],
  event: RequestEvent<BaseParams, State>,
  handler: Handler<string, State, BaseParams>,
  i = 0
): Promise<Response | undefined | void> {
  if (hooks.length === 0 || i >= hooks.length) return await handler(event);

  return await hooks[i](event, async (event) => {
    return await executeHooks(hooks, event, handler, i + 1);
  });
}
