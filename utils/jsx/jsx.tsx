// deno-lint-ignore-file ban-types
/** @jsx h */
/** @jsxFrag Fragment */
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.2";
import { h, Fragment, VNode } from "./preact.ts";
import { HEAD_ATOM } from "./head.tsx";

export interface RenderJSXOptions {
  html?: h.JSX.HTMLAttributes<HTMLHtmlElement>;
  headAttrs?: h.JSX.HTMLAttributes<HTMLHeadElement>;
  bodyAttrs?: h.JSX.HTMLAttributes<HTMLBodyElement>;
}

export interface JSXOptions extends RenderJSXOptions {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
}

function renderJSX(body: VNode<{}>) {
  HEAD_ATOM.set([]);

  const bodyStr = renderToString(body);
  const headStr = renderToString(<>{HEAD_ATOM.get()}</>);

  return { head: headStr, body: bodyStr };
}

function generateHTML(
  head: string,
  body: string,
  options: RenderJSXOptions = {}
) {
  const htmlOpts: h.JSX.HTMLAttributes<HTMLHtmlElement> = {
    lang: "en",
    ...(options.html ?? {}),
  };

  const headStr =
    renderToString(
      <>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </>
    ) + head;

  const html = renderToString(
    <html {...htmlOpts}>
      <head
        {...(options.headAttrs ?? {})}
        dangerouslySetInnerHTML={{ __html: headStr }}
      />
      <body
        {...(options.bodyAttrs ?? {})}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </html>
  );

  return "<!DOCTYPE html>" + html;
}

export interface CreateJSXOptions {
  transformBody?(body: VNode<{}>): VNode;
  transformBodyStr?(body: string): string | Promise<string>;
  transformHeadStr?(head: string, body: string): string | Promise<string>;
}

export function createJsx(createOptions: CreateJSXOptions = {}) {
  return async function $jsx(body: VNode<{}>, options: JSXOptions = {}) {
    body = createOptions.transformBody?.(body) ?? body;
    let { body: bodyStr, head: headStr } = renderJSX(body);

    bodyStr = (await createOptions.transformBodyStr?.(bodyStr)) ?? bodyStr;
    headStr =
      (await createOptions.transformHeadStr?.(headStr, bodyStr)) ?? headStr;

    const html = generateHTML(headStr, bodyStr, options);

    const headers = new Headers(options.headers);
    headers.append("Content-Type", "text/html; charset=utf-8");

    return new Response(html, {
      headers,
      status: options.status,
      statusText: options.statusText,
    });
  };
}

export const jsx = createJsx();

export { renderToString as renderJSXToString } from "https://esm.sh/preact-render-to-string@5.2.2";
